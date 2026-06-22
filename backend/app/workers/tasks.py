import asyncio
import logging
from datetime import datetime

from app.workers.celery_app import celery
from app.core.database import get_sync_session_factory
from app.shared.models import Candidate, Decision, InterviewAnalysis, Job, JobApplication, TalentProfile, Interview, PipelineStage, InterviewStatus  # noqa: F401

logger = logging.getLogger(__name__)


if celery is None:
    # Celery not installed — provide stubs so callers can do .delay(...)
    class _Stub:
        def __init__(self, name: str):
            self._name = name

        def delay(self, *args, **kwargs):
            logger.warning("Celery not available — skipping background task: %s", self._name)

    score_application = _Stub("score_application")
    process_interview_audio = _Stub("process_interview_audio")

else:
    @celery.task(bind=True, max_retries=3, default_retry_delay=30)
    def score_application(self, application_id: str) -> dict:
        Session = get_sync_session_factory()
        with Session() as db:
            try:
                application = db.get(JobApplication, application_id)
                if not application:
                    return {"error": "Application not found"}

                candidate = db.get(Candidate, application.candidateId) if application.candidateId else None
                if not candidate or not candidate.resumeText:
                    return {"error": "No resume text to score"}

                job = db.get(Job, application.jobId) if application.jobId else None
                job_requirements = (job.requirements or job.description or "") if job else ""

                from app.features.intelligence.engines import run_talent_intelligence
                result = asyncio.run(run_talent_intelligence(candidate.resumeText, job_requirements))

                existing = (
                    db.query(TalentProfile)
                    .filter(TalentProfile.applicationId == application_id)
                    .first()
                )
                if existing:
                    existing.skills = result.skills
                    existing.matchedSkills = result.matchedSkills
                    existing.missingSkills = result.missingSkills
                    existing.extraSkills = result.extraSkills
                    existing.experienceYears = result.experienceYears
                    existing.roleFitScore = result.roleFitScore
                    existing.strengths = result.strengths
                    existing.gaps = result.gaps
                    existing.hiddenSignals = result.hiddenSignals
                    existing.explanation = result.explanation
                    existing.updatedAt = datetime.utcnow()
                else:
                    profile = TalentProfile(
                        applicationId=application_id,
                        skills=result.skills,
                        matchedSkills=result.matchedSkills,
                        missingSkills=result.missingSkills,
                        extraSkills=result.extraSkills,
                        experienceYears=result.experienceYears,
                        roleFitScore=result.roleFitScore,
                        strengths=result.strengths,
                        gaps=result.gaps,
                        hiddenSignals=result.hiddenSignals,
                        explanation=result.explanation,
                    )
                    db.add(profile)

                application.stage = PipelineStage.TALENT_REVIEW
                application.updatedAt = datetime.utcnow()

                score = result.roleFitScore or 0
                if (
                    job
                    and job.interviewMode == "automated"
                    and score >= job.autoInterviewThreshold
                ):
                    interview = Interview(
                        applicationId=application_id,
                        title="AI Interview",
                        status=InterviewStatus.SCHEDULED,
                    )
                    db.add(interview)
                    application.stage = PipelineStage.INTERVIEW_SCHEDULED

                db.commit()
                return {"status": "ok", "roleFitScore": result.roleFitScore}

            except Exception as exc:
                db.rollback()
                raise self.retry(exc=exc)

    @celery.task(name="process_interview_audio", bind=True, max_retries=2)
    def process_interview_audio(self, interview_id: str, audio_url: str) -> None:
        import os
        import tempfile
        import boto3
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.shared.models import Candidate, Decision, InterviewAnalysis, TalentProfile
        from app.core.config import get_settings

        settings = get_settings()

        try:
            Session = get_sync_session_factory()
            with Session() as db:
                interview = db.get(Interview, interview_id)
                if not interview:
                    return

                app_result = db.execute(
                    select(JobApplication)
                    .where(JobApplication.id == interview.applicationId)
                    .options(
                        selectinload(JobApplication.candidate),
                        selectinload(JobApplication.talent_profile),
                    )
                )
                app = app_result.scalar_one_or_none()
                transcript = interview.transcript or ""
                resume_text = (app.candidate.resumeText if app and app.candidate else "") or ""

                # Download audio from R2
                audio_path = None
                audio_metrics: dict = {}
                s3 = None
                r2_key = None
                if audio_url and settings.R2_ENDPOINT_URL and settings.R2_ACCESS_KEY_ID:
                    try:
                        r2_key = audio_url.replace(f"r2://{settings.R2_BUCKET_NAME}/", "")
                        s3 = boto3.client(
                            "s3",
                            endpoint_url=settings.R2_ENDPOINT_URL,
                            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                            region_name="auto",
                        )
                        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
                        tmp_path = tmp.name
                        tmp.close()  # must close before boto3 can write on Windows
                        s3.download_file(settings.R2_BUCKET_NAME, r2_key, tmp_path)
                        audio_path = tmp_path
                        audio_metrics = _run_gemini_audio(audio_path, settings.GOOGLE_API_KEY, settings.GOOGLE_AUDIO_MODEL, transcript)
                    except Exception:
                        logger.exception("Audio download/analysis failed for interview %s", interview_id)

                # Run text intelligence on transcript
                from app.features.intelligence.engines import run_interview_intelligence
                text_result = asyncio.run(run_interview_intelligence(transcript, resume_text))

                # Upsert InterviewAnalysis
                analysis = db.execute(
                    select(InterviewAnalysis).where(InterviewAnalysis.interviewId == interview_id)
                ).scalar_one_or_none()
                if not analysis:
                    analysis = InterviewAnalysis(interviewId=interview_id)
                    db.add(analysis)

                analysis.hesitationScore = text_result.hesitationScore
                analysis.confidenceScore = text_result.confidenceScore
                analysis.clarityScore = text_result.clarityScore
                analysis.consistencyScore = text_result.consistencyScore
                analysis.engagementScore = text_result.engagementScore
                analysis.cognitiveSignals = text_result.cognitiveSignals
                bm = dict(text_result.behavioralMetrics or {"workStyleNotes": []})
                if audio_metrics:
                    bm["audioMetrics"] = audio_metrics
                analysis.behavioralMetrics = bm
                analysis.riskFlags = text_result.riskFlags
                interview.status = InterviewStatus.ANALYZED
                interview.updatedAt = datetime.utcnow()

                # Cross-signal + decision if talent profile exists
                if app and app.talent_profile:
                    from app.features.intelligence.engines import run_cross_signal, run_decision_intelligence
                    from app.features.intelligence.types import TalentResult
                    tp = app.talent_profile
                    talent = TalentResult(
                        skills=tp.skills or [], strengths=tp.strengths or [],
                        gaps=tp.gaps or [], hiddenSignals=tp.hiddenSignals or [],
                        explanation=tp.explanation or "",
                    )
                    cross = asyncio.run(run_cross_signal(talent, text_result))
                    decision_result = asyncio.run(run_decision_intelligence(talent, text_result))

                    dec = db.execute(
                        select(Decision).where(Decision.applicationId == app.id)
                    ).scalar_one_or_none()
                    if not dec:
                        dec = Decision(applicationId=app.id)
                        db.add(dec)
                    dec.hireConfidence = decision_result.hireConfidence
                    dec.recommendation = decision_result.recommendation
                    dec.riskFactors = decision_result.riskFactors
                    dec.explanation = decision_result.explanation
                    dec.signalBreakdown = {
                        **decision_result.signalBreakdown,
                        "crossSignalConsistency": cross.consistencyScore,
                        "inconsistencies": cross.inconsistencies,
                        "inconsistenciesExplanation": cross.explanation,
                    }

                if app:
                    app.stage = PipelineStage.INTERVIEWED
                    app.updatedAt = datetime.utcnow()

                db.commit()

            # Delete audio from R2 after analysis (privacy)
            if audio_path and os.path.exists(audio_path):
                os.unlink(audio_path)
            if s3 is not None and r2_key:
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=r2_key)
                    logger.info("Deleted audio from R2: %s", r2_key)
                except Exception:
                    logger.warning("Failed to delete audio from R2: %s", r2_key)

        except Exception as exc:
            if audio_path and os.path.exists(audio_path):
                try:
                    os.unlink(audio_path)
                except OSError:
                    pass
            raise self.retry(exc=exc, countdown=60)


    def _run_gemini_audio(audio_path: str, api_key: str, model_name: str = "gemini-2.0-flash", transcript: str = "") -> dict:
        import json
        import google.generativeai as genai

        if not api_key:
            logger.warning("GOOGLE_API_KEY not set — skipping Gemini audio analysis")
            return {}

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name)
            audio_file = genai.upload_file(audio_path, mime_type="audio/wav")
            transcript_section = f"\n\nTRANSCRIPT (in order):\n{transcript}" if transcript else ""
            prompt = (
                "You are an expert speech analyst. Analyze this job interview audio recording."
                + transcript_section
                + "\n\nReturn ONLY valid JSON with exactly this structure:\n"
                "{\n"
                '  "sentences": [\n'
                '    {\n'
                '      "text": "<exact sentence from transcript>",\n'
                '      "speaker": "<candidate or recruiter>",\n'
                '      "paceWpm": <number>,\n'
                '      "energyLevel": <0.0-1.0>,\n'
                '      "dominantTone": "<string>",\n'
                '      "fillerDensity": <filler words per 100 words>,\n'
                '      "hesitation": <0.0-1.0>\n'
                "    }\n"
                "  ],\n"
                '  "aggregate": {\n'
                '    "paceWpm": <number>,\n'
                '    "pauseFrequency": <pauses per minute longer than 500ms>,\n'
                '    "fillerDensity": <filler words per 100 words>,\n'
                '    "energyLevel": <0.0-1.0>,\n'
                '    "dominantTone": "<string>",\n'
                '    "emotionalVariance": <0.0-1.0>\n'
                "  }\n"
                "}\n"
                "Include one entry in sentences[] for each line in the transcript. "
                "If no transcript was provided, infer sentences from the audio."
            )
            response = model.generate_content([prompt, audio_file])
            raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
            return json.loads(raw)
        except Exception:
            logger.exception("Gemini audio analysis failed")
            return {}
