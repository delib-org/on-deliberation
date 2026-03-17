import Link from "next/link";
import { bookConfig } from "@/data/book";
import { getAllChapters } from "@/src/lib/content";

export default async function HomePage() {
  const englishChapters = await getAllChapters("en");
  const hebrewChapters = await getAllChapters("he");

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-20 pt-6 lg:px-10">
      <section className="panel rounded-[2rem] p-8 lg:p-12">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-ink/55">Living Book Platform</p>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-line bg-white/45 px-4 py-2 text-xs uppercase tracking-[0.24em] text-ink/62">
              Written by {bookConfig.author}
            </p>
            <h1 className="max-w-3xl text-5xl leading-tight tracking-tight text-ink sm:text-6xl">
              {bookConfig.title}
            </h1>
            <p className="max-w-2xl text-xl leading-8 text-ink/78">{bookConfig.subtitle}</p>
            <p className="max-w-2xl text-base leading-8 text-ink/68">
              The full manuscript now lives here as a citable, collaborative, multilingual book
              site. Chapters are published from MDX, bibliography lives in shared data, and
              validation runs in CI on every push.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-line bg-white/45 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-ink/55">Built For</p>
            <ul className="mt-4 space-y-3 text-base leading-7 text-ink/72">
              <li>Clear authorship and academic attribution for Tal Yaron</li>
              <li>Academic citation via `CITATION.cff`</li>
              <li>Interactive MDX with React components</li>
              <li>GitHub-native issues, PRs, and Pages deployment</li>
              <li>English and Hebrew publishing with RTL support</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="panel rounded-[1.75rem] p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl tracking-tight text-ink">English Chapters</h2>
            <span className="rounded-full bg-accentSoft px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent">
              LTR
            </span>
          </div>
          <div className="space-y-4">
            {englishChapters.map((chapter) => (
              <Link
                key={chapter.slug}
                href={`/${chapter.locale}/${chapter.slug}`}
                className="block rounded-2xl border border-line bg-white/45 p-5 transition hover:-translate-y-0.5 hover:border-accent"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-ink/48">
                  Chapter {chapter.order}
                </p>
                <h3 className="mt-2 text-xl tracking-tight text-ink">{chapter.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink/68">{chapter.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="panel rounded-[1.75rem] p-8" dir="rtl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl tracking-tight text-ink">קטעים בעברית</h2>
            <span className="rounded-full bg-accentSoft px-3 py-1 text-xs uppercase tracking-[0.24em] text-accent">
              RTL
            </span>
          </div>
          <div className="space-y-4">
            {hebrewChapters.map((chapter) => (
              <Link
                key={chapter.slug}
                href={`/${chapter.locale}/${chapter.slug}`}
                className="block rounded-2xl border border-line bg-white/45 p-5 transition hover:-translate-y-0.5 hover:border-accent"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-ink/48">
                  פרק {chapter.order}
                </p>
                <h3 className="mt-2 text-xl tracking-tight text-ink">{chapter.title}</h3>
                <p className="mt-2 text-sm leading-8 text-ink/68">{chapter.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
