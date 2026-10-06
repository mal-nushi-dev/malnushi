import type { Metadata } from "next";
import { Aside } from "@/components/aside";
import { Caption } from "@/components/caption";
import { CodeBlock, InlineCode } from "@/components/code";
import { CollectionLink } from "@/components/collection-link";
import {
  DataTable,
  legoColumns,
  lifeListColumns,
  type LifeListRow,
} from "@/components/data-table";
import { EssayHeader } from "@/components/essay-header";
import { Eyebrow } from "@/components/eyebrow";
import { Figure } from "@/components/figure";
import { FilterPill } from "@/components/filter-pill";
import { Footer } from "@/components/footer";
import { ImagePlaceholder, ImageSlot } from "@/components/image-placeholder";
import { IndexList } from "@/components/index-list";
import { ArrowLink, InlineLink } from "@/components/links";
import { MetaItem, MetaRow } from "@/components/meta-row";
import { Nav } from "@/components/nav";
import { NextLink } from "@/components/next-link";
import { Note, NoteList, type NoteItem } from "@/components/note";
import { OtherCollections } from "@/components/other-collections";
import { PullQuote } from "@/components/pull-quote";
import { SectionLabel } from "@/components/section-label";
import { SpecBlock } from "@/components/spec-block";
import { Stat, Stats } from "@/components/stat";
import { Tile, TileGrid, TileGridItem } from "@/components/tile";
import { Toolbar } from "@/components/toolbar";

// Component preview. Not linked from the site.
export const metadata: Metadata = {
  title: "Components · Mal Nushi",
  robots: { index: false },
};

const sampleNotes: NoteItem[] = [
  { id: "2026-10-03-1412", day: "2026-10-03", time: "2:12 PM EDT", body: "A Carolina wren has been shouting at the window since seven." },
  { id: "2026-10-01-2204", day: "2026-10-01", time: "10:04 PM EDT", body: "Every charger I own is now smaller than the cable that goes with it. The spring took an afternoon; deciding that the top edge should never move took two days and made the bigger difference." },
];

const lifeList: LifeListRow[] = [
  { no: "001", species: { common: "Carolina Wren", scientific: "Thryothorus ludovicianus" }, family: "Troglodytidae", firstSeen: "12 Mar 2019", where: "Freedom Park" },
  { no: "002", species: { common: "Northern Cardinal", scientific: "Cardinalis cardinalis" }, family: "Cardinalidae", firstSeen: "12 Mar 2019", where: "Freedom Park" },
  { no: "003", species: { common: "Carolina Chickadee", scientific: "Poecile carolinensis" }, family: "Paridae", firstSeen: "30 Mar 2019", where: "Reedy Creek" },
  { no: "004", species: { common: "Red-shouldered Hawk", scientific: "Buteo lineatus" }, family: "Accipitridae", firstSeen: "18 May 2019", where: "Latta Preserve" },
  { no: "005", species: { common: "Brown-headed Nuthatch", scientific: "Sitta pusilla" }, family: "Sittidae", firstSeen: "2 Feb 2020", where: "Evergreen Preserve" },
  { no: "006", species: { common: "Pileated Woodpecker", scientific: "Dryocopus pileatus" }, family: "Picidae", firstSeen: "21 Nov 2020", where: "Reedy Creek" },
];

const code = `import { createResolver } from "./resolver";

export async function blockDomain(domain: string): Promise<boolean> {
  const profile = await nextdns.profile(PROFILE_ID);
  const { status } = await profile.denylist.add({ id: domain });
  return status === "ok";
}`;

function Group({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="page flex flex-col gap-(--space-xl) py-(--space-2xl)">
      <h2 className="type-meta text-ink-2">
        {number}&nbsp;&nbsp;{title}
      </h2>
      {children}
    </section>
  );
}

function Specimen({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-(--space-sm)">
      <p className="type-meta text-ink-2">{name}</p>
      {children}
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <>
      <Nav active="Writing" />
      <main>
        <Group number="01" title="Shell">
          <Specimen name="Next Link">
            <NextLink label="Next essay" title="The list that keeps me looking" href="#" />
          </Specimen>
          <p className="type-small text-ink-2">Nav and Footer frame this page.</p>
        </Group>

        <Group number="02" title="Text and media">
          <Specimen name="Eyebrow">
            <Eyebrow section="Essay" category="Birding" />
          </Specimen>
          <Specimen name="Meta Row">
            <MetaRow>
              <MetaItem>2026-09-28</MetaItem>
              <MetaItem>12 min read</MetaItem>
              <MetaItem>Birding</MetaItem>
            </MetaRow>
          </Specimen>
          <Specimen name="Section Label">
            <SectionLabel as="p">Latest essays</SectionLabel>
          </Specimen>
          <Specimen name="Caption: Type=Image, Photo, Photo Sparse">
            <figure className="flex flex-col gap-(--space-md)">
              <Caption index="01">
                A pair of Carolina wrens at the edge of the feeder, early morning.
              </Caption>
              <Caption index="01" exif={["35mm", "f/2.8", "1/500", "ISO 200"]} />
              <Caption index="02" exif={["f/1.8", "1/1000"]} />
            </figure>
          </Specimen>
          <Specimen name="Image Placeholder: Size=Column">
            <ImagePlaceholder size="column" />
          </Specimen>
          <Specimen name="Figure: Size=Hero">
            <Figure
              size="hero"
              index="01"
              caption="A pair of Carolina wrens at the edge of the feeder, early morning."
            />
          </Specimen>
          <Specimen name="Figure: Size=Column">
            <Figure
              size="column"
              index="02"
              caption="The feeder from the kitchen window, the morning after the first frost."
            />
          </Specimen>
        </Group>

        <Group number="03" title="Links and controls">
          <Specimen name="Inline Link">
            <p className="max-w-(--measure) type-body text-ink">
              I keep the <InlineLink href="#">field notes</InlineLink> in a
              separate book, one page per morning.
            </p>
          </Specimen>
          <Specimen name="Arrow Link">
            <div className="flex gap-(--space-lg)">
              <ArrowLink href="#">View source</ArrowLink>
              <ArrowLink href="#">Download</ArrowLink>
            </div>
          </Specimen>
          <Specimen name="Filter Pill: Default, Active">
            <div className="flex gap-(--space-sm)">
              <FilterPill active>All</FilterPill>
              <FilterPill>Passerines</FilterPill>
            </div>
          </Specimen>
          <Specimen name="Filter Pill, small: Default, Active">
            <div className="flex gap-2">
              <FilterPill size="sm" active>All</FilterPill>
              <FilterPill size="sm">Code</FilterPill>
            </div>
          </Specimen>
          <Specimen name="Collection Link">
            <div>
              <CollectionLink href="#" name="Recommendations" count={128} />
            </div>
          </Specimen>
        </Group>

        <Group number="04" title="Lists and tables">
          <IndexList
            label="Latest essays"
            items={[
              { href: "#1", title: "Notes on a year of birding by ear", category: "Essay / Birding", year: 2026 },
              { href: "#2", title: "A field recorder built from a Pico", category: "Projects / Hardware", year: 2026 },
              { href: "#3", title: "Why the index beats the grid", category: "Essay / Design", year: 2025 },
              { href: "#4", title: "Forty-one sets, sorted by color", category: "Projects / Lego", year: 2025 },
            ]}
          />
          <Specimen name="Tile Grid: wide, tall, square (hover or tab to a tile for its plate)">
            <TileGrid>
              <TileGridItem size="wide">
                <Tile
                  href="#tile-1"
                  size="wide"
                  title="A DNS filter for the whole house"
                  summary="A small macOS app that keeps the router honest."
                  label="Code"
                  year={2026}
                  status="In progress"
                >
                  <ImageSlot label="Cover" className="size-full" />
                </Tile>
              </TileGridItem>
              <TileGridItem size="tall">
                <Tile href="#tile-2" size="tall" title="Salvaged desk lamp" label="Hardware" year={2025}>
                  <ImageSlot label="Cover" className="size-full" />
                </Tile>
              </TileGridItem>
              <TileGridItem>
                <Tile
                  href="#tile-3"
                  title="Early light on the marsh"
                  label="Photo series · 12"
                  year={2026}
                >
                  <ImageSlot label="Cover" className="size-full" />
                </Tile>
              </TileGridItem>
            </TileGrid>
          </Specimen>
          <Specimen name="Note">
            <div className="max-w-(--measure)">
              <Note note={sampleNotes[0]} />
            </div>
          </Specimen>
          <Specimen name="Note List">
            <div className="max-w-(--measure)">
              <NoteList notes={sampleNotes} />
            </div>
          </Specimen>
          <Specimen name="Data Table: Life list">
            <DataTable caption="Life list" columns={lifeListColumns} rows={lifeList} />
          </Specimen>
          <Specimen name="Data Table: Lego inventory (rows not designed yet)">
            <DataTable
              caption="Lego inventory"
              columns={legoColumns}
              rows={[
                { no: "001", setName: "Pickup Truck", setNumber: "10290", pieces: 1677, year: 2021, status: "Built" },
              ]}
            />
          </Specimen>
        </Group>

        <Group number="05" title="Editorial content">
          <Specimen name="Pull Quote">
            <PullQuote>
              A life list is supposed to be about the birds. Mine turned out to
              be about the hours I stopped counting.
            </PullQuote>
          </Specimen>
          <Specimen name="Aside">
            <Aside marker="1">
              Sightings count once, on the first day a species is seen at a new
              site. Repeat visits appear in the notes, not the total.
            </Aside>
          </Specimen>
          <Specimen name="Spec Block: Kind=Code, Hardware">
            <div className="flex gap-(--space-2xl)">
              <SpecBlock
                spec={{ year: 2026, role: "Design & engineering", medium: "macOS app", stack: ["Swift", "SwiftUI", "NextDNS API"], status: "In progress" }}
              />
              <SpecBlock
                spec={{ year: 2025, role: "Design & fabrication", medium: "Desk instrument", materials: ["Walnut", "brass", "ESP32", "e-paper"], status: "Complete" }}
              />
            </div>
          </Specimen>
          <Specimen name="Stat">
            <Stats>
              <Stat value={214} label="Species seen" />
            </Stats>
          </Specimen>
          <Specimen name="Code Block">
            <CodeBlock code={code} />
          </Specimen>
          <Specimen name="Inline Code">
            <p className="type-body text-ink">
              Call <InlineCode>nextdns.profile()</InlineCode> to read the current
              profile before any write.
            </p>
          </Specimen>
        </Group>

        <Group number="06" title="Patterns">
          <Specimen name="Essay Header">
            <EssayHeader
              category="Birding"
              title="The list that keeps me looking"
              standfirst="A life list is supposed to be about the birds. Seven years in, mine is mostly about the places it keeps sending me back to."
              date="2026-09-28"
              readingTime={12}
              tags={["Birding"]}
            />
          </Specimen>
          <Specimen name="Toolbar + Data Table (Collection Table specimen)">
            <div className="flex flex-col gap-(--space-lg)">
              <Toolbar
                filters={["All", "Passerines", "Waterfowl", "Raptors"]}
                active="All"
                sort="First seen ↓"
              />
              <DataTable caption="Life list" columns={lifeListColumns} rows={lifeList} />
            </div>
          </Specimen>
          <Specimen name="Stats">
            <Stats>
              <Stat value={214} label="Species seen" />
              <Stat value={38} label="Families" />
              <Stat value={7} label="Years" />
            </Stats>
          </Specimen>
          <Specimen name="Other Collections Row">
            <OtherCollections
              collections={[
                { href: "#", name: "Music", count: 42 },
                { href: "#", name: "Recommendations", count: 128 },
                { href: "#", name: "Travels", count: 19 },
                { href: "#", name: "Lego", count: 41 },
              ]}
            />
          </Specimen>
        </Group>
      </main>
      <Footer />
    </>
  );
}
