import { chatJson } from "../ai";
import type { TalentIntelligenceResult } from "../types";

const SYSTEM_PROMPT = `You are Recruitimate's Talent Intelligence Engine.
Extract structured hiring signals from resume/CV text. Be explainable — cite evidence from the text.
Never claim certainty about truthfulness. Output valid JSON only with this shape:
{
  "skills": string[],
  "experienceYears": number | null,
  "roleFitScore": number (0-1),
  "strengths": string[],
  "gaps": string[],
  "hiddenSignals": [{ "label": string, "value": string, "evidence": string, "confidence": "low"|"medium"|"high" }],
  "explanation": string
}`;

function heuristicAnalysis(
  resumeText: string,
  jobRequirements?: string | null
): TalentIntelligenceResult {
  const lower = resumeText.toLowerCase();
  const skillKeywords = [
    "typescript",
    "python",
    "react",
    "node",
    "postgres",
    "aws",
    "docker",
    "kubernetes",
    "distributed",
    "leadership",
    "machine learning",
  ];
  const skills = skillKeywords.filter((s) => lower.includes(s));
  const yearsMatch = resumeText.match(/(\d+)\+?\s*years?/i);
  const experienceYears = yearsMatch ? parseInt(yearsMatch[1], 10) : null;

  let roleFitScore = 0.55;
  if (jobRequirements) {
    const reqLower = jobRequirements.toLowerCase();
    const matched = skillKeywords.filter(
      (s) => lower.includes(s) && reqLower.includes(s)
    );
    roleFitScore = Math.min(0.95, 0.4 + matched.length * 0.1);
  }

  return {
    skills: skills.length ? skills : ["generalist"],
    experienceYears,
    roleFitScore,
    strengths: skills.slice(0, 3).map((s) => `Demonstrated ${s} experience`),
    gaps: jobRequirements
      ? ["Verify depth on role-specific requirements in interview"]
      : ["No job requirements provided for fit comparison"],
    hiddenSignals: [
      {
        label: "Career signal",
        value: experienceYears ? `${experienceYears}+ years indicated` : "Experience depth unclear",
        evidence: yearsMatch?.[0] ?? "No explicit tenure found in resume",
        confidence: yearsMatch ? "medium" : "low",
      },
    ],
    explanation:
      "Heuristic analysis (no API key). Connect OPENAI_API_KEY for AI-powered skill graph and trajectory modeling.",
  };
}

export async function analyzeTalent(
  resumeText: string,
  jobTitle?: string,
  jobRequirements?: string | null
): Promise<TalentIntelligenceResult> {
  const fallback = heuristicAnalysis(resumeText, jobRequirements);

  const userPrompt = `Job: ${jobTitle ?? "General"}
Requirements: ${jobRequirements ?? "Not specified"}

Resume:
${resumeText.slice(0, 12000)}`;

  return chatJson<TalentIntelligenceResult>(SYSTEM_PROMPT, userPrompt, fallback);
}
