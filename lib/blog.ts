import "server-only";

import { XMLParser } from "fast-xml-parser";

export type BlogPost = {
  title: string;
  url: string;
  date: string; // ISO
  dateLabel: string; // "2025-07-11"
  excerpt: string;
};

const FEED = "https://blog.sanathswaroop.com/rss.xml";

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
      next: { revalidate: 3600 },
      // be a polite user-agent
      headers: { "User-Agent": "sanath-portfolio/1.0 (+https://sanathswaroop.com)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
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

    return items
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
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[blog] fetch failed:", err);
    }
    return [];
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
