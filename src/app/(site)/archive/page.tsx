import Link from "next/link";
import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { formatDate } from "@/lib/date";

const SHOW_LIST = groq`*[_type=="show"]|order(start desc){
  _id, title, start, "slug": slug.current
}`;

export default async function ArchivePage() {
  const data = await sanityFetch({ query: SHOW_LIST });
  const shows: Array<{
    _id: string;
    title: string;
    start?: string;
    slug?: string;
  }> = data?.data ?? [];

  const groups = new Map<string, typeof shows>();
  for (const s of shows) {
    const year = s.start?.slice(0, 4) ?? "Unknown";
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(s);
  }

  return (
    <main className="wrap py-12 sm:py-16">
      <div className="grid-12">
        <h1 className="col-span-12 md:col-span-3 text-2xl font-semibold tracking-tight">
          Shows
        </h1>
        <div className="col-span-12 md:col-span-9 space-y-6">
          {[...groups.entries()]
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([year, items]) => (
              <section
                key={year}
                className="reveal space-y-3 pt-8 border-t rule"
              >
                <h2 className="nav-sans text-sm text-secondary uppercase tracking-wide">
                  {year}
                </h2>
                <ul className="space-y-1">
                  {items.map((show) => (
                    <li
                      key={show._id}
                      className="grid grid-cols-[7.5rem_1fr] gap-4 reveal"
                    >
                      <span className="nav-sans text-xs text-muted">
                        {formatDate(show.start)}
                      </span>
                      <Link
                        href={`/shows/${show.slug}`}
                        className="link-underline underline-offset-2"
                      >
                        {show.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      </div>
    </main>
  );
}
