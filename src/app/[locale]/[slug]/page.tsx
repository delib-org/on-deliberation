import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bookConfig, isLocale } from "@/data/book";
import { BookToc } from "@/src/components/book-toc";
import { ChapterPagination } from "@/src/components/chapter-pagination";
import { Feedback } from "@/src/components/feedback";
import { getAllChapterParams, getAllChapters, getChapter } from "@/src/lib/content";

type PageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllChapterParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    return {};
  }

  const chapter = await getChapter(resolvedParams.locale, resolvedParams.slug);

  if (!chapter) {
    return {};
  }

  return {
    title: chapter.title,
    description: chapter.description
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale;
  const chapter = await getChapter(locale, resolvedParams.slug);

  if (!chapter) {
    notFound();
  }

  const chapters = await getAllChapters(locale);
  const currentIndex = chapters.findIndex((entry) => entry.slug === chapter.slug);
  const previous = currentIndex > 0 ? chapters[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : undefined;
  const localeConfig = bookConfig.locales[locale];
  const ui =
    locale === "he"
      ? {
          contents: "תוכן",
          status: "סטטוס",
          citations: "ציטוטים",
          previous: "הקודם",
          next: "הבא"
        }
      : {
          contents: "Contents",
          status: "Status",
          citations: "Citations",
          previous: "Previous",
          next: "Next"
        };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-20 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <BookToc currentSlug={chapter.slug} chapters={chapters} label={ui.contents} />

        <div className="space-y-6" dir={localeConfig.dir} lang={localeConfig.code}>
          <section className="panel rounded-[2rem] p-8 lg:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/48">{localeConfig.label}</p>
            <h1 className="mt-4 text-5xl tracking-tight text-ink sm:text-6xl">{chapter.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/70">{chapter.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.22em]">
              <span className="rounded-full border border-line px-3 py-2 text-ink/62">
                {ui.status}: {chapter.status}
              </span>
              <span className="rounded-full border border-line px-3 py-2 text-ink/62">
                {ui.citations}: {chapter.citations.length}
              </span>
            </div>
          </section>

          <article className="panel rounded-[2rem] px-8 py-10 lg:px-12 lg:py-12">
            <div className="book-prose">{chapter.content}</div>
          </article>

          <Feedback title={chapter.title} locale={locale} slug={chapter.slug} />
          <ChapterPagination
            previous={previous}
            next={next}
            previousLabel={ui.previous}
            nextLabel={ui.next}
          />
        </div>
      </div>
    </main>
  );
}
