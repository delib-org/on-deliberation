import path from "node:path";
import { fileURLToPath } from "node:url";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath = isGitHubActions && repoName ? `/${repoName}` : "";
const configDirectory = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  outputFileTracingRoot: configDirectory,
  images: {
    unoptimized: true
  },
  basePath,
  assetPrefix: basePath
};

export default nextConfig;
