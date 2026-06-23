/** Shared skill vocabulary for discovery, search, and suggest heuristics. */
export const TALENT_SKILL_KEYWORDS = [
  "typescript",
  "javascript",
  "python",
  "java",
  "go",
  "golang",
  "rust",
  "react",
  "next.js",
  "node",
  "postgres",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
  "distributed",
  "system design",
  "microservices",
  "api",
  "graphql",
  "rest",
  "sql",
  "machine learning",
  "data engineering",
  "etl",
  "spark",
  "kafka",
  "leadership",
  "product management",
  "stakeholder",
  "analytics",
  "backend",
  "frontend",
  "full stack",
  "devops",
  "ci/cd",
  "security",
  "mobile",
  "ios",
  "android",
] as const;

export function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found = TALENT_SKILL_KEYWORDS.filter((skill) => lower.includes(skill));
  return found.length ? [...new Set(found)] : [];
}

export function parseExperienceYears(text: string): number | null {
  const match = text.match(/(\d+)\+?\s*years?/i);
  return match ? parseInt(match[1], 10) : null;
}
