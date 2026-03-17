# Contributing to On Deliberation

This repository treats contributions as proposed refinements to an evolving argument. The goal is not only to fix mistakes, but to improve the quality of collective reasoning around each claim.

## Contribution Modes

- `Refinement PR`: propose a textual, structural, translational, or bibliographic improvement.
- `Deliberative Issue`: open an issue when the argument itself needs challenge, reinforcement, or clarification before a patch is obvious.

## Before You Open a Pull Request

1. Scope the contribution to a single argument, chapter section, or reference cluster whenever possible.
2. Link the exact chapter slug and heading you are refining.
3. State whether the refinement is driven by a `Critique Statement` or a `Reinforcement Statement`.
4. Include supporting evidence, citations, or implementation rationale for the change.
5. If the change affects Hebrew content, preserve right-to-left readability and note whether the text is translated, proofread, or still a draft.

## Refinement Principles

- Prefer precise disagreements over broad objections.
- Preserve dissenting nuance when it improves the argument.
- Separate evidence from interpretation.
- When modifying a claim, explain what new coordination value the revised phrasing creates.
- Keep editorial and conceptual changes in separate pull requests when feasible.

## Recommended Workflow

1. Open a deliberative feedback issue for substantive conceptual changes.
2. Create a branch and keep the PR focused on one refinement thread.
3. Update chapter content in `/chapters`, metadata in `/data`, and logic in `/src` only when required by the refinement.
4. Run `npm run validate` before submitting.
5. In the PR description, include:
   - the affected chapter and heading
   - statement type: critique or reinforcement
   - summary of the refinement
   - evidence or source links
   - any follow-up questions that remain unresolved

## Style Notes

- Use MDX for chapters when interactive components or structured JSX are helpful.
- Use citation keys in the form `[@referenceKey]`; definitions live in `/data/references.json`.
- Internal chapter links should use site routes such as `/en/introduction` or `/he/process-draft`.
- Keep frontmatter complete: title, description, order, locale, and status.

