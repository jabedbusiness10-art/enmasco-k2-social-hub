import { promises as fs } from "fs";
import path from "path";

type FeedItem = {
  id: string;
  source: string;
  title: string;
  link: string;
  published: string;
  summary: string;
};

type FeedSource = { key: string; label: string; url: string };

// Enterprise-relevant sources only (no consumer tech).
export const FEED_SOURCES: FeedSource[] = [
  { key: "meta", label: "Meta Developers", url: "https://developers.facebook.com/blog/feed/" },
  { key: "linkedin", label: "LinkedIn Engineering", url: "https://engineering.linkedin.com/blog.rss.html" },
  { key: "openai", label: "OpenAI", url: "https://openai.com/blog/rss.xml" },
  { key: "googleai", label: "Google AI", url: "https://blog.google/technology/ai/rss/" },
  { key: "microsoft", label: "Microsoft", url: "https://blogs.microsoft.com/feed/" },
  { key: "aws", label: "AWS", url: "https://aws.amazon.com/blogs/aws/feed/" },
  { key: "azure", label: "Azure", url: "https://azure.microsoft.com/en-us/blog/feed/" },
  { key: "gcp", label: "Google Cloud", url: "https://cloud.google.com/blog/rss/" },
  { key: "hikvision", label: "Hikvision", url: "https://www.hikvision.com/en/news/rss/" },
  { key: "onvif", label: "ONVIF", url: "https://www.onvif.org/feed/" },
  { key: "mitre", label: "MITRE CVE", url: "https://cve.mitre.org/data/downloads/allitems.csv" },
  { key: "nca", label: "Saudi NCA", url: "https://nca.gov.sa/feed/" },
  { key: "sdg", label: "Saudi Digital Government", url: "https://dga.gov.sa/en/feed/" },
  { key: "vision2030", label: "Saudi Vision 2030", url: "https://www.vision2030.gov.sa/en/feed/" },
];

const CACHE_FILE = path.join(process.cwd(), ".cache", "intelligence.json");
const REFRESH_MS = 60 * 60 * 1000; // 60 min

async function readCache(): Promise<{ updatedAt: number; items: FeedItem[] } | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCache(items: FeedItem[]) {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify({ updatedAt: Date.now(), items }, null, 2));
  } catch {}
}

function parseRss(xml: string, source: string): FeedItem[] {
  const items: FeedItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/g) || [];
  for (const b of blocks.slice(0, 8)) {
    const title = (b.match(/<title>([\s\S]*?)<\/title>/) || b.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "";
    const link = (b.match(/<link>([\s\S]*?)<\/link>/) || (b.match(/<link[^>]*href="([^"]+)"/) || []))[1] || (b.match(/<link[^>]*>([\s\S]*?)<\/link>/) || [])[1] || "";
    const pub = (b.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || b.match(/<updated>([\s\S]*?)<\/updated>/) || b.match(/<published>([\s\S]*?)<\/published>/) || [])[1]?.trim() || "";
    const summary = (b.match(/<description>([\s\S]*?)<\/description>/) || b.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim() || "";
    if (title) items.push({ id: `${source}:${link || title}`, source, title, link: link.trim(), published: pub, summary: summary.slice(0, 220) });
  }
  return items;
}

export async function getIntelligenceFeed(): Promise<{ updatedAt: number; items: FeedItem[]; stale: boolean }> {
  const cache = await readCache();
  const fresh = cache && Date.now() - cache.updatedAt < REFRESH_MS;

  // If cache is fresh and within refresh window, serve directly (no external call).
  if (fresh && cache) return { updatedAt: cache.updatedAt, items: cache.items, stale: false };

  const results = await Promise.allSettled(
    FEED_SOURCES.map(async (s) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      try {
        const res = await fetch(s.url, { signal: ctrl.signal, headers: { "User-Agent": "K2KAI-Bot/1.0" } });
        const xml = await res.text();
        clearTimeout(t);
        return parseRss(xml, s.label);
      } finally {
        clearTimeout(t);
      }
    })
  );

  let items: FeedItem[] = [];
  results.forEach((r) => { if (r.status === "fulfilled") items = items.concat(r.value); });
  items.sort((a, b) => new Date(b.published || 0).getTime() - new Date(a.published || 0).getTime());
  items = items.slice(0, 60);

  if (items.length) {
    await writeCache(items);
    return { updatedAt: Date.now(), items, stale: false };
  }
  // External unavailable → serve last cached with stale flag
  if (cache) return { updatedAt: cache.updatedAt, items: cache.items, stale: true };
  return { updatedAt: Date.now(), items: [], stale: true };
}
