import { NextResponse } from "next/server";
import { fetchBlog } from "@/lib/blog";

export const runtime = "nodejs";

export async function GET() {
  const posts = await fetchBlog();
  return NextResponse.json(posts, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
