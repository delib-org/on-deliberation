import { siteConfig } from "@/data/site";

type FeedbackProps = {
  title: string;
  locale: string;
  slug: string;
};

export function Feedback({ title, locale, slug }: FeedbackProps) {
  const contributingUrl = `https://github.com/${siteConfig.github.owner}/${siteConfig.github.repo}/blob/${siteConfig.github.defaultBranch}/CONTRIBUTING.md`;
  const issueBody = [
    "## Argument Target",
    `- Chapter: ${title}`,
    `- Route: /${locale}/${slug}`,
    "",
    "## Statement Type",
    "- [ ] Critique Statement",
    "- [ ] Reinforcement Statement",
    "",
    "## Summary",
    "Describe the specific argument, claim, or paragraph you want to address.",
    "",
    "## Evidence or Reasoning",
    "Add citations, examples, or logic that supports your feedback.",
    "",
    "## Proposed Refinement",
    "If you already see a concrete revision, outline it here."
  ].join("\n");

  const issueUrl = `https://github.com/${siteConfig.github.owner}/${siteConfig.github.repo}/issues/new?template=deliberative-feedback.yml&title=${encodeURIComponent(`[${locale}/${slug}] ${title}`)}&body=${encodeURIComponent(issueBody)}`;

  return (
    <section className="panel rounded-[1.75rem] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-ink/48">Feedback</p>
      <h2 className="mt-3 text-2xl tracking-tight text-ink">Open a page-scoped deliberative issue</h2>
      <p className="mt-3 max-w-2xl text-base leading-8 text-ink/68">
        Use GitHub Issues for argument-level feedback. Each issue should target one claim or
        section and classify the contribution as either a critique statement or a reinforcement
        statement.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={issueUrl}
          className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Open feedback issue
        </a>
        <a
          href={contributingUrl}
          className="rounded-full border border-line px-5 py-3 text-sm text-ink/75 transition hover:border-accent hover:text-accent"
        >
          Read contribution rules
        </a>
      </div>
    </section>
  );
}
