import Link from "next/link";
import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { formatDate } from "@/lib/date";

const SHOW_LIST = groq`*[_type=="show"]|order(coalesce(end, start) desc){
  _id, title, start, end, "slug": slug.current
}`;

export default async function ArchivePage() {
  const data = await sanityFetch({ query: SHOW_LIST, tags: ["show"] });
  type ShowListItem = {
    _id: string;
    title: string;
    start?: string;
    end?: string;
    slug?: string;
  };
  const shows: ShowListItem[] = data?.data ?? [];

  const todayStart = new Date();
  const startOfToday = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    todayStart.getDate(),
  ).getTime();

  const isUpcoming = (s: ShowListItem) => {
    const ref = s.end || s.start;
    if (!ref) return false;
    const refDate = new Date(ref).getTime();
    return refDate >= startOfToday;
  };

  const upcoming = shows
    .filter(isUpcoming)
    .sort(
      (a, b) =>
        new Date(a.start || 0).getTime() - new Date(b.start || 0).getTime(),
    );

  const past = shows.filter((s) => !isUpcoming(s));
  const pastGroups = new Map<string, ShowListItem[]>();
  for (const s of past) {
    const year = s.start?.slice(0, 4) ?? "Unknown";
    if (!pastGroups.has(year)) pastGroups.set(year, []);
    pastGroups.get(year)!.push(s);
  }
  for (const arr of pastGroups.values()) {
    arr.sort(
      (a, b) =>
        new Date(b.start || 0).getTime() - new Date(a.start || 0).getTime(),
    );
  }

  return (
    <main className="wrap py-12 sm:py-16">
      <div className="grid-12">
        <h1 className="col-span-12 md:col-span-3 text-2xl font-semibold tracking-tight">
          Shows
        </h1>
        <div className="col-span-12 md:col-span-9 space-y-10">
          <section id="upcoming" className="reveal space-y-3 pt-2">
            <h2 className="nav-sans text-sm text-secondary uppercase tracking-wide">
              {`Upcoming${upcoming.length ? ` (${upcoming.length})` : ""}`}
            </h2>
            {upcoming.length === 0 ? (
              <p className="nav-sans text-sm text-muted">No upcoming shows.</p>
            ) : (
              <ul className="space-y-1">
                {upcoming.map((show) => (
                  <li key={show._id} className="reveal">
                    <Link
                      href={`/shows/${show.slug}`}
                      prefetch={false}
                      className="grid grid-cols-[7.5rem_1fr] gap-4 items-baseline py-3 -mx-2 px-2 rounded focus-visible:outline-1 focus-visible:outline-black/40 hover:bg-black/[0.02]"
                    >
                      <span className="nav-sans text-xs text-secondary">
                        {formatDate(show.start)}
                      </span>
                      <span className="text-lg tracking-tight">
                        {show.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {[...pastGroups.entries()]
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([year, items]) => (
              <section key={year} className="reveal space-y-3 pt-2">
                <h2 className="nav-sans text-sm text-secondary uppercase tracking-wide">
                  {year}
                </h2>
                <ul className="space-y-1">
                  {items.map((show) => (
                    <li key={show._id} className="reveal">
                      <Link
                        href={`/shows/${show.slug}`}
                        prefetch={false}
                        className="grid grid-cols-[7.5rem_1fr] gap-4 items-baseline py-3 -mx-2 px-2 rounded focus-visible:outline-1 focus-visible:outline-black/40 hover:bg-black/[0.02]"
                      >
                        <span className="nav-sans text-xs text-muted">
                          {formatDate(show.start)}
                        </span>
                        <span className="text-lg tracking-tight">
                          {show.title}
                        </span>
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
