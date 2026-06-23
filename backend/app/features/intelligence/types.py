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


@dataclass
class AudioResult:
    confidenceScore: float | None = None
    clarityScore: float | None = None
    pacingScore: float | None = None
    fillerScore: float | None = None
    energyLevel: float | None = None
    dominantTone: str | None = None
    emotionalVariance: float | None = None


@dataclass
class TranscriptResult:
    truthfulnessScore: float | None = None
    depthScore: float | None = None
    resumeConsistencyScore: float | None = None
    inconsistencies: list[str] = field(default_factory=list)
    depthNotes: list[str] = field(default_factory=list)
    workStyleNotes: list[str] = field(default_factory=list)
    riskFlags: list[str] = field(default_factory=list)


@dataclass
class DecisionResult:
    recommendation: str = "HOLD"
    explanation: str = ""
    reasonsToHire: list[str] = field(default_factory=list)
    reasonsToReject: list[str] = field(default_factory=list)


@dataclass
class InterviewerQualityResult:
    coverageScore: float | None = None
    probingDepthScore: float | None = None
    biasAdvisory: list[str] = field(default_factory=list)
    summary: str = ""


@dataclass
class LiveAssistResult:
    followUpQuestions: list[str] = field(default_factory=list)
