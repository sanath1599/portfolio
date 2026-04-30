import { fetchBlog } from "@/lib/blog";
import { BlogList } from "./BlogList";
import { SectionAnchor } from "./SectionAnchor";

export async function Blog() {
  const posts = await fetchBlog();

  return (
    <section className="bg-bg-0">
      <SectionAnchor
        id="blog"
        command="curl blog.sanathswaroop.com/rss.xml"
        meta="./blog.feed"
      />
      <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-8 lg:px-12">
        <div className="mb-3 flex items-center gap-2 text-[12.5px]">
          <a
            href="https://blog.sanathswaroop.com"
            target="_blank"
            rel="noopener noreferrer"
            data-pointer="true"
            className="text-warm underline-offset-4 hover:underline"
          >
            blog.sanathswaroop.com
          </a>
          <span className="text-text-3">↗</span>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-md border border-border bg-bg-1/50 backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-6 space-y-3">
              <p className="text-[13.5px] text-text-2">
                Live feed unavailable in this environment — read everything at{" "}
                <a
                  href="https://blog.sanathswaroop.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-pointer="true"
                  className="text-warm underline-offset-4 hover:underline"
                >
                  blog.sanathswaroop.com ↗
                </a>
              </p>
              <p className="text-[12px] text-text-3">
                Writing on AI systems, agents, security, and building at the frontier.
              </p>
            </div>
            <div className="border-t border-border px-5 py-3 bg-bg-2/30">
              <a
                href="https://blog.sanathswaroop.com"
                target="_blank"
                rel="noopener noreferrer"
                data-pointer="true"
                className="inline-flex items-center gap-2 text-[12px] text-warm hover:underline underline-offset-4"
              >
                Open blog → <span className="text-text-3">blog.sanathswaroop.com</span>
              </a>
            </div>
          </div>
        ) : (
          <BlogList posts={posts} />
        )}
      </div>
    </section>
  );
}
