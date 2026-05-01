/** Centralized real copy. Editable from one place. */

export const profile = {
  handle: "sanath.swaroop",
  tagline: "ai engineer · systems · security",
};

export const whoami = {
  headline: {
    parts: [
      { text: "I build " },
      { text: "AI systems", tone: "ember" },
      { text: ",\nship " },
      { text: "products", tone: "amber" },
      { text: ", and break things " },
      { text: "securely", tone: "ember" },
      { text: "." },
    ],
  },
  bio: "Engineer working at the intersection of LLMs, agents, RAG, and product. Comfortable from low-level infra to user-facing UX. Currently building tools that make AI feel inevitable instead of impressive.",
  stack: [
    "LLMs",
    "RAG",
    "Agents",
    "TypeScript",
    "Python",
    "Postgres",
    "AWS",
    "Security",
  ],
};

export type ExperienceRole = {
  id: string;
  title: string;
  company: string;
  period: string;
  location: string;
  current?: boolean;
  bullets: string[];
  tags: string[];
};

export const experience: ExperienceRole[] = [
  {
    id: "excelerate",
    title: "Sr. AI Engineer (Contract)",
    company: "Excelerate Technologies",
    period: "Sep 2025 — Present",
    location: "Remote",
    current: true,
    bullets: [
      "Architect of AIPT — AI-powered penetration testing & compliance platform automating security assessments and remediation.",
      "Led the Operating Systems Agent for Excellerate Legal — natural-language (voice + chat) access across CRMs and internal tools.",
      "Built CommExcel, a unified text/voice support agent for Shopify & WooCommerce.",
      "Shipped DriveExcel, a voice agent automating Amazon DSP driver onboarding & qualification.",
    ],
    tags: ["LLMs", "Agents", "Voice AI", "Security", "RAG"],
  },
  {
    id: "motiv8",
    title: "Head of Product",
    company: "Motiv8.Digital",
    period: "Jul 2024 — Dec 2025",
    location: "Remote · Hyderabad",
    bullets: [
      "Led full-stack AI recruiting platform: resume screening, coding assessments, video-interview analysis.",
      "AI Resume Screener v2 — 85% reduction in screening time.",
      "Recruiter Copilot Chat doubled qualified outreach via conversational AI.",
      "ATS & job-board partnerships drove 25% of new revenue pipeline.",
    ],
    tags: ["LLMs", "NLP", "Product", "Full-stack"],
  },
  {
    id: "statwig",
    title: "Backend Developer",
    company: "StaTwig",
    period: "Apr 2022 — Aug 2023",
    location: "Hyderabad",
    bullets: [
      "Led 3-member team on open-source blockchain supply-chain platform (Hyperledger Fabric).",
      "Migrated MERN app to multi-tenant — deployment time cut to 18% of original.",
      "Refactored backend into Node.js microservices with canary deploys.",
      "Implemented key-sharding for secure custodian wallet storage.",
    ],
    tags: ["Node.js", "MongoDB", "Hyperledger", "Redis"],
  },
  {
    id: "npci",
    title: "Blockchain Associate",
    company: "NPCI",
    period: "Nov 2020 — Apr 2022",
    location: "Hyderabad",
    bullets: [
      "Contributed to early development of India's tokenized digital Rupee (eINR) — 4M+ customers.",
      "VAPT-driven hardening: closed 7 critical and 20+ high/medium findings.",
      "Forked Hyperledger Fabric for block archival — 80%+ storage savings.",
      "RabbitMQ inter-service comms cut average txn time by 20%+.",
    ],
    tags: ["Hyperledger", "RabbitMQ", "Security", "Go"],
  },
  {
    id: "buildup",
    title: "Product Engineer",
    company: "Buildup.services",
    period: "May 2018 — Oct 2020",
    location: "Hyderabad",
    bullets: [
      "Designed award-winning AR/VR construction management platform with real-time ML analytics.",
      "Built ML models predicting project bottlenecks & recommending interventions.",
      "Interactive ML-powered dashboards for clients and contractors.",
    ],
    tags: ["AR/VR", "ML", "Analytics"],
  },
];

export const pillars = [
  {
    id: "ai",
    title: "AI Systems",
    items: ["LLM pipelines & agents", "RAG over heterogeneous sources", "Eval + observability"],
  },
  {
    id: "sec",
    title: "Security",
    items: ["AIPT — AI pentest platform", "Recon → exploit automation", "CVSS prioritization"],
  },
  {
    id: "infra",
    title: "Backend & Infra",
    items: ["Low-latency APIs", "Postgres / vector stores", "Edge + serverless deploys"],
  },
];

export const honors = [
  "Winner — DeveloperWeek 2025 Hackathon (Trackonomy, solo)",
  "Winner — AngelHack Global Demo Day 2018",
  "Winner — Smart India Hackathon 2019 (SW Edition)",
  "Winner — HACK.COMS, EduHacks 2020, Mozilla Firefox Hackathon 2016",
  "ISB CIE — Innovation Mentor & Tech Partner (TEP)",
];

export type EducationEntry = {
  id: string;
  school: string;
  degree: string;
  endDate: string;
};

export const education: EducationEntry[] = [
  {
    id: "rit",
    school: "Rochester Institute of Technology, NY",
    degree: "Masters in Data Science",
    endDate: "May 2025",
  },
  {
    id: "iiit-bangalore",
    school: "IIIT Bangalore",
    degree: "PG Diploma in Software Development",
    endDate: "Dec 2021",
  },
  {
    id: "jntuh",
    school: "JNTUH, Hyderabad",
    degree: "Bachelors in Information Technology",
    endDate: "May 2020",
  },
];

export type CandidatePreference = {
  workAuthorization: string;
  employmentTypes: string;
  workMode: string;
  noticePeriod: string;
  compensation: string;
  targetRole: string;
  preferredLocations: string[];
  timezone: string;
  decisionFactors: string[];
  travel: string;
  contactPreference: string;
};

export const candidatePreferences: CandidatePreference = {
  workAuthorization:
    "Based in India and available for remote roles globally.",
  employmentTypes: "Open to full-time, contract, and consulting opportunities.",
  workMode:
    "Prefer remote. Open to hybrid or onsite when role scope and compensation justify it.",
  noticePeriod: "Not applicable; can start within 15 days.",
  compensation:
    "Expected range INR 40-50 LPA, with flexibility for market-competitive offers.",
  targetRole: "Targeting team lead / architect positions.",
  preferredLocations: [
    "Hyderabad",
    "Bangalore",
    "Mumbai",
    "Gurgaon",
  ],
  timezone: "Primary timezone IST (UTC+5:30), flexible with other time zones.",
  decisionFactors: [
    "Compensation",
    "Leadership quality",
    "Brand strength",
    "Equity upside",
    "Remote flexibility",
  ],
  travel: "Open to travel as needed.",
  contactPreference:
    "Prefer email or LinkedIn DM; phone contact is also available.",
};

export const contact = {
  intro: "ping me — fastest is email.",
  links: [
    {
      id: "email",
      label: "email",
      value: "sanathswaroopmulky@gmail.com",
      href: "mailto:sanathswaroopmulky@gmail.com",
    },
    {
      id: "github",
      label: "github",
      value: "@sanathswaroop",
      href: "https://github.com/sanathswaroop",
    },
    {
      id: "linkedin",
      label: "linkedin",
      value: "in/sanathswaroop",
      href: "https://www.linkedin.com/in/sanathswaroop/",
    },
    {
      id: "blog",
      label: "blog",
      value: "blog.sanathswaroop.com",
      href: "https://blog.sanathswaroop.com",
    },
  ],
  outro: "exit 0 — built with intention.",
};

export type ChatAnswer = {
  id: string;
  question: string;
  lines: string[]; // each line rendered after a leading bullet on the first; rest are continuation
};

/** Pre-populated showcase Q&A loaded into the terminal on first visit. */
export const showcaseChat: ChatAnswer[] = [
  {
    id: "ans-aipt",
    question: "tell me about AIPT",
    lines: [
      "aipt is sanath's ai penetration testing platform at excelerate.",
      "it uses specialized agents to automate vulnerability scanning and reporting.",
      "functions as a security layer to find flaws before attackers do.",
      "hosted at aipt.techedge-solution.tech.",
      "it is part of his current work architecture.",
    ],
  },
  {
    id: "ans-npci",
    question: "tell me about your work at NPCI",
    lines: [
      "blockchain associate (2020–2022).",
      "worked on the early foundation of india's digital rupee (eINR).",
      "optimized hyperledger fabric to achieve 80% storage savings.",
      "scaled the system to handle 4m+ customers.",
      "focused on high-throughput tokenization and ledger efficiency.",
    ],
  },
  {
    id: "ans-antm",
    question: "what about ANTM.ai?",
    lines: [
      "antm.ai is sanath's fintech project for risk management.",
      "it functions as a risk bureau for e-commerce returns and refunds.",
      "uses ai risk scoring to identify fraudulent patterns and bad actors.",
      "designed to help platforms minimize losses from refund abuse.",
      "part of his portfolio in ml-driven security and fintech.",
    ],
  },
  {
    id: "ans-years",
    question: "how many years of experience do you have?",
    lines: [
      "8+ years of total industry experience.",
      "ranging from product engineering to senior ai roles.",
      "spanning blockchain, full-stack, and generative ai.",
      "currently finishing an ms in data science at rit.",
    ],
  },
];

export const welcomeLines = [
  "claude-code v1.4.0 — assistant terminal",
  "loaded context: ./portfolio (5 projects, 5 roles)",
  "ready. ask me anything in plain english — i'll answer.",
];
