# On Deliberation

> ⚠️ **Work in Progress**  
> This is an ongoing book currently being written.

You can read it here:  
👉 [On Deliberation](https://delib-org.github.io/on-deliberation/)

Docs-as-code repository for *On Deliberation* by Tal Yaron. The repository is structured as a "Living Book": manuscript chapters live as MDX files, academic metadata lives in `/data`, and the rendering plus validation logic lives in `/src`.

## Folder Hierarchy

```text
.
├── .github
│   ├── ISSUE_TEMPLATE
│   └── workflows
├── chapters
│   ├── en
│   └── he
├── data
├── src
│   ├── app
│   ├── components
│   ├── lib
│   └── scripts
├── CITATION.cff
├── CONTRIBUTING.md
└── package.json
```

## Architecture

- `/chapters`: canonical manuscript source in MDX, organized by locale.
- `/data`: book metadata, site configuration, and bibliographic records.
- `/src/app`: Next.js App Router entry points and page shells.
- `/src/components`: React UI and MDX-embeddable interactive components.
- `/src/lib`: content loaders, MDX compilation, and helper utilities.
- `/src/scripts`: CI validation scripts for internal links and citations.

## Commands

```bash
npm install
npm run import:manuscript -- /absolute/path/to/on_deliberation_proofread.md
npm run dev
npm run validate
npm run build
```

## Editing The Book

- Direct chapter editing: update the MDX files in `/chapters/en` or `/chapters/he`.
- Admin editor: open `/admin` on the site, choose a chapter, then unlock the editor with a fine-grained GitHub token that has repository contents write access for `delib-org/on-deliberation`.
- Save flow: the admin editor commits the chapter back to `main`, which triggers the GitHub Pages deployment workflow automatically.
- Full-manuscript refresh: if you are still working from the single manuscript source, rerun `npm run import:manuscript -- /absolute/path/to/on_deliberation_proofread.md`.

## Deployment

The sample workflow in `.github/workflows/deploy.yml` builds a static Next.js export and deploys it to GitHub Pages on every push to `main`. If you prefer Vercel, you can reuse the same content model and validation scripts, then replace the final deploy steps with Vercel's action or native Git integration.

Default production assumptions in the scaffold point at the GitHub repository `delib-org/on-deliberation`.
