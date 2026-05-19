export type BlogPost = {
  title: string;
  url: string;
  date: string;
  dateLabel: string;
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
    .replace(/[—–]/g, "—")
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

function getText(item: Element, tag: string): string {
  return item.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
}

export async function fetchBlogClient(): Promise<BlogPost[]> {
  const res = await fetch(FEED);
  if (!res.ok) return [];
  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const items = Array.from(doc.getElementsByTagName("item"));

  return items
    .slice(0, 8)
    .map((item): BlogPost | null => {
      const title = getText(item, "title");
      const url = getText(item, "link") || getText(item, "guid");
      const rawDate = getText(item, "pubDate");
      const description =
        getText(item, "description") || getText(item, "content:encoded");
      if (!title || !url) return null;
      const { iso, label } = isoDate(rawDate);
      const excerpt = stripHtml(description).slice(0, 180);
      return { title, url, date: iso || rawDate, dateLabel: label, excerpt };
    })
    .filter((p): p is BlogPost => p !== null);
}
