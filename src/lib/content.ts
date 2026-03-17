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
      content
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
