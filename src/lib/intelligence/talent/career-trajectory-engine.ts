import type { CareerRoleEntry, CareerTrajectoryResult, Signal } from "../types";

const SENIORITY_KEYWORDS: { pattern: RegExp; level: number }[] = [
  { pattern: /\b(intern|trainee)\b/i, level: 1 },
  { pattern: /\b(junior|jr\.?|associate|entry)\b/i, level: 2 },
  { pattern: /\b(mid|engineer ii|developer ii)\b/i, level: 3 },
  { pattern: /\b(senior|sr\.?|staff|lead)\b/i, level: 4 },
  { pattern: /\b(principal|architect|director|head of|vp|vice president)\b/i, level: 5 },
];

const ROLE_LINE =
  /^(?:[-•*]\s*)?(.{3,60}?)(?:\s+at\s+([A-Z][\w\s&.]+?))?(?:\s*[\(\[]?\s*(\d{4})\s*[-–—]\s*(\d{4}|present|current)\s*[\)\]]?)?$/i;

function inferSeniority(title: string): number {
  for (const entry of SENIORITY_KEYWORDS) {
    if (entry.pattern.test(title)) return entry.level;
  }
  return 3;
}

function parseRolesFromText(text: string): CareerRoleEntry[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const roles: CareerRoleEntry[] = [];

  for (const line of lines) {
    if (line.length < 8 || line.length > 120) continue;
    const hasYear = /\d{4}/.test(line);
    const looksLikeRole =
      hasYear ||
      /\b(engineer|developer|manager|analyst|designer|lead|director|consultant|specialist)\b/i.test(
        line
      );
    if (!looksLikeRole) continue;

    const match = line.match(ROLE_LINE);
    const title = (match?.[1] ?? line).replace(/^[-•*]\s*/, "").trim();
    if (title.length < 4) continue;

    roles.push({
      title,
      company: match?.[2]?.trim(),
      period: match?.[3] && match?.[4] ? `${match[3]}–${match[4]}` : undefined,
      seniorityLevel: inferSeniority(title),
    });
  }

  // Deduplicate by title prefix, keep order (resume usually recent-first)
  const seen = new Set<string>();
  return roles.filter((r) => {
    const key = r.title.toLowerCase().slice(0, 24);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function computeGrowthConsistency(roles: CareerRoleEntry[]): number {
  if (roles.length < 2) return 0.45;
  const levels = roles.map((r) => r.seniorityLevel);
  // Resume often lists most recent first — reverse for chronological growth
  const chronological = [...levels].reverse();
  let upward = 0;
  let flatOrDown = 0;
  for (let i = 1; i < chronological.length; i++) {
    const delta = chronological[i] - chronological[i - 1];
    if (delta > 0) upward += 1;
    else flatOrDown += 1;
  }
  const steps = chronological.length - 1;
  return clamp01(0.35 + (upward / steps) * 0.55 - (flatOrDown / steps) * 0.15);
}

function computeTenureStability(text: string, roleCount: number): number {
  const yearSpans = [...text.matchAll(/(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi)];
  if (yearSpans.length === 0) return roleCount >= 2 ? 0.55 : 0.4;

  const tenures: number[] = [];
  const currentYear = new Date().getFullYear();
  for (const m of yearSpans) {
    const start = parseInt(m[1], 10);
    const end =
      /present|current/i.test(m[2]) ? currentYear : parseInt(m[2], 10);
    if (end >= start && end - start <= 30) tenures.push(end - start);
  }
  if (tenures.length === 0) return 0.5;
  const avg = tenures.reduce((a, b) => a + b, 0) / tenures.length;
  // 2–4 year average tenure reads as stable; very short stints lower score
  if (avg >= 2 && avg <= 5) return clamp01(0.7 + (avg - 2) * 0.05);
  if (avg < 2) return clamp01(0.3 + avg * 0.15);
  return clamp01(0.85 - (avg - 5) * 0.03);
}

function promotionVelocity(
  roles: CareerRoleEntry[]
): CareerTrajectoryResult["promotionVelocity"] {
  if (roles.length < 2) return "unknown";
  const chronological = [...roles].reverse();
  const start = chronological[0]?.seniorityLevel ?? 2;
  const end = chronological[chronological.length - 1]?.seniorityLevel ?? start;
  const delta = end - start;
  const span = chronological.filter((r) => r.period).length || roles.length;
  const rate = delta / Math.max(1, span - 1);
  if (rate >= 0.8) return "fast";
  if (rate >= 0.3) return "steady";
  if (delta <= 0) return "slow";
  return "steady";
}

/**
 * Model long-term career growth consistency from resume / LinkedIn text.
 * Heuristic and explainable — surfaces signals for talent screening.
 */
export function modelCareerTrajectory(profileText: string): CareerTrajectoryResult {
  const text = profileText.trim();
  if (text.length < 40) {
    return {
      growthConsistencyScore: 0.4,
      tenureStabilityScore: 0.4,
      promotionVelocity: "unknown",
      rolesIdentified: [],
      signals: [
        {
          label: "Insufficient history",
          value: "Not enough career text to model trajectory",
          evidence: "Add resume or LinkedIn profile with role history.",
          confidence: "high",
        },
      ],
      explanation: "Career trajectory needs more profile text with dated roles.",
    };
  }

  const roles = parseRolesFromText(text);
  const growthConsistencyScore = computeGrowthConsistency(roles);
  const tenureStabilityScore = computeTenureStability(text, roles.length);
  const velocity = promotionVelocity(roles);

  const signals: Signal[] = [];

  if (roles.length >= 2) {
    const chronological = [...roles].reverse();
    const startLevel = chronological[0].seniorityLevel;
    const endLevel = chronological[chronological.length - 1].seniorityLevel;
    if (endLevel > startLevel) {
      signals.push({
        label: "Upward progression",
        value: `Seniority grew from level ${startLevel} to ${endLevel} across ${roles.length} roles`,
        evidence: roles.map((r) => r.title).slice(0, 3).join(" → "),
        confidence: "medium",
      });
    }
    if (growthConsistencyScore >= 0.7) {
      signals.push({
        label: "Consistent growth",
        value: "Role progression shows steady upward movement",
        evidence: "Inferred from title seniority keywords over career span.",
        confidence: "medium",
      });
    }
    if (tenureStabilityScore < 0.45) {
      signals.push({
        label: "Short tenures",
        value: "Average role duration may be below typical stability band",
        evidence: "Parsed year ranges suggest frequent moves — verify context in screening.",
        confidence: "low",
      });
    }
    if (velocity === "fast") {
      signals.push({
        label: "Fast promotion velocity",
        value: "Rapid seniority gains across career timeline",
        evidence: "Multiple level jumps between early and recent roles.",
        confidence: "medium",
      });
    }
  } else {
    signals.push({
      label: "Limited role history",
      value: "Few structured roles detected — trajectory confidence is lower",
      evidence: "Use formatted resume with company, title, and dates for better modeling.",
      confidence: "medium",
    });
  }

  const parts: string[] = [];
  parts.push(`Growth consistency ${Math.round(growthConsistencyScore * 100)}%`);
  parts.push(`tenure stability ${Math.round(tenureStabilityScore * 100)}%`);
  if (velocity !== "unknown") parts.push(`${velocity} promotion velocity`);

  return {
    growthConsistencyScore,
    tenureStabilityScore,
    promotionVelocity: velocity,
    rolesIdentified: roles,
    signals,
    explanation: `${parts.join(" · ")}. Based on ${roles.length} role${roles.length === 1 ? "" : "s"} parsed from profile text.`,
  };
}
