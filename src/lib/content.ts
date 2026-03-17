import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { isLocale, type Locale } from "@/data/book";
import references from "@/data/references.json";
import { getMDXComponents } from "@/src/lib/mdx";

const CHAPTER_ROOT = path.join(process.cwd(), "chapters");
const MDX_EXTENSION = ".mdx";

export type ChapterFrontmatter = {
  title: string;
  description: string;
  order: number;
  locale: Locale;
  status: string;
};

export type ChapterSummary = ChapterFrontmatter & {
  slug: string;
};

export type Chapter = ChapterSummary & {
  content: React.ReactNode;
  citations: string[];
  references: string[];
};

function chapterDirectory(locale: Locale) {
  return path.join(CHAPTER_ROOT, locale);
}

function chapterFilePath(locale: Locale, slug: string) {
  return path.join(chapterDirectory(locale), `${slug}${MDX_EXTENSION}`);
}

function replaceCitations(source: string) {
  return source.replace(/\[@([a-zA-Z0-9:_-]+)\]/g, '<Citation id="$1" />');
}

function extractCitationIds(source: string) {
  return Array.from(source.matchAll(/\[@([a-zA-Z0-9:_-]+)\]/g)).map((match) => match[1]);
}

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[*_[\]()`]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function leadSurname(author: string) {
  return author.split(",")[0]?.trim() ?? "";
}

function stripFrontmatter(source: string) {
  if (!source.startsWith("---")) {
    return source;
  }

  const endIndex = source.indexOf("\n---", 3);
  if (endIndex === -1) {
    return source;
  }

  return source.slice(endIndex + 4).trimStart();
}

function parseFootnotes(source: string) {
  const definitions = new Map<string, string>();

  for (const match of source.matchAll(/^\[\^([0-9]+)\]:\s+(.+)$/gm)) {
    definitions.set(match[1], match[2].trim());
  }

  return definitions;
}

function extractUsedFootnotes(source: string) {
  return Array.from(new Set(Array.from(source.matchAll(/\[\^([0-9]+)\](?!:)/g), (match) => match[1])));
}

function matchReferenceFromFootnote(definition: string) {
  const normalizedDefinition = normalizeText(definition);

  if (!normalizedDefinition) {
    return null;
  }

  const matches = Object.values(references).filter((reference) => {
    const normalizedTitle = normalizeText(reference.title);
    const normalizedSurname = normalizeText(leadSurname(reference.author));

    return (
      normalizedDefinition.includes(reference.year.toLowerCase()) &&
      normalizedDefinition.includes(normalizedTitle) &&
      (normalizedSurname.length < 4 || normalizedDefinition.includes(normalizedSurname))
    );
  });

  return matches[0]?.id ?? null;
}

function detectReferencedWorks(source: string) {
  const content = stripFrontmatter(source);
  const explicitCitations = extractCitationIds(content);
  const detected = new Set(explicitCitations);
  const footnotes = parseFootnotes(content);
  const usedFootnotes = extractUsedFootnotes(content);
  const contentWithoutFootnotes = content.replace(/^\[\^([0-9]+)\]:\s+.+$/gm, "");
  const normalizedContent = normalizeText(contentWithoutFootnotes);

  for (const footnoteId of usedFootnotes) {
    const definition = footnotes.get(footnoteId);

    if (!definition) {
      continue;
    }

    const referenceId = matchReferenceFromFootnote(definition);

    if (referenceId) {
      detected.add(referenceId);
    }
  }

  for (const reference of Object.values(references)) {
    if (detected.has(reference.id)) {
      continue;
    }

    const normalizedTitle = normalizeText(reference.title);
    const surname = leadSurname(reference.author);
    const titleMatch = normalizedTitle.length > 12 && normalizedContent.includes(normalizedTitle);
    const surnameMatch =
      surname.length >= 4 &&
      new RegExp(`\\b${escapeRegex(surname)}\\b`, "g").test(contentWithoutFootnotes);

    if (titleMatch || surnameMatch) {
      detected.add(reference.id);
    }
  }

  return Array.from(detected).sort((left, right) => {
    const leftEntry = references[left as keyof typeof references];
    const rightEntry = references[right as keyof typeof references];
    const leftAuthor = leftEntry ? leadSurname(leftEntry.author) : left;
    const rightAuthor = rightEntry ? leadSurname(rightEntry.author) : right;

    return leftAuthor.localeCompare(rightAuthor) || left.localeCompare(right);
  });
}

async function readDirectory(locale: Locale) {
  const directory = chapterDirectory(locale);
  const entries = await fs.readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(MDX_EXTENSION))
    .map((entry) => entry.name.replace(MDX_EXTENSION, ""));
}

export async function getAllChapters(locale: Locale): Promise<ChapterSummary[]> {
  const slugs = await readDirectory(locale);

  const summaries = await Promise.all(
    slugs.map(async (slug) => {
      const source = await fs.readFile(chapterFilePath(locale, slug), "utf8");
      const { data } = matter(source);

      return {
        slug,
        title: String(data.title),
        description: String(data.description),
        order: Number(data.order),
        locale,
        status: String(data.status)
      };
    })
  );

  return summaries.sort((left, right) => left.order - right.order);
}

export async function getAllChapterParams() {
  const locales = (await fs.readdir(CHAPTER_ROOT, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && isLocale(entry.name))
    .map((entry) => entry.name as Locale);

  const params = await Promise.all(
    locales.map(async (locale) => {
      const chapters = await getAllChapters(locale);
      return chapters.map((chapter) => ({
        locale,
        slug: chapter.slug
      }));
    })
  );

  return params.flat();
}

export async function getChapter(locale: Locale, slug: string): Promise<Chapter | null> {
  const file = chapterFilePath(locale, slug);

  try {
    const rawSource = await fs.readFile(file, "utf8");
    const citations = extractCitationIds(rawSource);
    const detectedReferences = detectReferencedWorks(rawSource);
    const transformedSource = replaceCitations(rawSource);

    const { content, frontmatter } = await compileMDX<ChapterFrontmatter>({
      source: transformedSource,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [
            rehypeKatex,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }]
          ]
        }
      },
      components: getMDXComponents(locale)
    });

    return {
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      order: Number(frontmatter.order),
      locale,
      status: frontmatter.status,
      citations,
      references: detectedReferences,
      content
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
