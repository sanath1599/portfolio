import type { CommandSpec } from "./types";
import { projects } from "./projects";

const projectIds = projects.map((p) => p.id);

export const commandsList: CommandSpec[] = [
  {
    id: "whoami",
    slashAliases: ["/whoami", "/about", "/bio", "/me"],
    patterns: [
      /\bwho\s+(are|is)\s+(you|sanath)\b/i,
      /\btell\s+me\s+about\s+(yourself|you|sanath)\b/i,
      /\b(what|whats|what's|whos|who's)\s+(your|the)?\s*(deal|story|background|name)\b/i,
      /\b(intro|introduce|introduction)\b/i,
      /^(hi|hey|hello)\b/i,
    ],
    keywords: ["who", "about", "bio", "intro", "yourself", "sanath", "story", "background", "deal", "name"],
    description: "quick intro to who I am",
  },
  {
    id: "projects",
    slashAliases: ["/projects", "/work", "/portfolio"],
    patterns: [
      /\b(show|see|view|browse|list)\b.{0,20}\b(project|projects|work|portfolio|stuff|built|builds|things)\b/i,
      /\bwhat\b.{0,25}\b(have|did|you'?ve)\b.{0,15}\b(build|built|made|done|shipped|worked\s+on|working\s+on)\b/i,
      /\b(your|the|recent)\s+(projects?|work|portfolio|builds?)\b/i,
      /\bwhat.{0,15}you('?ve| have)\s+(been\s+)?(building|working|worked|shipped|shipping|made|done)\b/i,
    ],
    keywords: ["project", "projects", "work", "portfolio", "built", "build", "ship", "shipped", "made", "things", "builds", "products"],
    description: "list the things I've shipped",
  },
  {
    id: "experience",
    slashAliases: ["/experience", "/exp", "/cv", "/resume"],
    patterns: [
      /\b(your|the|past|prior)\s+(experience|background|history|cv|resume|career)\b/i,
      /\bwhat\b.{0,10}\b(have\s+you|did\s+you)\b.{0,10}\b(done|worked|built\s+before|before)\b/i,
      /\bwhere\s+have\s+you\s+worked\b/i,
    ],
    keywords: ["experience", "cv", "resume", "background", "career", "history", "past", "previous", "worked", "roles"],
    description: "highlights from my background",
  },
  {
    id: "blog",
    slashAliases: ["/blog", "/posts", "/writing", "/articles", "/essays"],
    patterns: [
      /\b(blog|posts?|articles?|writing|essays?)\b/i,
      /\bwhat\s+(have\s+)?you\s+(been\s+)?writ(ing|ten)\b/i,
      /\bread\s+(your|the)\b.{0,10}\b(blog|posts?|articles?)\b/i,
      /\b(latest|recent|new)\b.{0,10}\b(posts?|writing|articles?)\b/i,
    ],
    keywords: ["blog", "post", "posts", "article", "articles", "writing", "essay", "essays", "read", "wrote", "written", "publish"],
    description: "latest writing from blog.sanathswaroop.com",
  },
  {
    id: "contact",
    slashAliases: ["/contact", "/email", "/reach", "/hire"],
    patterns: [
      /\b(how|where|whats|what's)\b.{0,20}\b(contact|reach|email|hire|message|dm|text|connect)\b/i,
      /\b(work\s+with\s+you|hire\s+you|get\s+in\s+touch|reach\s+out)\b/i,
      /\b(your|the)\s+(email|dms?|twitter|github|socials?)\b/i,
    ],
    keywords: ["contact", "email", "reach", "hire", "work", "touch", "message", "dm", "twitter", "github", "linkedin", "social", "socials"],
    description: "ways to reach me",
  },
  {
    id: "open",
    slashAliases: ["/open", "/launch", "/run", "/preview"],
    patterns: [
      new RegExp(
        `\\b(open|launch|show|view|run|preview|load)\\s+(${projectIds.join("|")})\\b`,
        "i",
      ),
      new RegExp(
        `\\b(${projectIds.join("|")})\\b(\\s+\\.(ai|me|digital))?\\s*$`,
        "i",
      ),
    ],
    keywords: ["open", "launch", "show", "view", "run", "preview", "load", ...projectIds],
    description: "open a project in the live viewer",
    arg: { name: "project", values: projectIds },
  },
  {
    id: "help",
    slashAliases: ["/help", "/?", "/h"],
    patterns: [/\bhelp\b/i, /\bwhat\s+can\s+(i|you)\s+do\b/i, /\b(commands?|menu|options)\b/i],
    keywords: ["help", "commands", "options", "what", "menu", "how"],
    description: "show available commands",
  },
  {
    id: "ls",
    slashAliases: ["/ls", "/list"],
    patterns: [/^ls$/i, /\b(list\s+everything|everything)\b/i],
    keywords: ["ls", "list", "everything"],
    description: "list everything available",
  },
  {
    id: "clear",
    slashAliases: ["/clear", "/cls"],
    patterns: [/^clear$/i, /^cls$/i],
    keywords: ["clear", "clean", "reset", "wipe"],
    description: "clear the terminal scrollback",
  },
  {
    id: "theme",
    slashAliases: ["/theme"],
    patterns: [/^theme(\s+\w+)?$/i, /\b(dark|retro|crt|scanlines?)\b.{0,10}\b(mode|theme)?\b/i],
    keywords: ["theme", "retro", "crt", "scanline", "scanlines", "mode", "dark"],
    description: "toggle theme · default | retro",
    arg: { name: "mode", values: ["default", "retro"] },
  },
  {
    id: "model",
    slashAliases: ["/model"],
    patterns: [/^\/model\b/i],
    keywords: ["model", "switch", "glm", "gemma", "mistral", "llm"],
    description: "select AI model · glm | gemma | mistral",
    arg: { name: "model", values: ["glm", "gemma", "mistral"] },
  },
  {
    id: "coffee",
    slashAliases: ["/coffee"],
    patterns: [/\bcoffee\b/i, /\b418\b/],
    keywords: ["coffee", "418", "tea"],
    description: "—",
  },
  {
    id: "sudo",
    slashAliases: ["/sudo"],
    patterns: [/^sudo\b/i],
    keywords: ["sudo", "root", "admin"],
    description: "—",
  },
];

export const commandsById = Object.fromEntries(
  commandsList.map((c) => [c.id, c]),
) as Record<string, CommandSpec>;

/** Commands surfaced in the UI (help, palette, ls). Easter eggs are excluded. */
export const visibleCommands = commandsList.filter(
  (c) => !["coffee", "sudo"].includes(c.id),
);
