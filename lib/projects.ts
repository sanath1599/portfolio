export type ProjectId = "antm" | "c0py" | "motiv8" | "ellie" | "aipt";

export type ProjectStatus = "RUNNING" | "ARCHIVED" | "PRIVATE";

export type Project = {
  id: ProjectId;
  /** display title, e.g. "c0py.me" */
  title: string;
  /** path-like sub-label shown after the title, e.g. "./c0py" */
  pathLabel: string;
  url: string;
  image: string;
  blurb: string;
  longBlurb: string;
  stack: string[];
  status: ProjectStatus;
  pid: string;
};

const seed = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).slice(0, 4).padStart(4, "0");
};

const make = (p: Omit<Project, "pid">): Project => ({ ...p, pid: `0x${seed(p.id)}` });

export const projects: Project[] = [
  make({
    id: "c0py",
    title: "c0py.me",
    pathLabel: "./c0py",
    url: "https://c0py.me/",
    image: "/images/c0py.png",
    blurb: "Anonymous, peer-to-peer file transfer.",
    longBlurb:
      "P2P file & text transfer with no servers, no logs, no accounts — encrypted in the browser, gone after the room closes.",
    stack: ["P2P", "WebRTC", "Privacy"],
    status: "RUNNING",
  }),
  make({
    id: "antm",
    title: "antm.ai",
    pathLabel: "./antm",
    url: "http://antm.ai/",
    image: "/images/antm.png",
    blurb: "Risk Bureau for Returns & Refunds.",
    longBlurb:
      "AI risk scoring for e-commerce returns and refunds — flags fraudulent patterns and bad actors before they ship the loss to the merchant.",
    stack: ["AI", "Risk Scoring", "Fintech"],
    status: "RUNNING",
  }),
  make({
    id: "motiv8",
    title: "motiv8.digital",
    pathLabel: "./motiv8",
    url: "https://motiv8.digital/",
    image: "/images/motiv8.png",
    blurb: "AI-powered recruitment platform.",
    longBlurb:
      "Full-stack AI recruiting surface — resume screening, coding assessments, video-interview analysis, and a recruiter copilot that doesn't sleep.",
    stack: ["LLM", "Hiring", "Automation"],
    status: "RUNNING",
  }),
  make({
    id: "aipt",
    title: "AIPT",
    pathLabel: "./aipt",
    url: "https://aipt.techedge-solution.tech/",
    image: "/images/aipt.png",
    blurb: "AI Penetration Testing platform.",
    longBlurb:
      "Operator-supervised agents that recon, exploit, and report. Defensive teams welcome — every offensive primitive maps to a detection signal.",
    stack: ["Security", "AI", "Pentest"],
    status: "RUNNING",
  }),
  make({
    id: "ellie",
    title: "Ellie Bot",
    pathLabel: "./ellie",
    url: "https://ellie.exceleratelegal.com/",
    image: "/images/ellie.png",
    blurb: "AI practice assistant for legal firms.",
    longBlurb:
      "RAG-grounded conversational AI for legal workflows — citation-aware, lawyer-tuned, and built for the kind of answer where being almost right is wrong.",
    stack: ["Agents", "RAG", "Legal AI"],
    status: "RUNNING",
  }),
];

export const getProject = (id: string): Project | undefined =>
  projects.find((p) => p.id === id);
