import Link from "next/link";
import { bookConfig } from "@/data/book";
import { getAllChapters } from "@/src/lib/content";

export const dynamic = "force-static";

export default async function AdminIndexPage() {
  const locales = Object.keys(bookConfig.locales) as Array<keyof typeof bookConfig.locales>;
  const chapterSets = await Promise.all(
    locales.map(async (locale) => ({
      locale,
      config: bookConfig.locales[locale],
      chapters: await getAllChapters(locale)
    }))
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-20 lg:px-10">
      <section className="panel rounded-[2rem] p-8 lg:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/48">Admin</p>
        <h1 className="mt-4 text-5xl tracking-tight text-ink sm:text-6xl">Edit The Book</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/70">
          This editor works on the static GitHub Pages deployment by committing chapter files back to
          GitHub. To save changes, use a fine-grained GitHub token with repository contents write
          access for <code>delib-org/on-deliberation</code>.
        </p>
        <p className="mt-3 max-w-3xl text-base leading-8 text-ink/62">
          Changes saved here create a commit on <code>main</code>, which then triggers the GitHub
          Pages deployment workflow.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {chapterSets.map(({ locale, config, chapters }) => (
          <section key={locale} className="panel rounded-[2rem] p-6 lg:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink/48">{config.code}</p>
                <h2 className="mt-2 text-3xl tracking-tight text-ink">{config.label}</h2>
              </div>
              <span className="rounded-full border border-line px-3 py-2 text-xs uppercase tracking-[0.22em] text-ink/58">
                {chapters.length} chapters
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {chapters.map((chapter) => (
                <div
                  key={chapter.slug}
                  className="rounded-[1.5rem] border border-line bg-white/45 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-ink/48">
                    {chapter.order}. {chapter.status}
                  </p>
                  <h3 className="mt-2 text-xl tracking-tight text-ink">{chapter.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink/65">{chapter.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/admin/${locale}/${chapter.slug}`}
                      className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Open editor
                    </Link>
                    <Link
                      href={`/${locale}/${chapter.slug}`}
                      className="rounded-full border border-line px-4 py-2 text-sm text-ink/75 transition hover:border-accent hover:text-accent"
                    >
                      View public page
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
