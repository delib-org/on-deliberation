import references from "@/data/references.json";
import type { Locale } from "@/data/book";

type ReferenceEntry = (typeof references)[keyof typeof references];

type ReferencesListProps = {
  locale?: Locale;
};

function compareReferences(a: ReferenceEntry, b: ReferenceEntry) {
  return a.author.localeCompare(b.author);
}

export function ReferencesList({ locale = "en" }: ReferencesListProps) {
  const items = Object.values(references).sort(compareReferences);

  return (
    <ol className="mt-8 space-y-4">
      {items.map((reference) => (
        <li
          key={reference.id}
          id={reference.id}
          className="rounded-2xl border border-line bg-white/45 p-4"
          dir={locale === "he" ? "rtl" : "ltr"}
        >
          <span className="font-medium">{reference.author}</span> ({reference.year}).{" "}
          <em>{reference.title}</em>
          {reference.source ? <>. {reference.source}</> : null}
          {reference.url ? (
            <>
              {" "}
              <a
                href={reference.url}
                className="break-all text-accent underline-offset-2 hover:underline"
              >
                {reference.url}
              </a>
            </>
          ) : null}
          .
        </li>
      ))}
    </ol>
  );
}
