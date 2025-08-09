import type { Metadata } from "next";
import Link from "next/link";
import { SanityLive, sanityFetch } from "@/sanity/lib/live";
import { groq } from "next-sanity";

export const metadata: Metadata = {
  title: "Strawhouse",
  description: "Strawhouse gallery, Mt Eden, Auckland",
};

// Cache SSR responses for this subtree; override per-page if needed
export const revalidate = 300; // 5 minutes

const SITE_SINGLETON = groq`*[_type=="site"][0]{address, hours, email, instagram}`;

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const site = (await sanityFetch({ query: SITE_SINGLETON, tags: ["site"] }))
    ?.data as
    | {
        address?: string;
        hours?: string;
        email?: string;
        instagram?: string;
      }
    | undefined;

  const enableLive =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_SANITY_LIVE === "true";

  return (
    <div className="min-h-screen flex flex-col">
      {enableLive && <SanityLive />}
      <header className="px-4 py-4 sm:py-6 border-b border-black/10">
        <nav className="nav-sans wrap grid-12 items-center">
          <div className="col-span-6 md:col-span-3">
            <Link href="/" className="nav-sans font-medium tracking-tight">
              Strawhouse
            </Link>
          </div>
          <div className="col-span-6 md:col-span-9 flex items-center justify-end gap-6 text-sm">
            <Link href="/" className="nav-sans">
              Shows
            </Link>
            <Link href="/about" className="nav-sans">
              About
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="px-4 py-8 border-t border-black/10 mt-16">
        <div className="wrap grid-12 gap-y-2 text-sm text-gray-700">
          <div className="col-span-12 md:col-span-3">
            {site?.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(site.address)}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
                aria-label={`Open map for ${site.address}`}
              >
                {site.address}
              </a>
            )}
          </div>
          <div className="col-span-12 md:col-span-3">{site?.hours}</div>
          <div className="col-span-12 md:col-span-3">
            {site?.email && (
              <a className="underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            )}
          </div>
          <div className="col-span-12 md:col-span-3">
            {site?.instagram && (
              <a
                className="underline"
                href={site.instagram}
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
