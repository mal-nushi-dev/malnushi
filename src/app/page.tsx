import { ItemSummary } from "@/components/entry/item-summary";
import { categoryOf, titleOf, toIndexItem } from "@/components/entry/mappers";
import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { IndexList } from "@/components/index-list";
import { ArrowLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { Portrait } from "@/components/portrait";
import { SectionLabel } from "@/components/section-label";
import { content, dayOf, type Kind } from "@/lib/content";
import Link from "next/link";

// The features are chosen by hand: the lead, then three more in this order.
// Their images are placeholders until the pieces have real ones.
const lead = { kind: "post", id: "the-list-that-keeps-me-looking" } as const;
const features: { kind: Kind; id: string }[] = [
  { kind: "project", id: "dns-filter" },
  { kind: "series", id: "early-light-on-the-marsh" },
  { kind: "project", id: "skyline" },
];

const grid = "grid grid-cols-12 gap-x-(--col-gap)";

function FeatureImage({ label, className }: { label: string; className: string }) {
  return (
    <div
      role="img"
      aria-label={`Image placeholder, ${label}`}
      className={`flex w-full items-center justify-center rounded-(--radius-img) bg-line ${className}`}
    >
      <span className="type-meta text-ink-2">{label}</span>
    </div>
  );
}

export default async function Home() {
  const q = await content();
  const feature = q.need(lead.kind, lead.id);
  const [first, second, third] = features.map(({ kind, id }) => q.need(kind, id));
  const essays = q.list("post", { where: (p) => p.data.type === "article", limit: 3 });
  const projects = q.list("project", { limit: 3 });
  const lifeList = q.need("collection", "life-list");
  const recommendations = q.need("collection", "recommendations");
  const [bird] = q.list("item", { where: (i) => i.data.collection === lifeList.id, limit: 1 });
  const [rec] = q.list("item", { where: (i) => i.data.collection === recommendations.id, limit: 1 });
  const [photo] = q.list("photo", { limit: 1 });
  return (
    <>
      <Nav />
      <main>
        {/* Opening */}
        <section className="page pt-(--space-header-top)">
          <div className={`${grid} items-end`}>
            <div className="col-span-7 flex flex-col gap-(--space-xl)">
              <h1 className="type-h1">
                I’m Mal. I write, make things and look at birds.
              </h1>
              <p className="type-standfirst max-w-150 text-ink-2">
                This is where my essays, projects, photographs and lists live.
                Some are finished; most are still being worked on.
              </p>
              <div>
                <ArrowLink href="/about">About me</ArrowLink>
              </div>
            </div>
            <div className="col-span-4 col-start-9 text-ink">
              <Portrait className="block h-auto w-full" />
            </div>
          </div>
        </section>

        {/* Lead feature: one accent, overriding the house token on this wrapper */}
        <section
          className="page pt-(--space-block)"
          style={{ "--accent": feature.data.feature?.accent } as React.CSSProperties}
        >
          <Link
            href={feature.url}
            className="flex flex-col gap-(--space-xl) border-t-2 border-accent pt-(--space-sm)"
          >
            <Eyebrow section="Writing" category={categoryOf(feature)} />
            <h2 className="type-feature-display max-w-275">{feature.data.title}</h2>
            <div className={grid}>
              <p className="type-standfirst col-span-7 text-ink-2">
                {feature.data.subtitle}
              </p>
              <span className="col-span-4 col-start-9 flex items-end type-ui text-link">
                Read the essay <span aria-hidden>&nbsp;→</span>
              </span>
            </div>
            <div
              role="img"
              aria-label="Feature hero placeholder, 1248 by 480"
              className="flex h-120 w-full items-center justify-center rounded-(--radius-img) bg-accent"
            >
              <span className="type-meta text-bg">FEATURE HERO — 1248 × 480</span>
            </div>
          </Link>
        </section>

        {/* More features: deliberately unequal sizes */}
        <section className="page pt-(--space-block)">
          <SectionLabel>Features</SectionLabel>
          <div className={`${grid} items-start gap-y-(--space-block) pt-(--space-2xl)`}>
            <Link href={first.url} className="col-span-7 flex flex-col gap-(--space-md)">
              <FeatureImage label="FEATURE IMAGE — 718 × 479" className="aspect-3/2" />
              <Eyebrow section="Projects" category={categoryOf(first)} />
              <h3 className="type-quote">{titleOf(first)}</h3>
              <p className="type-small max-w-130 text-ink-2">{first.summary}</p>
            </Link>
            <Link href={second.url} className="col-span-4 col-start-9 mt-(--space-block) flex flex-col gap-(--space-md)">
              <FeatureImage label="FEATURE IMAGE — 408 × 544" className="aspect-3/4" />
              <Eyebrow
                section="Photography"
                category={
                  second.kind === "series" && second.data.number
                    ? `Series ${String(second.data.number).padStart(2, "0")}`
                    : categoryOf(second)
                }
              />
              <h3 className="type-index-title">{titleOf(second)}</h3>
            </Link>
            <Link href={third.url} className="col-span-9 col-start-4 flex flex-col gap-(--space-md)">
              <FeatureImage label="FEATURE IMAGE — 918 × 459" className="aspect-2/1" />
              <Eyebrow section="Projects" category={categoryOf(third)} />
              <h3 className="type-quote">{titleOf(third)}</h3>
              <p className="type-small max-w-130 text-ink-2">{third.summary}</p>
            </Link>
          </div>
        </section>

        {/* Latest writing and work */}
        <section className="page flex flex-col gap-(--space-block) pt-(--space-block)">
          <div className="flex flex-col gap-(--space-lg)">
            <IndexList label="Latest writing" items={essays.map(toIndexItem)} />
            <div>
              <ArrowLink href="/writing">All writing</ArrowLink>
            </div>
          </div>
          <div className="flex flex-col gap-(--space-lg)">
            <IndexList label="Latest work" items={projects.map(toIndexItem)} />
            <div>
              <ArrowLink href="/projects">All projects</ArrowLink>
            </div>
          </div>
        </section>

        {/* Recent collection activity */}
        <section className="page py-(--space-block)">
          <SectionLabel>Recent in collections</SectionLabel>
          <div className={`${grid} pt-(--space-xl)`}>
            <div className="col-span-4">
              <ItemSummary item={bird} collection={lifeList} label="Latest bird" />
            </div>
            <div className="col-span-4">
              <ItemSummary
                item={rec}
                collection={recommendations}
                label="Latest recommendation"
              />
            </div>
            <Link href={photo.url} className="group col-span-4 flex flex-col gap-(--space-sm)">
              <p className="type-label text-ink-2">Latest photograph</p>
              <p className="type-index-title text-ink group-hover:text-link">
                {titleOf(photo)}
              </p>
              <p className="type-meta text-ink-2">
                {[dayOf(photo.date), photo.data.place].filter(Boolean).join(" · ")}
              </p>
            </Link>
          </div>
          <div className="pt-(--space-xl)">
            <ArrowLink href="/collections">All collections</ArrowLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
