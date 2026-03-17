import type { Metadata } from "next";
import Link from "next/link";
import "katex/dist/katex.min.css";
import "@/src/app/globals.css";
import { bookConfig } from "@/data/book";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: bookConfig.title,
    template: `%s | ${bookConfig.title}`
  },
  description: bookConfig.description,
  authors: [{ name: bookConfig.author }],
  creator: bookConfig.author,
  publisher: bookConfig.author,
  openGraph: {
    title: bookConfig.title,
    description: bookConfig.description,
    siteName: `${bookConfig.title} by ${bookConfig.author}`
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mesh-backdrop" />
        <div className="relative min-h-screen">
          <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
            <Link href="/" className="block">
              <span className="block text-sm uppercase tracking-[0.28em] text-ink/70">
                {bookConfig.title}
              </span>
              <span className="mt-1 block text-sm italic text-ink/58">by {bookConfig.author}</span>
            </Link>
            <a
              href={`https://github.com/${siteConfig.github.owner}/${siteConfig.github.repo}`}
              className="rounded-full border border-line px-4 py-2 text-sm text-ink/75 transition hover:border-accent hover:text-accent"
            >
              GitHub
            </a>
          </header>
          {children}
          <footer className="mx-auto max-w-7xl px-6 pb-10 pt-2 text-sm text-ink/58 lg:px-10">
            Written by {bookConfig.author}
          </footer>
        </div>
      </body>
    </html>
  );
}
