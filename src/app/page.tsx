import { Eyebrow } from "@/components/eyebrow";
import { Footer } from "@/components/footer";
import { IndexList, type IndexItem } from "@/components/index-list";
import { ArrowLink } from "@/components/links";
import { Nav } from "@/components/nav";
import { Portrait } from "@/components/portrait";
import { SectionLabel } from "@/components/section-label";
import Link from "next/link";

// Placeholder content until the first features and collections exist.
// Links point at routes that are not built yet.
const essays: IndexItem[] = [
  { href: "/writing/the-list-that-keeps-me-looking", title: "The list that keeps me looking", category: "Birding", year: 2026 },
  { href: "/writing/small-enough-to-finish", title: "On making a thing small enough to finish", category: "Process", year: 2026 },
  { href: "/writing/reading-in-a-serif", title: "Notes on reading in a serif", category: "Typography", year: 2025 },
];

const projects: IndexItem[] = [
  { href: "/work/dns-filter", title: "A DNS filter for the whole house", category: "Code", year: 2026 },
  { href: "/work/salvaged-desk-lamp", title: "A desk lamp from salvaged parts", category: "Hardware", year: 2025 },
  { href: "/work/skyline", title: "The 1,000-piece skyline", category: "Lego", year: 2025 },
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

export default function Home() {
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
          style={{ "--accent": "#8a5a3c" } as React.CSSProperties}
        >
          <Link
            href="/writing/the-list-that-keeps-me-looking"
            className="flex flex-col gap-(--space-xl) border-t-2 border-accent pt-(--space-sm)"
          >
            <Eyebrow section="Writing" category="Birding" />
            <h2 className="type-feature-display max-w-275">
              The list that keeps me looking
            </h2>
            <div className={grid}>
              <p className="type-standfirst col-span-7 text-ink-2">
                A life list is supposed to be about the birds. Mine turned out
                to be about paying attention.
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
            <Link href="/work/dns-filter" className="col-span-7 flex flex-col gap-(--space-md)">
              <FeatureImage label="FEATURE IMAGE — 718 × 479" className="aspect-3/2" />
              <Eyebrow section="Work" category="Code" />
              <h3 className="type-quote">A DNS filter for the whole house</h3>
              <p className="type-small max-w-130 text-ink-2">
                A small macOS app that keeps the router honest, and what I
                learned from the dead ends.
              </p>
            </Link>
            <Link href="/photography/early-light-on-the-marsh" className="col-span-4 col-start-9 mt-(--space-block) flex flex-col gap-(--space-md)">
              <FeatureImage label="FEATURE IMAGE — 408 × 544" className="aspect-3/4" />
              <Eyebrow section="Photography" category="Series 04" />
              <h3 className="type-index-title">Early light on the marsh</h3>
            </Link>
            <Link href="/work/skyline" className="col-span-9 col-start-4 flex flex-col gap-(--space-md)">
              <FeatureImage label="FEATURE IMAGE — 918 × 459" className="aspect-2/1" />
              <Eyebrow section="Work" category="Lego" />
              <h3 className="type-quote">The 1,000-piece skyline</h3>
              <p className="type-small max-w-130 text-ink-2">
                A build I designed, redesigned and finally finished.
              </p>
            </Link>
          </div>
        </section>

        {/* Latest writing and work */}
        <section className="page flex flex-col gap-(--space-block) pt-(--space-block)">
          <div className="flex flex-col gap-(--space-lg)">
            <IndexList label="Latest writing" items={essays} />
            <div>
              <ArrowLink href="/writing">All writing</ArrowLink>
            </div>
          </div>
          <div className="flex flex-col gap-(--space-lg)">
            <IndexList label="Latest work" items={projects} />
            <div>
              <ArrowLink href="/work">All work</ArrowLink>
            </div>
          </div>
        </section>

        {/* Recent collection activity */}
        <section className="page py-(--space-block)">
          <SectionLabel>Recent in collections</SectionLabel>
          <div className={`${grid} pt-(--space-xl)`}>
            <div className="col-span-5 flex flex-col gap-(--space-sm)">
              <p className="type-label text-ink-2">Latest bird</p>
              <p className="type-index-title text-ink">
                Carolina Wren{" "}
                <span className="type-body italic text-ink-2">
                  Thryothorus ludovicianus
                </span>
              </p>
              <p className="type-meta text-ink-2">2026-09-27 · Charlotte</p>
            </div>
            <div className="col-span-6 col-start-7 flex flex-col gap-(--space-sm)">
              <p className="type-label text-ink-2">Latest recommendation</p>
              <p className="type-index-title text-ink">Braiding Sweetgrass</p>
              <p className="type-meta text-ink-2">Book · 2026-09-20</p>
            </div>
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
