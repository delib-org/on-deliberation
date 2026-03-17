export const siteConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://delib-org.github.io/on-deliberation",
  github: {
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER ?? "delib-org",
    repo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "on-deliberation",
    defaultBranch: "main"
  }
};
