import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const chaptersRoot = path.join(projectRoot, "chapters");

function stripFrontmatter(source) {
  if (!source.startsWith("---")) {
    return source;
  }

  const closingIndex = source.indexOf("\n---", 3);
  return closingIndex === -1 ? source : source.slice(closingIndex + 4);
}

function stripCodeBlocks(source) {
  return source.replace(/```[\s\S]*?```/g, "");
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[`*_~()[\]{}<>]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeRoute(route) {
  if (!route) {
    return "/";
  }

  const normalized = route.startsWith("/") ? route : `/${route}`;
  const withoutTrailingSlash = normalized.replace(/\/+$/, "");
  return withoutTrailingSlash || "/";
}

function extractHeadings(source) {
  const matches = source.matchAll(/^#{1,6}\s+(.+)$/gm);
  return Array.from(matches, (match) => slugify(match[1]));
}

function extractLinks(source) {
  const matches = source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g);
  return Array.from(matches, (match) => {
    const target = match[1].trim().replace(/^<|>$/g, "");
    return target.split(/\s+/)[0];
  });
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

function isExternal(target) {
  return /^(https?:|mailto:|tel:|data:)/i.test(target);
}

function resolveRouteTarget(target, currentRoute) {
  const [pathname, hash] = target.split("#");

  if (!pathname) {
    return {
      route: currentRoute,
      hash
    };
  }

  if (pathname.endsWith(".md") || pathname.endsWith(".mdx")) {
    return {
      fileReference: pathname,
      hash
    };
  }

  if (pathname.startsWith("/")) {
    return {
      route: normalizeRoute(pathname),
      hash
    };
  }

  return {
    route: normalizeRoute(path.posix.resolve(path.posix.dirname(currentRoute), pathname)),
    hash
  };
}

const failures = [];
const files = await findMdxFiles(chaptersRoot);
const routeMap = new Map();
const fileMap = new Map();

for (const filePath of files) {
  const relative = path.relative(chaptersRoot, filePath).replaceAll(path.sep, "/");
  const route = normalizeRoute(`/${relative.replace(/\.mdx$/, "").replace(/\/index$/, "")}`);
  const raw = await fs.readFile(filePath, "utf8");
  const source = stripCodeBlocks(stripFrontmatter(raw));
  const anchors = new Set(extractHeadings(source));
  routeMap.set(route, {
    filePath,
    anchors
  });
  fileMap.set(filePath, route);
}

routeMap.set("/", { filePath: path.join(projectRoot, "src/app/page.tsx"), anchors: new Set() });

for (const filePath of files) {
  const raw = await fs.readFile(filePath, "utf8");
  const source = stripCodeBlocks(stripFrontmatter(raw));
  const links = extractLinks(source);
  const currentRoute = fileMap.get(filePath);

  for (const link of links) {
    if (!link || isExternal(link)) {
      continue;
    }

    const resolved = resolveRouteTarget(link, currentRoute);

    if ("fileReference" in resolved) {
      const absoluteTarget = path.resolve(path.dirname(filePath), resolved.fileReference);
      const route = fileMap.get(absoluteTarget);

      if (!route) {
        failures.push(
          `${path.relative(projectRoot, filePath)} -> ${link}: target file does not exist in chapters/`
        );
        continue;
      }

      if (resolved.hash && !routeMap.get(route)?.anchors.has(resolved.hash)) {
        failures.push(
          `${path.relative(projectRoot, filePath)} -> ${link}: missing heading #${resolved.hash}`
        );
      }

      continue;
    }

    const targetEntry = routeMap.get(resolved.route);

    if (!targetEntry) {
      failures.push(
        `${path.relative(projectRoot, filePath)} -> ${link}: route ${resolved.route} does not exist`
      );
      continue;
    }

    if (resolved.hash && !targetEntry.anchors.has(resolved.hash)) {
      failures.push(
        `${path.relative(projectRoot, filePath)} -> ${link}: missing heading #${resolved.hash}`
      );
    }
  }
}

if (failures.length > 0) {
  console.error("Internal link validation failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validated internal links across ${files.length} chapter files.`);

