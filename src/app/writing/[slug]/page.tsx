import type { Metadata } from "next";
import { EntryBody } from "@/components/entry/body";
import { categoryOf } from "@/components/entry/mappers";
import { PhotoFigure } from "@/components/entry/photo-figure";
import { EssayHeader } from "@/components/essay-header";
import { Footer } from "@/components/footer";
import { ArrowLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { NextLink } from "@/components/next-link";
import { content, readingTime } from "@/lib/content";

// A Kodikion post in the house essay template: header, an optional hero
// from the photo archive, the body in the reading column, the next link.
// The feature tier and margin asides are not built yet.
export const dynamicParams = false;

export async function generateStaticParams() {
  const q = await content();
  return q.list("post").map((post) => ({ slug: post.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = (await content()).need("post", slug);
  return { title: post.data.title, description: post.summary };
}

export default async function PostPage({ params }: PageProps<"/writing/[slug]">) {
  const { slug } = await params;
  const q = await content();
  const post = q.need("post", slug);
  const cover = post.data.cover ? q.get(post.data.cover) : undefined;
  // The parts of its series, to say "Part 2 of 3".
  const parts = post.data.series
    ? q.list("post", { where: (p) => p.data.series === post.data.series })
    : [];
  // The next piece is the one before it, of the same type.
  const { older } = q.adjacent(post, (p) => p.data.type === post.data.type);
  return (
    <>
      <Nav active="Writing" />
      <main className="pb-(--space-block)">
        <article className="page flex flex-col gap-(--space-block) pt-(--space-header-top)">
          <EssayHeader
            category={categoryOf(post)}
            title={post.data.title}
            standfirst={post.data.subtitle}
            date={post.data.date}
            readingTime={readingTime(post.body)}
            tags={
              post.data.part
                ? [`Part ${post.data.part} of ${Math.max(post.data.part, parts.length)}`]
                : []
            }
          />
          {cover?.kind === "photo" && (
            <PhotoFigure photo={cover} index="01" size="hero" />
          )}
          <div className="grid grid-cols-12 gap-x-(--col-gap)">
            <div className="col-span-7 col-start-3 flex max-w-(--measure) flex-col gap-(--space-md)">
              <EntryBody entry={post} />
              {post.data.substack && (
                <div className="pt-(--space-md)">
                  <ArrowLink href={post.data.substack}>Also on Substack</ArrowLink>
                </div>
              )}
            </div>
          </div>
        </article>
        {older && (
          <div className="page pt-(--space-block)">
            <NextLink
              label={post.data.type === "article" ? "Next essay" : "Previous issue"}
              title={older.data.title}
              href={older.url}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
