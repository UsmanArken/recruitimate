import asyncio
import logging
from datetime import datetime

from app.workers.celery_app import celery
from app.core.database import get_sync_session_factory
from app.shared.models import Candidate, Decision, InterviewAnalysis, Job, JobApplication, TalentProfile, Interview, PipelineStage, InterviewStatus  # noqa: F401

logger = logging.getLogger(__name__)


if celery is None:
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
        from app.features.intelligence.types import AudioResult

        settings = get_settings()
        audio_path = None
        s3 = None
        r2_key = None

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
                        selectinload(JobApplication.job),
                        selectinload(JobApplication.talent_profile),
                    )
                )
                app = app_result.scalar_one_or_none()
                transcript = interview.transcript or ""
                resume_text = (app.candidate.resumeText if app and app.candidate else "") or ""
                job_requirements = ""
                if app and app.job:
                    job_requirements = (app.job.requirements or app.job.description or "") or ""

                # ── Call 2: Audio analysis (Gemini multimodal) ──────────────────
                audio_result: AudioResult | None = None
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
                        tmp.close()
                        s3.download_file(settings.R2_BUCKET_NAME, r2_key, tmp_path)
                        audio_path = tmp_path
                        audio_result = _run_gemini_audio(
                            audio_path, settings.GOOGLE_API_KEY,
                            settings.GOOGLE_AUDIO_MODEL, transcript,
                        )
                    except Exception:
                        logger.exception("Audio download/analysis failed for interview %s", interview_id)

                # ── Call 3: Transcript + cross-signal ──────────────────────────
                from app.features.intelligence.engines import run_transcript_analysis
                transcript_result = asyncio.run(run_transcript_analysis(transcript, resume_text))

                # ── Call 5: Interviewer quality ────────────────────────────────
                from app.features.intelligence.engines import run_interviewer_quality
                iq_result = asyncio.run(run_interviewer_quality(transcript))

                # ── Upsert InterviewAnalysis ───────────────────────────────────
                analysis = db.execute(
                    select(InterviewAnalysis).where(InterviewAnalysis.interviewId == interview_id)
                ).scalar_one_or_none()
                if not analysis:
                    analysis = InterviewAnalysis(interviewId=interview_id)
                    db.add(analysis)

                # Audio scores
                if audio_result:
                    analysis.confidenceScore = audio_result.confidenceScore
                    analysis.clarityScore = audio_result.clarityScore
                    analysis.pacingScore = audio_result.pacingScore
                    analysis.fillerScore = audio_result.fillerScore
                    analysis.energyLevel = audio_result.energyLevel
                    analysis.dominantTone = audio_result.dominantTone
                    analysis.emotionalVariance = audio_result.emotionalVariance

                # Transcript + cross-signal scores
                analysis.truthfulnessScore = transcript_result.truthfulnessScore
                analysis.depthScore = transcript_result.depthScore
                analysis.resumeConsistencyScore = transcript_result.resumeConsistencyScore
                analysis.inconsistencies = transcript_result.inconsistencies
                analysis.depthNotes = transcript_result.depthNotes
                analysis.workStyleNotes = transcript_result.workStyleNotes
                analysis.riskFlags = transcript_result.riskFlags

                # Interviewer quality
                analysis.interviewerQuality = {
                    "coverageScore": iq_result.coverageScore,
                    "probingDepthScore": iq_result.probingDepthScore,
                    "biasAdvisory": iq_result.biasAdvisory,
                    "summary": iq_result.summary,
                }

                interview.status = InterviewStatus.ANALYZED
                interview.updatedAt = datetime.utcnow()

                # ── Call 4: Decision (requires talent profile) ─────────────────
                if app and app.talent_profile:
                    from app.features.intelligence.engines import run_decision_intelligence
                    from app.features.intelligence.types import TalentResult
                    tp = app.talent_profile
                    talent = TalentResult(
                        skills=tp.skills or [],
                        matchedSkills=tp.matchedSkills or [],
                        missingSkills=tp.missingSkills or [],
                        extraSkills=tp.extraSkills or [],
                        experienceYears=tp.experienceYears,
                        roleFitScore=tp.roleFitScore,
                        strengths=tp.strengths or [],
                        gaps=tp.gaps or [],
                        hiddenSignals=tp.hiddenSignals or [],
                    )
                    decision_result = asyncio.run(run_decision_intelligence(
                        resume_text=resume_text,
                        transcript=transcript,
                        job_requirements=job_requirements,
                        talent=talent,
                        transcript_result=transcript_result,
                        audio=audio_result,
                    ))

                    dec = db.execute(
                        select(Decision).where(Decision.applicationId == app.id)
                    ).scalar_one_or_none()
                    if not dec:
                        dec = Decision(applicationId=app.id)
                        db.add(dec)

                    dec.recommendation = decision_result.recommendation
                    dec.explanation = decision_result.explanation
                    dec.reasonsToHire = decision_result.reasonsToHire
                    dec.reasonsToReject = decision_result.reasonsToReject

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


    def _run_gemini_audio(
        audio_path: str,
        api_key: str,
        model_name: str = "gemini-2.0-flash",
        transcript: str = "",
    ):
        """Run Gemini multimodal audio analysis. Returns AudioResult or None on failure."""
        import json
        import google.generativeai as genai
        from app.features.intelligence.types import AudioResult

        if not api_key:
            logger.warning("GOOGLE_API_KEY not set — skipping Gemini audio analysis")
            return None

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name)
            audio_file = genai.upload_file(audio_path, mime_type="audio/wav")
            transcript_section = f"\n\nTRANSCRIPT (for alignment):\n{transcript}" if transcript else ""
            prompt = (
                "You are an expert speech analyst. Analyse this job interview audio recording "
                "and return whole-interview scores for the candidate only (not the interviewer)."
                + transcript_section
                + "\n\nReturn ONLY valid JSON with exactly this structure:\n"
                "{\n"
                '  "confidenceScore": <0-100; anchor: 90+ = consistently assertive tone, minimal hedging, '
                'direct answers; 50-70 = mix of confident and uncertain delivery; below 50 = frequent '
                'hesitation, trailing off, upward inflection on statements>,\n'
                '  "clarityScore": <0-100; anchor: 90+ = articulate, well-paced, easy to follow; '
                '50-70 = mostly clear with some mumbling or run-on sentences; below 50 = frequently '
                'unclear, hard to follow, poor articulation>,\n'
                '  "pacingScore": <0-100; 50 is ideal conversational pace; score decreases symmetrically '
                'as pace deviates — rushing through answers scores as low as speaking too slowly>,\n'
                '  "fillerScore": <0-100; inverted — fewer filler words (um, uh, like, you know) = higher score; '
                '100 = no fillers; 70 = occasional fillers; below 50 = frequent fillers that disrupt flow>,\n'
                '  "energyLevel": <0.0-1.0; 0.8-1.0 = high vocal energy, enthusiastic and engaged; '
                '0.4-0.7 = moderate energy, present but not animated; below 0.4 = flat, low energy, '
                'monotone delivery>,\n'
                '  "dominantTone": "<single word describing the overall emotional register of the candidate '
                "throughout the interview; choose the most accurate from: confident, nervous, enthusiastic, "
                'flat, defensive, engaged, hesitant, polished, or use another single word if none fit>",\n'
                '  "emotionalVariance": <0.0-1.0; measures the range of emotional expression — '
                '0.8-1.0 = wide range, candidate sounds very different across topics; '
                '0.3-0.6 = moderate natural variation; below 0.3 = consistently flat with little variation>\n'
                "}\n"
                "Base all scores strictly on audio signals — tone, pace, energy, filler words, hesitations. "
                "Do not infer from the content of what was said. No extra fields."
            )
            generation_config = {"max_output_tokens": 1024}
            response = model.generate_content([prompt, audio_file], generation_config=generation_config)
            raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
            parsed = json.loads(raw)
            return AudioResult(
                confidenceScore=parsed.get("confidenceScore"),
                clarityScore=parsed.get("clarityScore"),
                pacingScore=parsed.get("pacingScore"),
                fillerScore=parsed.get("fillerScore"),
                energyLevel=parsed.get("energyLevel"),
                dominantTone=parsed.get("dominantTone"),
                emotionalVariance=parsed.get("emotionalVariance"),
            )
        except Exception:
            logger.exception("Gemini audio analysis failed")
            return None
