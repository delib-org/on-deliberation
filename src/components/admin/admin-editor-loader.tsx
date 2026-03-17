"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/data/book";

type AdminEditorLoaderProps = {
  locale: Locale;
  slug: string;
  title: string;
  publicHref: string;
  chapterPath: string;
};

const AdminMdxEditor = dynamic(() => import("@/src/components/admin/mdx-admin-editor"), {
  ssr: false,
  loading: () => (
    <div className="panel rounded-[2rem] p-8 lg:p-10">
      <p className="text-sm text-ink/64">Loading editor...</p>
    </div>
  )
});

export function AdminEditorLoader(props: AdminEditorLoaderProps) {
  return <AdminMdxEditor {...props} />;
}
