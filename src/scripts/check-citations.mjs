import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const chaptersRoot = path.join(projectRoot, "chapters");
const referencesPath = path.join(projectRoot, "data", "references.json");
const requiredFields = ["id", "author", "year", "title", "publisher"];

function stripFrontmatter(source) {
  if (!source.startsWith("---")) {
    return source;
  }

  const closingIndex = source.indexOf("\n---", 3);
  return closingIndex === -1 ? source : source.slice(closingIndex + 4);
}

function stripCode(source) {
  return source.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]+`/g, "");
}

async function findMdxFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findMdxFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith(".mdx")) {
        return [fullPath];
      }

      return [];
    })
  );

  return nested.flat();
}

function extractCitationIds(source) {
  return Array.from(source.matchAll(/\[@([a-zA-Z0-9:_-]+)\]/g), (match) => match[1]);
}

const references = JSON.parse(await fs.readFile(referencesPath, "utf8"));
const files = await findMdxFiles(chaptersRoot);
const failures = [];
const citedKeys = new Set();

for (const [key, entry] of Object.entries(references)) {
  for (const field of requiredFields) {
    if (!entry[field]) {
      failures.push(`data/references.json -> ${key}: missing required field "${field}"`);
    }
  }

  if (entry.id !== key) {
    failures.push(`data/references.json -> ${key}: "id" must match the object key`);
  }
}

for (const filePath of files) {
  const raw = await fs.readFile(filePath, "utf8");
  const source = stripCode(stripFrontmatter(raw));
  const citations = extractCitationIds(source);

  for (const citation of citations) {
    citedKeys.add(citation);

    if (!references[citation]) {
      failures.push(`${path.relative(projectRoot, filePath)} -> [@${citation}] is undefined`);
    }
  }
}

if (citedKeys.size === 0) {
  failures.push("No citations were found in chapters/. Add at least one [@citationKey] reference.");
}

if (failures.length > 0) {
  console.error("Citation validation failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validated ${citedKeys.size} unique citation keys across ${files.length} chapter files.`);
