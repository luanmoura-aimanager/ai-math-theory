import Link from "next/link";
import { getChapterTree } from "@/lib/content";

export default function HomePage() {
  const chapters = getChapterTree();
  const firstSession = chapters[0]?.sessions[0];

  return (
    <article className="prose-textbook">
      <h1>From the Perceptron to LLMs</h1>

      <p>
        A rigorous, math-first course on deep learning, from linear models up
        to modern large language models. Sessions are short, dense in
        derivations, and meant to be followed with a pen in hand.
      </p>

      <p>
        The intended reader is a STEM graduate (physics, EE, applied math, CS)
        with multivariable calculus and linear algebra in the bank. Every
        algebraic step is shown — no &ldquo;it follows that&rdquo;, no
        &ldquo;it is easy to see&rdquo;.
      </p>

      <h2>How to start</h2>
      <p>
        Use the sidebar on the left to navigate the chapters. Mark sessions
        as complete and a ✓ appears in the index.
      </p>

      {firstSession && (
        <p>
          <Link href={`/session/${firstSession.slug}`}>
            Start with the first session →
          </Link>
        </p>
      )}

      <hr />

      <p>
        <em>
          MVP demo. Progress is stored in your browser&apos;s
          <code>localStorage</code> — clearing site data resets the
          checkmarks. Cross-device sync via Google login is planned for a
          later phase (see <code>website_plan.md</code>).
        </em>
      </p>
    </article>
  );
}
