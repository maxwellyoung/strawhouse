import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

const SITE_SINGLETON = groq`*[_type=="site"][0]{
  aboutBlurb, address, hours, email, instagram
}`;

type SiteDoc = {
  aboutBlurb?: PortableTextBlock[];
  address?: string;
  hours?: string;
  email?: string;
  instagram?: string;
};

export default async function AboutPage() {
  const data = await sanityFetch({ query: SITE_SINGLETON });
  const site = (data?.data as SiteDoc) || undefined;

  return (
    <main className="wrap py-12 sm:py-16 space-y-8">
      <header className="grid-12">
        <div className="col-span-12 md:col-span-3">
          <h1 className="text-2xl font-semibold">About</h1>
        </div>
      </header>

      {Array.isArray(site?.aboutBlurb) && site.aboutBlurb.length > 0 && (
        <section className="grid-12 reveal">
          <div className="col-span-12 md:col-span-9 prose max-w-none prose-p:leading-relaxed prose-p:my-3">
            <PortableText value={site.aboutBlurb as PortableTextBlock[]} />
          </div>
        </section>
      )}

      <section className="grid-12">
        <div className="col-span-12 md:col-span-9 space-y-1 text-sm text-secondary">
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
        </div>
      </section>
    </main>
  );
}
