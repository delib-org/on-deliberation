import Link from "next/link";
import type { ChapterSummary } from "@/src/lib/content";

type BookTocProps = {
  currentSlug: string;
  chapters: ChapterSummary[];
  label?: string;
};

export function BookToc({ currentSlug, chapters, label = "Contents" }: BookTocProps) {
  return (
    <aside className="panel rounded-[1.5rem] p-5 lg:sticky lg:top-8">
      <p className="text-xs uppercase tracking-[0.3em] text-ink/48">{label}</p>
      <nav className="mt-4 space-y-2">
        {chapters.map((chapter) => {
          const isActive = chapter.slug === currentSlug;

          return (
            <Link
              key={chapter.slug}
              href={`/${chapter.locale}/${chapter.slug}`}
              className={`block rounded-2xl px-4 py-3 text-sm leading-6 transition ${
                isActive
                  ? "bg-accent text-white"
                  : "border border-transparent text-ink/72 hover:border-line hover:bg-white/45"
              }`}
            >
              <span className="block text-[0.68rem] uppercase tracking-[0.22em] opacity-70">
                {chapter.order}
              </span>
              <span className="block text-base tracking-tight">{chapter.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
