import { describe, expect, it } from "vitest";
import { resolve } from "../resolver";
import { commandsList } from "../commands";

const commands = commandsList;

const expectId = (input: string, expectedId: string) => {
  const r = resolve(input, commands);
  if (r.match?.id !== expectedId) {
    throw new Error(
      `expected "${input}" → ${expectedId}, got ${r.match?.id ?? "null"} (via=${r.via}, conf=${r.confidence})`,
    );
  }
  return r;
};

describe("resolver — slash commands", () => {
  it("resolves /projects exactly", () => {
    const r = expectId("/projects", "projects");
    expect(r.confidence).toBe(1);
    expect(r.via).toBe("slash");
  });
  it("resolves slash aliases", () => {
    expectId("/work", "projects");
    expectId("/portfolio", "projects");
    expectId("/about", "whoami");
    expectId("/me", "whoami");
    expectId("/cv", "experience");
    expectId("/posts", "blog");
    expectId("/email", "contact");
    expectId("/launch", "open");
    expectId("/?", "help");
  });
  it("captures slash arg for /open", () => {
    const r = expectId("/open antm", "open");
    expect(r.arg).toBe("antm");
    expect(r.confidence).toBe(1);
  });
  it("falls through unknown slash to other layers", () => {
    const r = resolve("/unknownthing", commands);
    expect(r.match).toBeNull();
  });
});

describe("resolver — natural language → /projects", () => {
  const utterances = [
    "show me your projects",
    "what have you built",
    "what did you build",
    "your work",
    "the portfolio",
    "browse projects",
    "list your work",
    "view your projects",
    "what have you shipped",
    "what you've been building",
    "what you've worked on",
    "your recent projects",
    "things you've built",
    "show your portfolio",
    "your builds",
  ];
  it.each(utterances)("resolves: %s", (u) => {
    const r = expectId(u, "projects");
    expect(r.confidence).toBeGreaterThanOrEqual(0.5);
  });
});

describe("resolver — natural language → /whoami", () => {
  const utterances = [
    "who are you",
    "tell me about yourself",
    "tell me about you",
    "introduce yourself",
    "intro",
    "hi",
    "hey",
    "hello",
    "what's your story",
    "what's your background",
    "your bio",
    "about",
  ];
  it.each(utterances)("resolves: %s", (u) => {
    expectId(u, "whoami");
  });
});

describe("resolver — natural language → /experience", () => {
  const utterances = [
    "your experience",
    "your background",
    "your career",
    "your resume",
    "your cv",
    "where have you worked",
    "what did you do before",
    "past experience",
  ];
  it.each(utterances)("resolves: %s", (u) => {
    expectId(u, "experience");
  });
});

describe("resolver — natural language → /blog", () => {
  const utterances = [
    "blog",
    "your blog",
    "read your blog",
    "latest posts",
    "recent articles",
    "what have you written",
    "what have you been writing",
    "your essays",
    "your posts",
    "writing",
  ];
  it.each(utterances)("resolves: %s", (u) => {
    expectId(u, "blog");
  });
});

describe("resolver — natural language → /contact", () => {
  const utterances = [
    "how can I reach you",
    "how do I contact you",
    "your email",
    "your socials",
    "your linkedin",
    "your twitter",
    "your github",
    "get in touch",
    "hire you",
    "work with you",
    "reach out",
  ];
  it.each(utterances)("resolves: %s", (u) => {
    expectId(u, "contact");
  });
});

describe("resolver — natural language → /open", () => {
  const utterances = [
    ["open antm", "antm"],
    ["launch c0py", "c0py"],
    ["show motiv8", "motiv8"],
    ["preview ellie", "ellie"],
    ["run aipt", "aipt"],
    ["antm", "antm"],
    ["c0py", "c0py"],
  ] as const;
  it.each(utterances)("resolves '%s' to project '%s'", (u, p) => {
    const r = expectId(u, "open");
    expect(r.arg).toBe(p);
  });
});

describe("resolver — natural language → /help", () => {
  const utterances = [
    "help",
    "what can you do",
    "what can I do",
    "commands",
    "menu",
    "options",
  ];
  it.each(utterances)("resolves: %s", (u) => {
    expectId(u, "help");
  });
});

describe("resolver — clear / theme / ls", () => {
  it("clears", () => {
    expectId("clear", "clear");
    expectId("cls", "clear");
    expectId("/clear", "clear");
  });
  it("theme", () => {
    expectId("theme", "theme");
    expectId("/theme retro", "theme");
    const r = resolve("/theme retro", commands);
    expect(r.arg).toBe("retro");
  });
  it("ls", () => {
    expectId("ls", "ls");
    expectId("list everything", "ls");
  });
});

describe("resolver — confidence behavior", () => {
  it("slash > regex > keywords", () => {
    expect(resolve("/projects", commands).confidence).toBe(1);
    expect(resolve("show me your projects", commands).confidence).toBeGreaterThanOrEqual(0.85);
    expect(resolve("project work things", commands).confidence).toBeGreaterThanOrEqual(0.5);
  });
  it("returns alternates when low confidence", () => {
    const r = resolve("uh", commands);
    expect(r.match).toBeNull();
    expect(r.alternates.length).toBeGreaterThan(0);
  });
  it("returns alternates for nonsense", () => {
    const r = resolve("asdfgh", commands);
    expect(r.match).toBeNull();
    expect(r.alternates.length).toBeGreaterThan(0);
  });
  it("empty input → null", () => {
    const r = resolve("   ", commands);
    expect(r.match).toBeNull();
    expect(r.via).toBe("none");
  });
});

describe("resolver — prefix fallback", () => {
  it("'pro' → projects (single-prefix match)", () => {
    const r = resolve("pro", commands);
    // 'pro' is a prefix of 'projects' only among the visible IDs
    expect(r.match?.id).toBe("projects");
    expect(r.via).toBe("prefix");
  });
  it("'h' alone → ambiguous (help, ?)", () => {
    const r = resolve("h", commands);
    // 'h' could prefix help or several aliases, but with only 1-char input we don't return a match
    // (length >= 2 is required for prefix layer)
    expect(r.match).toBeNull();
  });
});

describe("resolver — easter eggs", () => {
  it("coffee", () => expectId("coffee", "coffee"));
  it("sudo", () => expectId("sudo make me a sandwich", "sudo"));
});
