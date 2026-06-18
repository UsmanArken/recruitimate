from dataclasses import dataclass, field
from typing import Any


@dataclass
class TalentResult:
    skills: list[str] = field(default_factory=list)
    matchedSkills: list[str] = field(default_factory=list)
    missingSkills: list[str] = field(default_factory=list)
    extraSkills: list[str] = field(default_factory=list)
    experienceYears: int | None = None
    roleFitScore: float | None = None
    strengths: list[str] = field(default_factory=list)
    gaps: list[str] = field(default_factory=list)
    hiddenSignals: list[str] = field(default_factory=list)
    explanation: str = ""


@dataclass
class InterviewResult:
    hesitationScore: float | None = None
    confidenceScore: float | None = None
    clarityScore: float | None = None
    consistencyScore: float | None = None
    engagementScore: float | None = None
    cognitiveSignals: dict[str, Any] = field(default_factory=dict)
    behavioralMetrics: dict[str, Any] = field(default_factory=dict)
    riskFlags: list[str] = field(default_factory=list)
    interviewerQuality: dict[str, Any] = field(default_factory=dict)
    rawAnalysis: dict[str, Any] = field(default_factory=dict)


@dataclass
class DecisionResult:
    hireConfidence: float | None = None
    recommendation: str = ""
    riskFactors: list[str] = field(default_factory=list)
    comparisonNotes: str = ""
    explanation: str = ""
    signalBreakdown: dict[str, Any] = field(default_factory=dict)


@dataclass
class LiveAssistResult:
    followUpQuestions: list[str] = field(default_factory=list)
    hints: list[str] = field(default_factory=list)
    redFlags: list[str] = field(default_factory=list)


@dataclass
class CrossSignalResult:
    consistencyScore: float | None = None
    inconsistencies: list[str] = field(default_factory=list)
    explanation: str = ""


@dataclass
class InterviewerQualityResult:
    coverageScore: float | None = None
    probingDepthScore: float | None = None
    biasAdvisory: list[str] = field(default_factory=list)
    summary: str = ""


@dataclass
class InconsistencyResult:
    consistencyScore: float | None = None
    evidence: list[str] = field(default_factory=list)
    explanation: str = ""
