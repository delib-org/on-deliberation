import Link from "next/link";
import references from "@/data/references.json";
import type { Locale } from "@/data/book";

type CitationProps = {
  id: string;
  locale: Locale;
};

function shortAuthor(author: string) {
  return author.split(",")[0];
}

export function Citation({ id, locale }: CitationProps) {
  const entry = references[id as keyof typeof references];

  if (!entry) {
    return <span className="rounded bg-red-100 px-2 py-0.5 text-red-700">[{id}]</span>;
  }

  const label = `${shortAuthor(entry.author)}, ${entry.year}`;
  const description = `${entry.author} (${entry.year}). ${entry.title}`;

  return (
    <Link
      href={`/${locale}/references#${id}`}
      title={description}
      aria-label={description}
      className="rounded-full border border-line bg-white/70 px-3 py-1 text-[0.85em] no-underline transition hover:border-accent hover:text-accent"
    >
      {label}
    </Link>
  );
}
