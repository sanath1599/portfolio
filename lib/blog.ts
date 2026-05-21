import "server-only";

import { XMLParser } from "fast-xml-parser";
import { FALLBACK_POSTS } from "./blog-fallback";

export type BlogPost = {
  title: string;
  url: string;
  date: string; // ISO
  dateLabel: string; // "2025-07-11"
  excerpt: string;
};

const FEED = "https://blog.sanathswaroop.com/rss.xml";

// Pretend to be a real browser. Generic RSS-reader UAs get challenged by
// Vercel BotID; a desktop Chrome string is the most likely to pass.
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[—–]/g, "—") // safe-ish em/en dashes
    .replace(/\s+/g, " ")
    .trim();
}

function isoDate(rawDate: string): { iso: string; label: string } {
  const d = new Date(rawDate);
  if (Number.isNaN(d.valueOf())) return { iso: "", label: rawDate };
  const iso = d.toISOString();
  const label = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  return { iso, label };
}

export async function fetchBlog(): Promise<BlogPost[]> {
  try {
    const res = await fetch(FEED, {
      // Cache successful responses on Vercel's data cache for 1h; failures are
      // re-tried on the next request.
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
      },
    });

    // x-vercel-mitigated: challenge means BotID served the JS challenge page
    // instead of the feed — treat as a soft failure and use the fallback.
    const mitigated = res.headers.get("x-vercel-mitigated");
    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok || mitigated === "challenge" || contentType.startsWith("text/html")) {
      return FALLBACK_POSTS;
    }

    const xml = await res.text();
    if (xml.includes("Vercel Security Checkpoint")) return FALLBACK_POSTS;

    const parser = new XMLParser({
      ignoreAttributes: false,
      cdataPropName: "__cdata",
      processEntities: true,
    });
    const parsed = parser.parse(xml);
    const items: unknown[] = (() => {
      const i = parsed?.rss?.channel?.item ?? [];
      return Array.isArray(i) ? i : [i];
    })();

    const posts = items
      .slice(0, 8)
      .map((it): BlogPost | null => {
        if (!it || typeof it !== "object") return null;
        const item = it as Record<string, unknown>;
        const title = readField(item.title);
        const url = readField(item.link);
        const rawDate = readField(item.pubDate);
        const description = readField(item.description) || readField(item["content:encoded"]);
        if (!title || !url) return null;
        const { iso, label } = isoDate(rawDate);
        const excerpt = stripHtml(description).slice(0, 180);
        return {
          title,
          url,
          date: iso || rawDate,
          dateLabel: label,
          excerpt,
        };
      })
      .filter((p): p is BlogPost => p !== null);

    return posts.length > 0 ? posts : FALLBACK_POSTS;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[blog] fetch failed:", err);
    }
    return FALLBACK_POSTS;
  }
}

function readField(field: unknown): string {
  if (typeof field === "string") return field.trim();
  if (field && typeof field === "object") {
    const obj = field as Record<string, unknown>;
    if (typeof obj.__cdata === "string") return obj.__cdata.trim();
    if (typeof obj["#text"] === "string") return (obj["#text"] as string).trim();
  }
  return "";
}
