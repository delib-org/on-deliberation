import Link from "next/link";
import { notFound } from "next/navigation";
import { bookConfig, isLocale } from "@/data/book";
import { AdminEditorLoader } from "@/src/components/admin/admin-editor-loader";
import { getAllChapterParams, getChapter } from "@/src/lib/content";

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

export default async function AdminChapterPage({ params }: PageProps) {
  const resolvedParams = await params;

  if (!isLocale(resolvedParams.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale;
  const chapter = await getChapter(locale, resolvedParams.slug);

  if (!chapter) {
    notFound();
  }

  const localeConfig = bookConfig.locales[locale];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-20 lg:px-10">
      <section className="panel rounded-[2rem] p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-ink/48">
          <span>Admin</span>
          <span>{localeConfig.label}</span>
        </div>
        <h1 className="mt-4 text-4xl tracking-tight text-ink sm:text-5xl">{chapter.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/70">{chapter.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-line px-4 py-2 text-sm text-ink/75 transition hover:border-accent hover:text-accent"
          >
            Back to admin
          </Link>
          <Link
            href={`/${locale}/${chapter.slug}`}
            className="rounded-full border border-line px-4 py-2 text-sm text-ink/75 transition hover:border-accent hover:text-accent"
          >
            View public page
          </Link>
        </div>
      </section>

      <AdminEditorLoader
        locale={locale}
        slug={chapter.slug}
        title={chapter.title}
        publicHref={`/${locale}/${chapter.slug}`}
        chapterPath={`chapters/${locale}/${chapter.slug}.mdx`}
      />
    </main>
  );
}
