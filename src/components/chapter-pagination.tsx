import Link from "next/link";
import type { ChapterSummary } from "@/src/lib/content";

type ChapterPaginationProps = {
  previous?: ChapterSummary;
  next?: ChapterSummary;
  previousLabel?: string;
  nextLabel?: string;
};

function ChapterCard({
  chapter,
  label,
  align
}: {
  chapter: ChapterSummary;
  label: string;
  align: "left" | "right";
}) {
  return (
    <Link
      href={`/${chapter.locale}/${chapter.slug}`}
      className={`panel rounded-[1.5rem] p-5 transition hover:-translate-y-0.5 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-ink/48">{label}</p>
      <h3 className="mt-2 text-xl tracking-tight text-ink">{chapter.title}</h3>
      <p className="mt-2 text-sm leading-7 text-ink/65">{chapter.description}</p>
    </Link>
  );
}

export function ChapterPagination({
  previous,
  next,
  previousLabel = "Previous",
  nextLabel = "Next"
}: ChapterPaginationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {previous ? <ChapterCard chapter={previous} label={previousLabel} align="left" /> : <div />}
      {next ? <ChapterCard chapter={next} label={nextLabel} align="right" /> : <div />}
    </div>
  );
}
