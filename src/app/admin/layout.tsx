import type { Metadata } from "next";
import "@mdxeditor/editor/style.css";

export const metadata: Metadata = {
  title: "Admin Editor",
  description: "Administrative editing interface for the On Deliberation manuscript.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
