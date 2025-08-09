import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SanityLive, sanityFetch } from "@/sanity/lib/live";
import { groq } from "next-sanity";
import ScrollReveal from "./_components/ScrollReveal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const generalSans = localFont({
  src: [
    {
      path: "../../public/fonts/GeneralSans-Variable.woff2",
      style: "normal",
      weight: "100 900",
    },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

const sentient = localFont({
  src: [
    {
      path: "../../public/fonts/Sentient-Variable.woff2",
      style: "normal",
      weight: "100 900",
    },
  ],
  variable: "--font-sentient",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Strawhouse",
  description: "Strawhouse gallery, Mt Eden, Auckland",
};

const SITE_SINGLETON = groq`*[_type=="site"][0]{address, hours, email, instagram}`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = (await sanityFetch({ query: SITE_SINGLETON }))?.data as
    | {
        address?: string;
        hours?: string;
        email?: string;
        instagram?: string;
      }
    | undefined;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${generalSans.variable} ${sentient.variable} antialiased min-h-screen flex flex-col`}
      >
        <SanityLive />
        <ScrollReveal />
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
      </body>
    </html>
  );
}
