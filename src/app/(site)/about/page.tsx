import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { PortableText } from "@portabletext/react";

const SITE_SINGLETON = groq`*[_type=="site"][0]{
  aboutBlurb, address, hours, email, instagram
}`;

export default async function AboutPage() {
  const data = await sanityFetch({ query: SITE_SINGLETON });
  const site = data?.data;

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-2xl font-semibold">About</h1>

      {site?.aboutBlurb && (
        <section className="prose max-w-none">
          <PortableText value={site.aboutBlurb} />
        </section>
      )}

      <section className="space-y-1 text-sm text-gray-700">
        {site?.address && <p>{site.address}</p>}
        {site?.hours && <p>{site.hours}</p>}
        {site?.email && (
          <p>
            <a className="underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        )}
        {site?.instagram && (
          <p>
            <a
              className="underline"
              href={site.instagram}
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
