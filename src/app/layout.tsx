import type { Metadata } from "next";
import "./globals.css";

import { getChapterTree } from "@/lib/content";
import { ProgressProvider } from "@/components/ProgressProvider";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "AI / ML Theory — From the Perceptron to LLMs",
  description:
    "A rigorous, math-first walk-through of deep learning, from linear models up to modern large language models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The chapter tree is read from /content at build/render time on the server.
  // The sidebar is a client component but receives this tree as a prop, so the
  // filesystem read stays server-only.
  const chapters = getChapterTree();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ProgressProvider>
          <Header />
          <div className="flex flex-1 min-h-0">
            <Sidebar chapters={chapters} />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-8 py-12">{children}</div>
            </main>
          </div>
        </ProgressProvider>
      </body>
    </html>
  );
}
