import type { CommandSpec, ResolveResult } from "./types";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "am", "to", "of", "in", "on", "at", "by",
  "for", "with", "and", "or", "but", "do", "does", "did", "i", "i'm", "me",
  "my", "you", "your", "yourself", "yours", "we", "us", "our", "they", "them",
  "their", "this", "that", "these", "those", "it", "its", "be", "been", "being",
  "have", "has", "had", "will", "would", "should", "could", "can", "may",
  "might", "shall", "ok", "please", "just", "really", "tell", "give", "show",
  "any", "some", "very", "thanks", "thank",
]);

const STEMS: Record<string, string> = {
  projects: "project",
  works: "work",
  worked: "work",
  working: "work",
  builds: "build",
  built: "build",
  building: "build",
  shipped: "ship",
  shipping: "ship",
  posts: "post",
  articles: "article",
  writing: "writ",
  written: "writ",
  wrote: "writ",
  essays: "essay",
  reaching: "reach",
  reaches: "reach",
  hires: "hire",
  hiring: "hire",
  contacts: "contact",
  emails: "email",
};

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_./'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function normalize(token: string): string {
  if (STEMS[token]) return STEMS[token];
  if (token.length > 4 && token.endsWith("ing")) return token.slice(0, -3);
  if (token.length > 3 && token.endsWith("ed")) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss"))
    return token.slice(0, -1);
  return token;
}

function tokensFromKeywords(keywords: string[]): Set<string> {
  return new Set(keywords.map((k) => normalize(k.toLowerCase())));
}

function dropStopwords(tokens: string[]): string[] {
  return tokens.filter((t) => !STOPWORDS.has(t));
}

function extractArg(input: string, command: CommandSpec): string | undefined {
  if (!command.arg) return undefined;
  const lower = input.toLowerCase();
  for (const v of command.arg.values) {
    const re = new RegExp(`\\b${v}\\b`, "i");
    if (re.test(lower)) return v;
  }
  return undefined;
}

/**
 * Resolves a free-form input into a command match.
 *
 * Layered matching, in priority order:
 *  1. slash-exact   confidence 1.00
 *  2. regex pattern confidence 0.85
 *  3. keyword score confidence 0.50–0.75
 *  4. prefix match  confidence 0.40
 *  5. none          confidence 0.00
 */
export function resolve(input: string, commands: CommandSpec[]): ResolveResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { match: null, confidence: 0, via: "none", alternates: [] };
  }
  const lower = trimmed.toLowerCase();

  // 1. slash exact
  if (lower.startsWith("/")) {
    const first = lower.split(/\s+/)[0];
    for (const cmd of commands) {
      if (cmd.slashAliases.includes(first)) {
        return {
          match: cmd,
          confidence: 1,
          via: "slash",
          arg: extractArg(trimmed, cmd),
          alternates: [],
        };
      }
    }
    // unknown slash command — fall through to keyword/prefix matching
  }

  // 2. regex
  for (const cmd of commands) {
    for (const pat of cmd.patterns) {
      if (pat.test(trimmed)) {
        return {
          match: cmd,
          confidence: 0.85,
          via: "regex",
          arg: extractArg(trimmed, cmd),
          alternates: [],
        };
      }
    }
  }

  // 3. keyword scoring (Jaccard-ish)
  const tokens = dropStopwords(tokenize(trimmed)).map(normalize);
  if (tokens.length > 0) {
    const tokenSet = new Set(tokens);
    type Scored = { cmd: CommandSpec; score: number };
    const scored: Scored[] = commands
      .map((cmd) => {
        const kwSet = tokensFromKeywords(cmd.keywords);
        let intersection = 0;
        for (const t of tokenSet) if (kwSet.has(t)) intersection++;
        const union = new Set<string>([...tokenSet, ...kwSet]).size;
        const jaccard = union > 0 ? intersection / union : 0;
        // weight raw intersections more — Jaccard alone underrates short inputs
        const score = intersection * 0.6 + jaccard * 0.4;
        return { cmd, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) {
      const top = scored[0];
      const margin = top.score - (scored[1]?.score ?? 0);
      if (top.score >= 0.6 && margin >= 0.2) {
        const conf = Math.min(0.75, 0.5 + top.score * 0.18);
        return {
          match: top.cmd,
          confidence: conf,
          via: "keywords",
          arg: extractArg(trimmed, top.cmd),
          alternates: scored.slice(1, 3).map((s) => s.cmd),
        };
      }
      if (top.score >= 0.6) {
        // ambiguous — return top with lower confidence + alternates
        return {
          match: top.cmd,
          confidence: 0.55,
          via: "keywords",
          arg: extractArg(trimmed, top.cmd),
          alternates: scored.slice(1, 3).map((s) => s.cmd),
        };
      }
    }
  }

  // 4. prefix match
  if (trimmed.length >= 2 && !trimmed.includes(" ")) {
    const stripped = lower.replace(/^\//, "");
    const prefixMatches = commands.filter(
      (c) =>
        c.id.startsWith(stripped) ||
        c.slashAliases.some((a) => a.replace(/^\//, "").startsWith(stripped)),
    );
    if (prefixMatches.length === 1) {
      return {
        match: prefixMatches[0],
        confidence: 0.4,
        via: "prefix",
        alternates: [],
      };
    }
    if (prefixMatches.length > 1) {
      return {
        match: null,
        confidence: 0.2,
        via: "none",
        alternates: prefixMatches.slice(0, 4),
      };
    }
  }

  // 5. no match — return up to 4 most-likely candidates as alternates
  const alts = commands
    .filter((c) => !["coffee", "sudo"].includes(c.id))
    .slice(0, 4);
  return { match: null, confidence: 0, via: "none", alternates: alts };
}
