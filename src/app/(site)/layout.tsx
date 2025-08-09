import type { Metadata } from "next";
import Link from "next/link";
import { SanityLive, sanityFetch } from "@/sanity/lib/live";
import { groq } from "next-sanity";

export const metadata: Metadata = {
  title: "Strawhouse",
  description: "Strawhouse gallery, Mt Eden, Auckland",
};

const SITE_SINGLETON = groq`*[_type=="site"][0]{address, hours, email, instagram}`;

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const site = (await sanityFetch({ query: SITE_SINGLETON }))?.data as
    | {
        address?: string;
        hours?: string;
        email?: string;
        instagram?: string;
      }
    | undefined;

  return (
    <>
      <SanityLive />
      <header className="px-4 py-4 sm:py-6 border-b border-black/10">
        <nav className="nav-sans wrap grid-12 items-center">
          <div className="col-span-6 md:col-span-3">
            <Link href="/" className="nav-sans font-medium tracking-tight">
              Strawhouse
            </Link>
          </div>
          <div className="col-span-6 md:col-span-9 flex items-center justify-end gap-6 text-sm">
            <Link href="/archive" className="nav-sans">
              Shows
            </Link>
            <Link href="/about" className="nav-sans">
              About
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="px-4 py-10 border-t border-black/10 mt-16">
        <div className="wrap grid-12 gap-y-1 text-sm text-gray-700">
          <div className="col-span-12 md:col-span-3">{site?.address}</div>
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
    </>
  );
}
