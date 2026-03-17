import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const chaptersRoot = path.join(projectRoot, "chapters", "en");
const referencesPath = path.join(projectRoot, "data", "references.json");

const chapterMeta = {
  Preface: {
    slug: "preface",
    order: 1,
    status: "stable"
  },
  Introduction: {
    slug: "introduction",
    order: 2,
    status: "stable"
  },
  "Chapter 1: On the Crisis of Democratic Coordination": {
    slug: "chapter-1",
    order: 3,
    status: "stable"
  },
  "Chapter 2: On the Nature of Human Deliberation": {
    slug: "chapter-2",
    order: 4,
    status: "stable"
  },
  "Chapter 3: On Knowledge": {
    slug: "chapter-3",
    order: 5,
    status: "stable"
  },
  "Chapter 4: On the Elements of Collective Reasoning": {
    slug: "chapter-4",
    order: 6,
    status: "stable"
  },
  "Chapter 5: On Deliberative Processes": {
    slug: "chapter-5",
    order: 7,
    status: "draft"
  },
  "Chapter 6: On the Technology of Democratic Deliberation": {
    slug: "chapter-6",
    order: 8,
    status: "stable"
  },
  "Chapter 7: On the Practice of Structured Deliberation": {
    slug: "chapter-7",
    order: 9,
    status: "stable"
  },
  References: {
    slug: "references",
    order: 10,
    status: "stable"
  }
};

function usage() {
  console.error("Usage: node src/scripts/import-manuscript.mjs /absolute/path/to/manuscript.md");
  process.exit(1);
}

function cleanTitle(rawTitle) {
  return rawTitle.replace(/\s*\{#.+\}\s*$/, "").trim();
}

function compactParagraphs(text) {
  return text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}

function buildDescription(body) {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const preferred = lines.find(
    (line) =>
      !line.startsWith("#") &&
      !line.startsWith(">") &&
      !line.startsWith("- ") &&
      !line.startsWith("* ") &&
      !/^\*\*.+\*\*:?\s*$/.test(line) &&
      !line.startsWith("---") &&
      !line.startsWith("[^")
  );

  const plain = preferred ? preferred.replace(/^[*_]+|[*_]+$/g, "") : "";
  const normalized = compactParagraphs(plain);

  if (normalized.length <= 170) {
    return normalized;
  }

  return `${normalized.slice(0, 167).trimEnd()}...`;
}

function quoteYaml(value) {
  return JSON.stringify(value);
}

function splitSections(source) {
  const normalized = source.replace(/\r\n/g, "\n");
  const sectionRegex = /^##\s+(.+)$/gm;
  const matches = Array.from(normalized.matchAll(sectionRegex));
  const sections = [];

  for (let index = 0; index < matches.length; index += 1) {
    const start = matches[index].index ?? 0;
    const end = matches[index + 1]?.index ?? normalized.length;
    const heading = matches[index][1].trim();
    const content = normalized.slice(start, end).trim();
    sections.push({ heading, content });
  }

  return sections;
}

function parseFootnotes(sectionContent) {
  const definitions = new Map();
  const pattern = /^\[\^(\d+)\]:\s+(.+)$/gm;

  for (const match of sectionContent.matchAll(pattern)) {
    definitions.set(match[1], match[2].trim());
  }

  return definitions;
}

function extractUsedFootnotes(body) {
  return Array.from(new Set(Array.from(body.matchAll(/\[\^(\d+)\]/g), (match) => match[1])));
}

function injectComponents(title, body) {
  let nextBody = body;

  if (title === "Chapter 3: On Knowledge") {
    nextBody = nextBody.replace(
      "In this infinite process, a SON of questions is translated into linked objects.",
      "In this infinite process, a SON of questions is translated into linked objects.\n\n<SonGraph />"
    );
  }

  if (title === "Chapter 6: On the Technology of Democratic Deliberation") {
    nextBody = nextBody.replace(
      "This formula effectively balances the quality of ratings (average score) with the quantity of participation (number of evaluators), creating a robust measure of group consensus that works across various scenarios and group sizes.",
      "This formula effectively balances the quality of ratings (average score) with the quantity of participation (number of evaluators), creating a robust measure of group consensus that works across various scenarios and group sizes.\n\n<ConsensusCalculator />"
    );
  }

  return nextBody;
}

function normalizeBody(sectionTitle, sectionContent, footnotes) {
  const lines = sectionContent.split("\n");
  lines.shift();

  let body = lines.join("\n").trim();
  body = body.replace(/^---\n+/, "");
  body = body.replace(/\n+---\s*$/, "");
  body = injectComponents(sectionTitle, body);

  const usedFootnotes = extractUsedFootnotes(body);

  if (usedFootnotes.length > 0) {
    const footer = usedFootnotes
      .map((id, index) => {
        const definition = footnotes.get(id);

        if (!definition) {
          return "";
        }

        return `${index === 0 ? "\n\n---\n\n" : "\n"}[^${id}]: ${definition}`;
      })
      .join("");

    body += footer;
  }

  return body.trim();
}

function parseReferenceEntry(rawEntry) {
  const entry = rawEntry.trim().replace(/\s+/g, " ");
  const match = entry.match(/^(?<author>.+?) \((?<year>\d{4})\)\. (?<rest>.+)$/);

  if (!match?.groups) {
    throw new Error(`Unable to parse reference entry: ${entry}`);
  }

  const { author, year, rest } = match.groups;
  let title = "";
  let source = "";
  let url = "";

  if (rest.startsWith("*")) {
    const italicMatch = rest.match(/^\*(.+?)\*\.\s*(.*)$/);

    if (italicMatch) {
      title = italicMatch[1].trim();
      source = italicMatch[2].trim().replace(/\.$/, "");
    }
  } else if (rest.includes(" *")) {
    const splitIndex = rest.indexOf(" *");
    title = rest.slice(0, splitIndex).trim().replace(/[.?!]$/, "");
    source = rest.slice(splitIndex + 1).trim().replace(/\.$/, "");
  } else {
    const [rawTitle, ...rawSourceParts] = rest.split(". ");
    title = rawTitle.trim().replace(/\.$/, "");
    source = rawSourceParts.join(". ").trim().replace(/\.$/, "");
  }

  const urlMatch = source.match(/https?:\/\/\S+$/);
  if (urlMatch) {
    url = urlMatch[0];
    source = source.replace(url, "").trim().replace(/\.$/, "");
  }

  source = source.replace(/\*/g, "");

  return {
    author,
    year,
    title,
    source,
    url
  };
}

function createReferenceId(author, year, title, seen) {
  const authorToken = author
    .split(",")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const titleToken = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join("");

  let candidate = `${authorToken}${year}${titleToken}`;
  let counter = 2;

  while (seen.has(candidate)) {
    candidate = `${authorToken}${year}${titleToken}${counter}`;
    counter += 1;
  }

  seen.add(candidate);
  return candidate;
}

async function writeChapter({ title, body }) {
  const meta = chapterMeta[title];

  if (!meta) {
    return;
  }

  const description = title === "References"
    ? "Canonical references generated from the book bibliography dataset."
    : buildDescription(body);

  const frontmatter = [
    "---",
    `title: ${quoteYaml(title)}`,
    `description: ${quoteYaml(description)}`,
    `order: ${meta.order}`,
    'locale: "en"',
    `status: ${quoteYaml(meta.status)}`,
    "---",
    "",
    `# ${title}`,
    "",
    body.trim(),
    ""
  ].join("\n");

  await fs.writeFile(path.join(chaptersRoot, `${meta.slug}.mdx`), frontmatter, "utf8");
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    usage();
  }

  const source = await fs.readFile(path.resolve(inputPath), "utf8");
  const sections = splitSections(source);
  const footnotesSection = sections.find((section) => cleanTitle(section.heading) === "Footnotes");

  if (!footnotesSection) {
    throw new Error("Footnotes section not found in manuscript.");
  }

  const footnotes = parseFootnotes(footnotesSection.content);
  const manuscriptSections = sections.filter((section) => {
    const title = cleanTitle(section.heading);
    return title !== "Table of Contents" && title !== "Footnotes";
  });

  for (const section of manuscriptSections) {
    const title = cleanTitle(section.heading);

    if (title === "References") {
      continue;
    }

    const body = normalizeBody(title, section.content, footnotes);
    await writeChapter({ title, body });
  }

  const referencesSection = manuscriptSections.find(
    (section) => cleanTitle(section.heading) === "References"
  );

  if (!referencesSection) {
    throw new Error("References section not found in manuscript.");
  }

  const referenceEntries = referencesSection.content
    .split("\n")
    .slice(1)
    .join("\n")
    .trim()
    .split(/\n\s*\n/)
    .map((entry) => entry.trim())
    .filter((entry) => entry && entry !== "---");

  const seenIds = new Set();
  const references = {};

  for (const entry of referenceEntries) {
    const parsed = parseReferenceEntry(entry);
    const id = createReferenceId(parsed.author, parsed.year, parsed.title, seenIds);
    references[id] = {
      id,
      ...parsed
    };
  }

  await fs.writeFile(referencesPath, `${JSON.stringify(references, null, 2)}\n`, "utf8");

  const referencesBody = [
    "This section is generated from the canonical metadata stored in `/data/references.json`.",
    "",
    "<ReferencesList />"
  ].join("\n");

  await writeChapter({ title: "References", body: referencesBody });
}

await main();
