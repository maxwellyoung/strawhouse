import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { PortableText } from "@portabletext/react";
import { formatDateRange } from "@/lib/date";

const SHOW_BY_SLUG = groq`*[_type=="show" && slug.current==$slug][0]{
  _id,
  title,
  subtitle,
  artists,
  start,
  end,
  press,
  hero,
  gallery[]{..., "url": asset->url},
  links,
  "slug": slug.current,
  year
}`;

export default async function ShowPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const data = await sanityFetch({ query: SHOW_BY_SLUG, params: { slug } });
  const show = data?.data;

  if (!show) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <p>Show not found.</p>
      </main>
    );
  }

  return (
    <main className="wrap py-12 sm:py-16 space-y-8">
      <header className="grid-12">
        <div className="col-span-12 md:col-span-3">
          <h1 className="text-2xl font-semibold">{show.title}</h1>
          {show.subtitle && <p className="text-gray-600">{show.subtitle}</p>}
        </div>
        <div className="col-span-12 md:col-span-9">
          {Array.isArray(show.artists) && show.artists.length > 0 && (
            <p className="nav-sans text-sm text-secondary">
              {show.artists.join(", ")}
            </p>
          )}
          <p className="nav-sans text-sm text-muted">
            {formatDateRange(show.start, show.end)}
          </p>
        </div>
      </header>

      {show.press && (
        <section className="grid-12 reveal">
          <div className="col-span-12 md:col-span-9 prose max-w-none prose-p:leading-relaxed prose-p:my-3">
            <PortableText value={show.press} />
          </div>
        </section>
      )}

      {Array.isArray(show.gallery) && show.gallery.length > 0 && (
        <section className="grid-12 gap-4 reveal">
          <div className="col-span-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {show.gallery.map((img: any, idx: number) => (
              <figure key={idx} className="space-y-2 reveal">
                <img
                  src={img.url}
                  alt={img.caption || ""}
                  className="w-full h-auto"
                />
                {img.caption && (
                  <figcaption className="nav-sans text-xs text-muted">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {Array.isArray(show.links) && show.links.length > 0 && (
        <section className="space-x-4">
          {show.links.map((l: any, idx: number) => (
            <a
              key={idx}
              href={l.url}
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              {l.label || l.url}
            </a>
          ))}
        </section>
      )}
    </main>
  );
}
