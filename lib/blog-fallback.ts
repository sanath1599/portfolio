import type { BlogPost } from "./blog";

// Static fallback used when the upstream RSS feed is unreachable (e.g. when
// blog.sanathswaroop.com sits behind Vercel BotID — every server-side fetch
// returns the JS challenge page with `x-vercel-mitigated: challenge`). To
// restore the live feed, allowlist /rss.xml in the blog project's Vercel
// firewall (or exclude it from BotID). Until then, the entries below render in
// the portfolio's blog section.
//
// Keep this list short (≤ 8) and chronological, newest first.
export const FALLBACK_POSTS: BlogPost[] = [];
