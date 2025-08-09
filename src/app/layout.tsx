import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${generalSans.variable} ${sentient.variable} antialiased min-h-screen`}
      >
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
