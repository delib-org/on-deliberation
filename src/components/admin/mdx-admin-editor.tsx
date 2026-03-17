"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  codeBlockPlugin,
  codeMirrorPlugin,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  frontmatterPlugin,
  GenericJsxEditor,
  headingsPlugin,
  jsxPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type JsxComponentDescriptor,
  quotePlugin,
  Separator,
  tablePlugin,
  InsertCodeBlock,
  InsertTable,
  InsertThematicBreak,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo
} from "@mdxeditor/editor";
import type { Locale } from "@/data/book";
import { siteConfig } from "@/data/site";

type AdminMdxEditorProps = {
  locale: Locale;
  slug: string;
  title: string;
  publicHref: string;
  chapterPath: string;
};

type GitHubContentsResponse = {
  sha: string;
  content: string;
};

const SESSION_KEY = "on-deliberation-admin-token";

const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: "Citation",
    kind: "text",
    props: [{ name: "id", type: "string", required: true }],
    hasChildren: false,
    Editor: GenericJsxEditor
  },
  {
    name: "ReferencesList",
    kind: "flow",
    props: [],
    hasChildren: false,
    Editor: GenericJsxEditor
  },
  {
    name: "ConsensusCalculator",
    kind: "flow",
    props: [],
    hasChildren: false,
    Editor: GenericJsxEditor
  },
  {
    name: "SonGraph",
    kind: "flow",
    props: [],
    hasChildren: false,
    Editor: GenericJsxEditor
  }
];

function decodeUtf8Base64(value: string) {
  const sanitized = value.replace(/\n/g, "");
  const binary = window.atob(sanitized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeUtf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
}

function buildContentsUrl(path: string) {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://api.github.com/repos/${siteConfig.github.owner}/${siteConfig.github.repo}/contents/${encodedPath}`;
}

function editorPlugins(originalMarkdown: string) {
  return [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    thematicBreakPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    tablePlugin(),
    frontmatterPlugin(),
    markdownShortcutPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: "md" }),
    codeMirrorPlugin({
      codeBlockLanguages: {
        md: "Markdown",
        txt: "Plain text",
        ts: "TypeScript",
        tsx: "TSX",
        js: "JavaScript",
        jsx: "JSX",
        json: "JSON",
        bash: "Shell"
      }
    }),
    jsxPlugin({ jsxComponentDescriptors }),
    diffSourcePlugin({
      viewMode: "rich-text",
      diffMarkdown: originalMarkdown
    }),
    toolbarPlugin({
      toolbarContents: () => (
        <DiffSourceToggleWrapper>
          <UndoRedo />
          <Separator />
          <BlockTypeSelect />
          <BoldItalicUnderlineToggles />
          <CodeToggle />
          <Separator />
          <ListsToggle />
          <CreateLink />
          <InsertTable />
          <InsertThematicBreak />
          <InsertCodeBlock />
        </DiffSourceToggleWrapper>
      )
    })
  ];
}

export default function AdminMdxEditor({
  locale,
  slug,
  title,
  publicHref,
  chapterPath
}: AdminMdxEditorProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [commitMessage, setCommitMessage] = useState(`Edit ${title}`);
  const [markdown, setMarkdown] = useState("");
  const [loadedMarkdown, setLoadedMarkdown] = useState("");
  const [sha, setSha] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [status, setStatus] = useState("Enter a GitHub write token to unlock editing.");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastCommitUrl, setLastCommitUrl] = useState("");
  const fileUrl = useMemo(() => buildContentsUrl(chapterPath), [chapterPath]);
  const dirty = markdown !== loadedMarkdown;

  const loadDocument = useCallback(async (activeToken: string) => {
    setIsLoading(true);
    setError("");
    setStatus("Loading chapter from GitHub...");

    try {
      const response = await fetch(`${fileUrl}?ref=${siteConfig.github.defaultBranch}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: `Bearer ${activeToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub returned ${response.status} ${response.statusText}.`);
      }

      const payload = (await response.json()) as GitHubContentsResponse;
      const nextMarkdown = decodeUtf8Base64(payload.content);

      setMarkdown(nextMarkdown);
      setLoadedMarkdown(nextMarkdown);
      setSha(payload.sha);
      setEditorKey((current) => current + 1);
      setStatus("Editor unlocked. You can now update the chapter and save directly to GitHub.");
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unable to load the chapter from GitHub.";
      setError(message);
      setStatus("Admin access failed.");
    } finally {
      setIsLoading(false);
    }
  }, [fileUrl]);

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem(SESSION_KEY) ?? "";

    if (!storedToken) {
      return;
    }

    setToken(storedToken);
    setTokenInput(storedToken);
  }, []);

  useEffect(() => {
    if (token) {
      void loadDocument(token);
    }
  }, [loadDocument, token]);

  function unlockEditor() {
    const normalizedToken = tokenInput.trim();

    if (!normalizedToken) {
      setError("Enter a GitHub token with repository contents write access.");
      return;
    }

    window.sessionStorage.setItem(SESSION_KEY, normalizedToken);
    setToken(normalizedToken);
  }

  function clearAdminSession() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setToken("");
    setTokenInput("");
    setMarkdown("");
    setLoadedMarkdown("");
    setSha("");
    setEditorKey((current) => current + 1);
    setStatus("Enter a GitHub write token to unlock editing.");
    setError("");
    setLastCommitUrl("");
  }

  async function saveDocument() {
    const activeToken = token.trim();

    if (!activeToken) {
      setError("Unlock the editor before saving.");
      return;
    }

    const nextMarkdown = editorRef.current?.getMarkdown() ?? markdown;

    setIsSaving(true);
    setError("");
    setStatus("Saving chapter to GitHub...");

    try {
      const response = await fetch(fileUrl, {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: `Bearer ${activeToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: commitMessage.trim() || `Edit ${title}`,
          content: encodeUtf8Base64(nextMarkdown),
          sha,
          branch: siteConfig.github.defaultBranch
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub returned ${response.status} ${response.statusText}.`);
      }

      const payload = await response.json();
      const nextSha = String(payload.content?.sha ?? "");

      setMarkdown(nextMarkdown);
      setLoadedMarkdown(nextMarkdown);
      setSha(nextSha);
      setLastCommitUrl(String(payload.commit?.html_url ?? ""));
      setStatus("Saved. GitHub Pages will redeploy from the new commit.");
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Unable to save the chapter to GitHub.";
      setError(message);
      setStatus("Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink/48">Admin Access</p>
            <h2 className="mt-2 text-2xl tracking-tight text-ink">Unlock editor</h2>
          </div>
          <span className="rounded-full border border-line px-3 py-2 text-xs uppercase tracking-[0.22em] text-ink/58">
            {locale}/{slug}
          </span>
        </div>

        <label className="mt-6 block text-sm font-medium text-ink/76" htmlFor="github-token">
          GitHub fine-grained token
        </label>
        <input
          id="github-token"
          type="password"
          value={tokenInput}
          onChange={(event) => setTokenInput(event.target.value)}
          placeholder="github_pat_..."
          className="mt-2 w-full rounded-[1rem] border border-line bg-white/75 px-4 py-3 text-base text-ink outline-none transition focus:border-accent"
        />
        <p className="mt-3 text-sm leading-7 text-ink/64">
          Required scope: repository contents write access on{" "}
          <code>
            {siteConfig.github.owner}/{siteConfig.github.repo}
          </code>
          .
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void unlockEditor()}
            disabled={isLoading}
            className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isLoading ? "Unlocking..." : "Unlock editor"}
          </button>
          <button
            type="button"
            onClick={clearAdminSession}
            className="rounded-full border border-line px-5 py-3 text-sm text-ink/75 transition hover:border-accent hover:text-accent"
          >
            Clear admin session
          </button>
          <Link
            href={publicHref}
            className="rounded-full border border-line px-5 py-3 text-sm text-ink/75 transition hover:border-accent hover:text-accent"
          >
            Open public page
          </Link>
        </div>

        <p className="mt-4 text-sm leading-7 text-ink/62">{status}</p>
        {error ? <p className="mt-2 text-sm leading-7 text-red-700">{error}</p> : null}
        {lastCommitUrl ? (
          <p className="mt-2 text-sm leading-7 text-ink/62">
            Latest save commit:{" "}
            <a
              href={lastCommitUrl}
              className="text-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              open on GitHub
            </a>
          </p>
        ) : null}
      </section>

      {token ? (
        <>
          <section className="panel rounded-[2rem] p-6 lg:p-8">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <label className="block">
                <span className="text-sm font-medium text-ink/76">Commit message</span>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(event) => setCommitMessage(event.target.value)}
                  className="mt-2 w-full rounded-[1rem] border border-line bg-white/75 px-4 py-3 text-base text-ink outline-none transition focus:border-accent"
                />
              </label>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <button
                  type="button"
                  onClick={() => void loadDocument(token)}
                  disabled={isLoading || isSaving}
                  className="rounded-full border border-line px-5 py-3 text-sm text-ink/75 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isLoading ? "Reloading..." : "Reload from main"}
                </button>
                <button
                  type="button"
                  onClick={() => void saveDocument()}
                  disabled={isLoading || isSaving || !sha}
                  className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isSaving ? "Saving..." : dirty ? "Save changes" : "Save anyway"}
                </button>
              </div>
            </div>
          </section>

          {markdown ? (
            <section className="panel rounded-[2rem] p-4 lg:p-5">
              <div className="admin-editor-shell">
                <MDXEditor
                  key={editorKey}
                  ref={editorRef}
                  markdown={markdown}
                  onChange={(nextMarkdown) => {
                    setMarkdown(nextMarkdown);
                    setLastCommitUrl("");
                  }}
                  className="mdxeditor admin-mdxeditor"
                  contentEditableClassName="book-prose admin-prose"
                  plugins={editorPlugins(loadedMarkdown)}
                />
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
