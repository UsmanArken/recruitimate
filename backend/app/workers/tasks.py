import asyncio
import logging
from datetime import datetime

from app.workers.celery_app import celery
from app.core.database import get_sync_session_factory
from app.shared.models import Candidate, Job, JobApplication, TalentProfile, Interview, PipelineStage, InterviewStatus

logger = logging.getLogger(__name__)


if celery is None:
    # Celery not installed — provide stubs so callers can do .delay(...)
    class _Stub:
        def __init__(self, name: str):
            self._name = name

        def delay(self, *args, **kwargs):
            logger.warning("Celery not available — skipping background task: %s", self._name)

    score_candidate = _Stub("score_candidate")
    score_application = _Stub("score_application")

else:
    @celery.task(bind=True, max_retries=3, default_retry_delay=30)
    def score_candidate(self, candidate_id: str) -> dict:
        Session = get_sync_session_factory()
        with Session() as db:
            try:
                candidate = db.get(Candidate, candidate_id)
                if not candidate:
                    return {"error": "Candidate not found"}

                if not candidate.resumeText:
                    return {"error": "No resume text to score"}

                job = db.get(Job, candidate.jobId) if candidate.jobId else None

                application = (
                    db.query(JobApplication)
                    .filter(JobApplication.candidateId == candidate_id)
                    .order_by(JobApplication.createdAt.desc())
                    .first()
                )
                if not application:
                    return {"error": "No application found"}

                job_requirements = (job.requirements or job.description or "") if job else ""

                from app.features.intelligence.engines import run_talent_intelligence
                result = asyncio.run(run_talent_intelligence(candidate.resumeText, job_requirements))

                existing = (
                    db.query(TalentProfile)
                    .filter(TalentProfile.applicationId == application.id)
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
                        applicationId=application.id,
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
                        applicationId=application.id,
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
