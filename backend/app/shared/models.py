import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.utcnow()


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class RoleScope(str, enum.Enum):
    ORGANIZATION = "ORGANIZATION"
    JOB = "JOB"
    PLATFORM = "PLATFORM"


class AssignmentRole(str, enum.Enum):
    HIRING_MANAGER = "HIRING_MANAGER"
    INTERVIEWER = "INTERVIEWER"


class PipelineStage(str, enum.Enum):
    NEW = "NEW"
    TALENT_REVIEW = "TALENT_REVIEW"
    SHORTLISTED = "SHORTLISTED"
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED"
    INTERVIEWED = "INTERVIEWED"
    DECISION = "DECISION"
    HIRED = "HIRED"
    REJECTED = "REJECTED"


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ANALYZED = "ANALYZED"


# ---------------------------------------------------------------------------
# Auth / User
# ---------------------------------------------------------------------------


class User(Base):
    __tablename__ = "User"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str | None] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    emailVerified: Mapped[datetime | None] = mapped_column(DateTime)
    image: Mapped[str | None] = mapped_column(String)
    passwordHash: Mapped[str | None] = mapped_column(String)
    isPlatformAdmin: Mapped[bool] = mapped_column(Boolean, default=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    memberships: Mapped[list["OrganizationMember"]] = relationship(back_populates="user")
    job_assignments: Mapped[list["JobAssignment"]] = relationship(back_populates="user")
    notes: Mapped[list["Note"]] = relationship(back_populates="author")
    invites_sent: Mapped[list["Invite"]] = relationship(back_populates="invited_by")


# ---------------------------------------------------------------------------
# Organization & RBAC
# ---------------------------------------------------------------------------


class Organization(Base):
    __tablename__ = "Organization"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    members: Mapped[list["OrganizationMember"]] = relationship(back_populates="organization")
    jobs: Mapped[list["Job"]] = relationship(back_populates="organization")
    candidates: Mapped[list["Candidate"]] = relationship(back_populates="organization")
    invites: Mapped[list["Invite"]] = relationship(back_populates="organization")


class Role(Base):
    __tablename__ = "Role"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    scope: Mapped[RoleScope] = mapped_column(Enum(RoleScope), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)

    permissions: Mapped[list["RolePermission"]] = relationship(back_populates="role")
    members: Mapped[list["OrganizationMember"]] = relationship(back_populates="role")
    invites: Mapped[list["Invite"]] = relationship(back_populates="role")


class Permission(Base):
    __tablename__ = "Permission"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    resource: Mapped[str] = mapped_column(String, nullable=False)
    action: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    role_links: Mapped[list["RolePermission"]] = relationship(back_populates="permission")


class RolePermission(Base):
    __tablename__ = "RolePermission"
    __table_args__ = (UniqueConstraint("roleId", "permissionId"),)

    roleId: Mapped[str] = mapped_column(String, ForeignKey("Role.id"), primary_key=True)
    permissionId: Mapped[str] = mapped_column(String, ForeignKey("Permission.id"), primary_key=True)

    role: Mapped["Role"] = relationship(back_populates="permissions")
    permission: Mapped["Permission"] = relationship(back_populates="role_links")


class OrganizationMember(Base):
    __tablename__ = "OrganizationMember"
    __table_args__ = (UniqueConstraint("organizationId", "userId"),)

    organizationId: Mapped[str] = mapped_column(String, ForeignKey("Organization.id"), primary_key=True)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id"), primary_key=True)
    roleId: Mapped[str] = mapped_column(String, ForeignKey("Role.id"), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)

    organization: Mapped["Organization"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="memberships")
    role: Mapped["Role"] = relationship(back_populates="members")


class Invite(Base):
    __tablename__ = "Invite"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organizationId: Mapped[str] = mapped_column(String, ForeignKey("Organization.id"), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    token: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    roleId: Mapped[str] = mapped_column(String, ForeignKey("Role.id"), nullable=False)
    invitedById: Mapped[str | None] = mapped_column(String, ForeignKey("User.id"))
    expiresAt: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    acceptedAt: Mapped[datetime | None] = mapped_column(DateTime)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)

    organization: Mapped["Organization"] = relationship(back_populates="invites")
    role: Mapped["Role"] = relationship(back_populates="invites")
    invited_by: Mapped["User | None"] = relationship(back_populates="invites_sent")


# ---------------------------------------------------------------------------
# Job-level Access
# ---------------------------------------------------------------------------


class JobAssignment(Base):
    __tablename__ = "JobAssignment"
    __table_args__ = (UniqueConstraint("jobId", "userId", "assignmentRole"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    jobId: Mapped[str] = mapped_column(String, ForeignKey("Job.id"), nullable=False)
    userId: Mapped[str] = mapped_column(String, ForeignKey("User.id"), nullable=False)
    assignmentRole: Mapped[AssignmentRole] = mapped_column(Enum(AssignmentRole, name="JobAssignmentRole"), nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)

    job: Mapped["Job"] = relationship(back_populates="assignments")
    user: Mapped["User"] = relationship(back_populates="job_assignments")


# ---------------------------------------------------------------------------
# Hiring Domain
# ---------------------------------------------------------------------------


class Job(Base):
    __tablename__ = "Job"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organizationId: Mapped[str] = mapped_column(String, ForeignKey("Organization.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    requirements: Mapped[str | None] = mapped_column(Text)
    hiringManagerId: Mapped[str | None] = mapped_column(String, ForeignKey("User.id"))
    signupToken: Mapped[str] = mapped_column(String, unique=True, default=_uuid)
    interviewMode: Mapped[str] = mapped_column(String, default="live")
    autoInterviewThreshold: Mapped[int] = mapped_column(Integer, default=60)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    organization: Mapped["Organization"] = relationship(back_populates="jobs")
    hiring_manager: Mapped["User | None"] = relationship(foreign_keys=[hiringManagerId])
    assignments: Mapped[list["JobAssignment"]] = relationship(back_populates="job")
    applications: Mapped[list["JobApplication"]] = relationship(back_populates="job")


class Candidate(Base):
    __tablename__ = "Candidate"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organizationId: Mapped[str] = mapped_column(String, ForeignKey("Organization.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str | None] = mapped_column(String)
    linkedInUrl: Mapped[str | None] = mapped_column(String)
    linkedInText: Mapped[str | None] = mapped_column(Text)
    githubUrl: Mapped[str | None] = mapped_column(String)
    portfolioUrl: Mapped[str | None] = mapped_column(String)
    resumeText: Mapped[str | None] = mapped_column(Text)
    resumeFilePath: Mapped[str | None] = mapped_column(String)
    passwordHash: Mapped[str | None] = mapped_column(String)
    portalCreatedAt: Mapped[datetime | None] = mapped_column(DateTime)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    organization: Mapped["Organization"] = relationship(back_populates="candidates")
    applications: Mapped[list["JobApplication"]] = relationship(back_populates="candidate", cascade="all, delete-orphan")
    notes: Mapped[list["Note"]] = relationship(back_populates="candidate", cascade="all, delete-orphan")


class JobApplication(Base):
    __tablename__ = "JobApplication"
    __table_args__ = (UniqueConstraint("candidateId", "jobId"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    organizationId: Mapped[str] = mapped_column(String, ForeignKey("Organization.id"), nullable=False)
    candidateId: Mapped[str] = mapped_column(String, ForeignKey("Candidate.id"), nullable=False)
    jobId: Mapped[str] = mapped_column(String, ForeignKey("Job.id"), nullable=False)
    stage: Mapped[PipelineStage] = mapped_column(Enum(PipelineStage), default=PipelineStage.NEW)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    organization: Mapped["Organization"] = relationship()
    candidate: Mapped["Candidate"] = relationship(back_populates="applications")
    job: Mapped["Job"] = relationship(back_populates="applications")
    talent_profile: Mapped["TalentProfile | None"] = relationship(back_populates="application", uselist=False, cascade="all, delete-orphan")
    interviews: Mapped[list["Interview"]] = relationship(back_populates="application", cascade="all, delete-orphan")
    decision: Mapped["Decision | None"] = relationship(back_populates="application", uselist=False, cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Intelligence Results
# ---------------------------------------------------------------------------


class TalentProfile(Base):
    __tablename__ = "TalentProfile"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    applicationId: Mapped[str] = mapped_column(String, ForeignKey("JobApplication.id"), unique=True, nullable=False)
    skills: Mapped[list | None] = mapped_column(JSON)
    matchedSkills: Mapped[list | None] = mapped_column(JSON)
    missingSkills: Mapped[list | None] = mapped_column(JSON)
    extraSkills: Mapped[list | None] = mapped_column(JSON)
    experienceYears: Mapped[int | None] = mapped_column(Integer)
    roleFitScore: Mapped[float | None] = mapped_column(Float)
    strengths: Mapped[list | None] = mapped_column(JSON)
    gaps: Mapped[list | None] = mapped_column(JSON)
    hiddenSignals: Mapped[list | None] = mapped_column(JSON)
    explanation: Mapped[str | None] = mapped_column(Text)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    application: Mapped["JobApplication"] = relationship(back_populates="talent_profile")


class Interview(Base):
    __tablename__ = "Interview"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    applicationId: Mapped[str] = mapped_column(String, ForeignKey("JobApplication.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[InterviewStatus] = mapped_column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    scheduledAt: Mapped[datetime | None] = mapped_column(DateTime)
    durationMinutes: Mapped[int] = mapped_column(Integer, default=60)
    meetingUrl: Mapped[str | None] = mapped_column(String)
    transcript: Mapped[str | None] = mapped_column(Text)
    livekitRoomName: Mapped[str | None] = mapped_column(String)
    candidateJoinUrl: Mapped[str | None] = mapped_column(String)
    audioUrl: Mapped[str | None] = mapped_column(String)
    agentStatus: Mapped[str] = mapped_column(String, default="pending")
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    application: Mapped["JobApplication"] = relationship(back_populates="interviews")
    analysis: Mapped["InterviewAnalysis | None"] = relationship(back_populates="interview", uselist=False, cascade="all, delete-orphan")


class InterviewAnalysis(Base):
    __tablename__ = "InterviewAnalysis"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    interviewId: Mapped[str] = mapped_column(String, ForeignKey("Interview.id"), unique=True, nullable=False)
    hesitationScore: Mapped[float | None] = mapped_column(Float)
    confidenceScore: Mapped[float | None] = mapped_column(Float)
    clarityScore: Mapped[float | None] = mapped_column(Float)
    consistencyScore: Mapped[float | None] = mapped_column(Float)
    engagementScore: Mapped[float | None] = mapped_column(Float)
    cognitiveSignals: Mapped[dict | None] = mapped_column(JSON)
    behavioralMetrics: Mapped[dict | None] = mapped_column(JSON)
    riskFlags: Mapped[list | None] = mapped_column(JSON)
    interviewerQuality: Mapped[dict | None] = mapped_column(JSON)
    rawAnalysis: Mapped[dict | None] = mapped_column(JSON)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    interview: Mapped["Interview"] = relationship(back_populates="analysis")


class Decision(Base):
    __tablename__ = "Decision"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    applicationId: Mapped[str] = mapped_column(String, ForeignKey("JobApplication.id"), unique=True, nullable=False)
    hireConfidence: Mapped[float | None] = mapped_column(Float)
    recommendation: Mapped[str | None] = mapped_column(String)
    riskFactors: Mapped[list | None] = mapped_column(JSON)
    comparisonNotes: Mapped[str | None] = mapped_column(Text)
    explanation: Mapped[str | None] = mapped_column(Text)
    signalBreakdown: Mapped[dict | None] = mapped_column(JSON)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    application: Mapped["JobApplication"] = relationship(back_populates="decision")


class Note(Base):
    __tablename__ = "Note"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    candidateId: Mapped[str] = mapped_column(String, ForeignKey("Candidate.id"), nullable=False)
    authorId: Mapped[str] = mapped_column(String, ForeignKey("User.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[list | None] = mapped_column(JSON)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updatedAt: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    candidate: Mapped["Candidate"] = relationship(back_populates="notes")
    author: Mapped["User"] = relationship(back_populates="notes")
