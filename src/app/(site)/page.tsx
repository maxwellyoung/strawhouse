import Link from "next/link";
import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { formatDate } from "@/lib/date";
import CursorPreview from "@/app/_components/CursorPreview";

const HOME_SHOWS = groq`*[_type=="show"]|order(coalesce(end, start) desc){
  _id, title, start, hero{asset->{url}}, "slug": slug.current
}`;

export default async function HomeIndex() {
  const data = await sanityFetch({ query: HOME_SHOWS, tags: ["show"] });
  const shows: Array<{
    _id: string;
    title: string;
    start?: string;
    slug?: string;
    hero?: { asset?: { url?: string } } | null;
  }> = data?.data ?? [];

  return (
    <main className="wrap py-12 sm:py-16">
      <div className="grid-12">
        <h1 className="col-span-12 md:col-span-3 text-2xl font-semibold tracking-tight">
          Shows
        </h1>
        <div className="col-span-12 md:col-span-9">
          <CursorPreview>
            <ul className="space-y-1">
              {shows.map((show) => (
                <li key={show._id} className="reveal">
                  <Link
                    href={`/shows/${show.slug}`}
                    prefetch={false}
                    data-preview={show.hero?.asset?.url || ""}
                    className="grid grid-cols-[7.5rem_1fr] gap-4 items-baseline py-3 -mx-2 px-2 rounded focus-visible:outline-1 focus-visible:outline-black/40 hover:bg-black/[0.02]"
                  >
                    <span className="nav-sans text-xs text-muted">
                      {formatDate(show.start)}
                    </span>
                    <span className="text-lg tracking-tight">{show.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CursorPreview>
        </div>
      </div>
    </main>
  );
}
