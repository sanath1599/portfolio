import { projects } from "./projects";
import { contact, experience, whoami } from "./copy";
import type { CommandId } from "./types";

/**
 * Each command produces a chat-style answer (one or more lines).
 * The first line is rendered with stronger weight; the rest are continuation.
 */
export type ChatLines = string[];

export function answerFor(cmdId: CommandId, arg?: string): ChatLines | null {
  switch (cmdId) {
    case "whoami":
      return [
        "Sanath — ai engineer, systems builder, security-leaning.",
        whoami.bio,
        "8+ years of industry experience · currently sr. ai engineer at excelerate.",
      ];

    case "projects":
      return [
        `${projects.length} things shipped recently — ${projects.map((p) => p.title).join(", ")}.`,
        "use /open <name> (e.g. /open antm) to launch the live viewer in-page.",
        "or scroll down for the full ./projects view.",
      ];

    case "experience": {
      const top = experience[0];
      return [
        `${experience.length} roles across blockchain, full-stack, and generative ai.`,
        `current: ${top.title} @ ${top.company} — ${top.period}.`,
        "scroll to the experience section below for the full log.",
      ];
    }

    case "blog":
      return [
        "latest writing lives at blog.sanathswaroop.com.",
        "cached server-side here, refreshed every hour.",
        "scroll down for the live feed.",
      ];

    case "contact": {
      const email = contact.links.find((l) => l.id === "email")!.value;
      const gh = contact.links.find((l) => l.id === "github")!.value;
      return [
        `email · ${email}`,
        `github · ${gh}`,
        "fastest response window: morning utc, weekdays.",
      ];
    }

    case "help":
      return [
        "you can type slash commands or just ask in plain english.",
        "/whoami · /projects · /experience · /blog · /contact",
        "/open <project> · /clear · /theme retro · /theme default",
        "press ⌘K for the command palette · / to focus this prompt",
      ];

    case "ls":
      return [
        "./whoami       quick intro",
        "./projects     5 things i've shipped",
        "./experience   5 roles across 8+ years",
        "./blog         latest writing (rss-fed, cached 1h)",
        "./contact      ways to reach me",
      ];

    case "open": {
      const id = (arg ?? "").toLowerCase();
      const p = projects.find((x) => x.id === id);
      if (!p) {
        return [
          "specify a project to open: antm | c0py | motiv8 | ellie | aipt",
          "or type the name plainly — e.g. 'open ellie'.",
        ];
      }
      return [
        `launching ${p.title} in the live viewer…`,
        p.longBlurb,
        `if your browser blocks the iframe, the viewer falls back to a screenshot + 'open externally'.`,
      ];
    }

    case "theme":
      return [
        `theme switched · ${arg ?? "toggle"}.`,
        "type /theme retro for scanlines · /theme default to clear.",
      ];

    case "clear":
      return null;

    case "coffee":
      return [
        "HTTP 418 — i'm a teapot.",
        "(also: i take mine black, no sugar.)",
      ];

    case "sudo":
      return [
        "permission denied — but i appreciate the ambition.",
        "(this terminal is read-only · pinky-promise.)",
      ];

    default:
      return null;
  }
}

/**
 * Try to answer a known free-form question that doesn't map cleanly to a command.
 * Returns null if no specific match — caller falls back to alternates.
 */
export function freeformAnswer(input: string): ChatLines | null {
  const q = input.toLowerCase();
  if (/\bnpci\b/.test(q)) {
    const r = experience.find((e) => e.id === "npci");
    if (!r) return null;
    return [
      `${r.title} @ ${r.company} (${r.period}).`,
      ...r.bullets.map((b) => b.toLowerCase()),
    ];
  }
  if (/\bmotiv8|recruit/.test(q)) {
    const r = experience.find((e) => e.id === "motiv8");
    if (!r) return null;
    return [
      `${r.title} @ ${r.company} — ${r.period}.`,
      ...r.bullets.map((b) => b.toLowerCase()),
    ];
  }
  if (/\bantm\b/.test(q)) {
    const p = projects.find((x) => x.id === "antm");
    if (!p) return null;
    return [
      `${p.title} — ${p.blurb.toLowerCase()}`,
      p.longBlurb.toLowerCase(),
    ];
  }
  if (/\bc0py|copy\b/.test(q)) {
    const p = projects.find((x) => x.id === "c0py");
    if (!p) return null;
    return [
      `${p.title} — ${p.blurb.toLowerCase()}`,
      p.longBlurb.toLowerCase(),
    ];
  }
  if (/\bellie\b/.test(q)) {
    const p = projects.find((x) => x.id === "ellie");
    if (!p) return null;
    return [
      `${p.title} — ${p.blurb.toLowerCase()}`,
      p.longBlurb.toLowerCase(),
    ];
  }
  if (/\baipt|pentest|penetration/.test(q)) {
    const p = projects.find((x) => x.id === "aipt");
    if (!p) return null;
    return [
      `${p.title} — ${p.blurb.toLowerCase()}`,
      p.longBlurb.toLowerCase(),
    ];
  }
  if (/\b(years?|experience)\s+(of|do|have)/.test(q) || /\bhow\s+(many|long)/.test(q)) {
    return [
      "8+ years of total industry experience.",
      "ranging from product engineering to senior ai roles.",
      "spanning blockchain, full-stack, and generative ai.",
    ];
  }
  return null;
}
