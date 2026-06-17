import type { PipelineStage } from "@prisma/client";

export const DEMO_JOBS = [
  {
    key: "backend",
    title: "Senior Backend Engineer",
    description: `Acme Robotics builds autonomous warehouse systems. We're looking for a senior backend engineer to own our hiring pipeline APIs, real-time fleet telemetry, and integration with customer ERP systems.

You'll work with a small platform team, mentor two mid-level engineers, and partner with product on roadmap for our next-generation orchestration layer.`,
    requirements: `Required:
- 5+ years building production APIs (Node.js, Go, or Python)
- PostgreSQL and Redis in anger
- Event-driven architectures (Kafka, SQS, or similar)
- Strong system design and observability practices

Nice to have:
- Kubernetes / AWS
- Hiring or workflow SaaS domain experience`,
  },
  {
    key: "pm",
    title: "Product Manager — Fleet Software",
    description: `Lead product for Acme's fleet management console used by 40+ enterprise customers. Define roadmap, run discovery with operations leaders, and ship features that reduce downtime and improve SLA adherence.`,
    requirements: `Required:
- 4+ years B2B SaaS product management
- Data-informed prioritization and crisp PRDs
- Experience with technical buyers (engineering + operations)

Nice to have:
- Robotics, logistics, or industrial IoT background`,
  },
] as const;

export type DemoCandidateSpec = {
  key: string;
  name: string;
  email: string;
  jobKey: (typeof DEMO_JOBS)[number]["key"];
  stage: PipelineStage;
  resumeText: string;
  linkedInUrl?: string;
  talent?: {
    skills: string[];
    experienceYears: number;
    roleFitScore: number;
    strengths: string[];
    gaps: string[];
    hiddenSignals: { label: string; value: string; evidence: string; confidence: "low" | "medium" | "high" }[];
    explanation: string;
  };
  interview?: {
    title: string;
    transcript: string;
    analysis: {
      hesitationScore: number;
      confidenceScore: number;
      clarityScore: number;
      consistencyScore: number;
      engagementScore: number;
      cognitiveSignals: { label: string; value: string; evidence: string; confidence: "low" | "medium" | "high" }[];
      behavioralMetrics: { label: string; value: string; evidence: string; confidence: "low" | "medium" | "high" }[];
      riskFlags: { label: string; value: string; evidence: string; confidence: "low" | "medium" | "high" }[];
      explanation: string;
      interviewerQuality: {
        coverageScore: number;
        probingScore: number;
        biasAdvisoryScore: number;
        summary: string;
      };
    };
  };
  decision?: {
    hireConfidence: number;
    recommendation: string;
    riskFactors: string[];
    comparisonNotes: string;
    explanation: string;
    signalBreakdown: {
      resumeFit: number;
      interviewPerformance: number;
      consistency: number;
      cultureAdd: number;
    };
  };
};

export const DEMO_CANDIDATES: DemoCandidateSpec[] = [
  {
    key: "sarah",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    jobKey: "backend",
    stage: "DECISION",
    linkedInUrl: "https://linkedin.com/in/sarahchen-dev",
    resumeText: `SARAH CHEN
Senior Software Engineer | San Francisco, CA
sarah.chen@example.com | github.com/schen-backend

SUMMARY
Backend engineer with 7 years building high-throughput APIs and event pipelines at Series B–D startups. Led migration of monolith order service to Go microservices serving 12k RPS.

EXPERIENCE
Staff Engineer — Lumen Commerce (2021–Present)
- Owned checkout and inventory APIs (Node.js, PostgreSQL, Redis)
- Introduced Kafka for order events; cut p99 latency 38%
- Mentored 3 engineers; instituted on-call runbooks and SLO dashboards

Software Engineer — Fleetly (2018–2021)
- Built REST + gRPC services in Go for telematics ingestion
- Designed idempotent webhooks for partner integrations

SKILLS
Go, Node.js, TypeScript, PostgreSQL, Redis, Kafka, AWS, Kubernetes, Datadog

EDUCATION
B.S. Computer Science — UC San Diego`,
    talent: {
      skills: ["Go", "Node.js", "PostgreSQL", "Redis", "Kafka", "AWS", "System design"],
      experienceYears: 7,
      roleFitScore: 0.88,
      strengths: [
        "Direct match on event-driven architecture and PostgreSQL at scale",
        "Staff-level ownership with mentoring experience",
        "Demonstrated latency and reliability improvements with metrics",
      ],
      gaps: ["Limited explicit Kubernetes production ownership in resume"],
      hiddenSignals: [
        {
          label: "Scale signal",
          value: "12k RPS migration",
          evidence: "Resume cites concrete throughput after microservices split",
          confidence: "high",
        },
        {
          label: "Leadership",
          value: "Mentored 3 engineers",
          evidence: "Staff title with explicit mentoring bullet",
          confidence: "medium",
        },
      ],
      explanation:
        "Sarah's profile aligns strongly with the Senior Backend role: production APIs, event pipelines, and PostgreSQL/Redis at scale. Staff-level scope and measurable latency wins support a high role-fit score.",
    },
    interview: {
      title: "Technical screen — system design & backend depth",
      transcript: `Interviewer: Walk me through the Kafka migration you led at Lumen — what broke first?

Sarah: We started with the order-created topic. The first pain was consumer lag during peak — we hadn't sized partitions for Black Friday. We doubled partitions and made handlers idempotent with dedupe keys in Redis.

Interviewer: How did you handle schema changes across services?

Sarah: We used versioned protobuf events and a compatibility check in CI. Producers could add optional fields; breaking changes required a new topic with a cutover window.

Interviewer: Tell me about a production incident.

Sarah: A Redis failover caused double-charging on retries. We added idempotency tokens on payment intents and a reconciliation job that runs hourly. MTTR went from 45 minutes to under 10 after runbooks.

Interviewer: Why Acme?

Sarah: I want to work on physical-world orchestration — telemetry and hiring pipelines both need reliable async workflows. Your stack notes mention Go and Postgres, which matches what I ship today.`,
      analysis: {
        hesitationScore: 0.18,
        confidenceScore: 0.86,
        clarityScore: 0.9,
        consistencyScore: 0.88,
        engagementScore: 0.84,
        cognitiveSignals: [
          {
            label: "Structured recall",
            value: "Incident narrative with MTTR outcome",
            evidence: "Redis failover story includes concrete remediation and metric",
            confidence: "high",
          },
          {
            label: "Trade-off awareness",
            value: "Schema versioning strategy",
            evidence: "Described protobuf compatibility and topic cutover",
            confidence: "high",
          },
        ],
        behavioralMetrics: [
          {
            label: "Ownership",
            value: "Led partition sizing and idempotency fixes",
            evidence: "Uses 'we' for team but owns technical decisions",
            confidence: "medium",
          },
        ],
        riskFlags: [],
        explanation:
          "Sarah answered with specific examples that match her resume. Low hesitation, high clarity on distributed systems topics. No material contradictions detected.",
        interviewerQuality: {
          coverageScore: 0.82,
          probingScore: 0.78,
          biasAdvisoryScore: 0.95,
          summary:
            "Good depth on migration and incidents. Consider one more question on Kubernetes or on-call culture for full coverage.",
        },
      },
    },
    decision: {
      hireConfidence: 0.86,
      recommendation: "Strong hire — proceed to final loop",
      riskFactors: ["Kubernetes depth not fully validated in interview"],
      comparisonNotes:
        "Top-ranked on the backend req vs. Marcus and Priya. Interview signals reinforce resume claims on Kafka and incident response.",
      explanation:
        "High resume–role fit (0.88) plus strong interview consistency (0.88) support a confident hire recommendation. Remaining risk is shallow K8s signal — address in final round.",
      signalBreakdown: {
        resumeFit: 0.88,
        interviewPerformance: 0.87,
        consistency: 0.88,
        cultureAdd: 0.8,
      },
    },
  },
  {
    key: "marcus",
    name: "Marcus Johnson",
    email: "marcus.j@example.com",
    jobKey: "backend",
    stage: "TALENT_REVIEW",
    resumeText: `MARCUS JOHNSON
Backend Developer | Austin, TX

EXPERIENCE
Backend Developer — HealthBridge (2019–Present)
- REST APIs in Python/FastAPI for patient scheduling
- MySQL primary store; Celery for async jobs
- Integrated Stripe billing webhooks

Junior Developer — DataSprout (2017–2019)
- Internal tools in Django

SKILLS
Python, FastAPI, MySQL, Celery, Docker, basic AWS

EDUCATION
B.S. Information Systems — UT Austin`,
    talent: {
      skills: ["Python", "FastAPI", "MySQL", "Celery", "Docker", "REST APIs"],
      experienceYears: 6,
      roleFitScore: 0.72,
      strengths: [
        "Solid API and async job experience in production healthcare",
        "Webhook and billing integration experience",
      ],
      gaps: [
        "Stack is Python/MySQL vs. preferred Go/PostgreSQL",
        "No event-bus or high-throughput scale evidence",
      ],
      hiddenSignals: [
        {
          label: "Domain",
          value: "Healthcare compliance exposure",
          evidence: "HealthBridge scheduling platform in regulated context",
          confidence: "medium",
        },
      ],
      explanation:
        "Marcus is a capable backend engineer with relevant API experience but a stack mismatch and limited signals on event-driven scale expected for this senior role.",
    },
  },
  {
    key: "priya",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    jobKey: "backend",
    stage: "SHORTLISTED",
    resumeText: `PRIYA PATEL
Software Engineer | Seattle, WA

EXPERIENCE
Software Engineer II — CloudNest (2020–Present)
- Node.js microservices on AWS ECS
- PostgreSQL + DynamoDB for catalog service
- SQS fan-out for search indexing

Software Engineer — RetailPulse (2018–2020)
- Ruby on Rails monolith maintenance

SKILLS
Node.js, TypeScript, PostgreSQL, AWS, SQS, ECS

EDUCATION
M.S. Computer Science — University of Washington`,
    talent: {
      skills: ["Node.js", "TypeScript", "PostgreSQL", "AWS", "SQS", "ECS"],
      experienceYears: 5,
      roleFitScore: 0.78,
      strengths: [
        "Node.js + PostgreSQL + AWS aligns with stack",
        "SQS fan-out shows async messaging familiarity",
      ],
      gaps: ["Shorter tenure at senior level; limited mentoring examples"],
      hiddenSignals: [
        {
          label: "Async patterns",
          value: "SQS indexing pipeline",
          evidence: "Catalog search fan-out via SQS",
          confidence: "medium",
        },
      ],
      explanation:
        "Priya is a strong mid-to-senior candidate with matching cloud and database skills. Shortlisted pending technical screen.",
    },
  },
  {
    key: "alex",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    jobKey: "backend",
    stage: "NEW",
    resumeText: `ALEX RIVERA
Full Stack Developer | Denver, CO

EXPERIENCE
Full Stack Developer — BrightApps (2021–Present)
- React + Express apps for SMB clients
- MongoDB, occasional PostgreSQL side projects

SKILLS
JavaScript, React, Express, MongoDB

EDUCATION
Bootcamp graduate + associate degree`,
  },
  {
    key: "jamie",
    name: "Jamie Wong",
    email: "jamie.wong@example.com",
    jobKey: "pm",
    stage: "TALENT_REVIEW",
    resumeText: `JAMIE WONG
Product Manager | Chicago, IL

EXPERIENCE
Senior PM — LogiTrack SaaS (2019–Present)
- Roadmap for fleet visibility dashboard (ARR $8M product line)
- Ran 40+ customer discovery interviews / quarter
- Shipped SLA alerting and maintenance scheduling modules

Associate PM — ShipRight (2016–2019)
- Mobile app for last-mile drivers

SKILLS
Roadmapping, PRDs, SQL for analytics, Figma, Jira

EDUCATION
MBA — Northwestern Kellogg`,
    talent: {
      skills: ["B2B SaaS", "Roadmapping", "Customer discovery", "Fleet/logistics domain"],
      experienceYears: 7,
      roleFitScore: 0.81,
      strengths: [
        "Direct fleet/logistics product experience",
        "Quantified discovery cadence and ARR scope",
      ],
      gaps: ["Less exposure to robotics-specific buyers"],
      hiddenSignals: [
        {
          label: "Enterprise motion",
          value: "$8M ARR product line",
          evidence: "Owned roadmap for meaningful revenue slice",
          confidence: "high",
        },
      ],
      explanation:
        "Jamie maps well to the Fleet Software PM role with relevant domain and discovery depth.",
    },
  },
];
