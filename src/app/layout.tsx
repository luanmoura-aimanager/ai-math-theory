import type { Metadata } from "next";
import "./globals.css";

import { getChapterTree } from "@/lib/content";
import { isSignedIn, getStudiedSlugs } from "@/lib/progress";
import { ProgressProvider } from "@/components/ProgressProvider";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "AI / ML Theory — From the Perceptron to LLMs",
  description:
    "A rigorous, math-first walk-through of deep learning, from linear models up to modern large language models.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The chapter tree is read from /content at build/render time on the server.
  // The sidebar is a client component but receives this tree as a prop, so the
  // filesystem read stays server-only.
  const chapters = getChapterTree();

  // Seed the progress provider with the signed-in user's studied slugs so the
  // sidebar checkmarks are correct on first paint. Anonymous visitors get an
  // empty seed and the provider falls back to localStorage. Both calls are
  // no-ops (false / []) when no DB is configured.
  const signedIn = await isSignedIn();
  const completed = signedIn ? await getStudiedSlugs() : [];

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ProgressProvider signedIn={signedIn} initialCompleted={completed}>
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
