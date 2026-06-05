import Link from "next/link";
import { getChapterTree } from "@/lib/content";

export default function HomePage() {
  const chapters = getChapterTree();
  const firstSession = chapters[0]?.sessions[0];

  return (
    <article className="prose-textbook">
      <h1>From the Perceptron to LLMs</h1>

      <p>
        A rigorous, math-first course on deep learning, from linear models up to
        modern large language models. Sessions are short, dense in derivations,
        and meant to be followed with a pen in hand.
      </p>

      <p>
        The intended reader is a STEM graduate (physics, EE, applied math, CS)
        with multivariable calculus and linear algebra in the bank. Every
        algebraic step is shown — no &ldquo;it follows that&rdquo;, no &ldquo;it
        is easy to see&rdquo;.
      </p>

      <h2>How to start</h2>
      <p>
        Use the sidebar on the left to navigate the chapters. Mark sessions as
        complete and a ✓ appears in the index.
      </p>

      {firstSession && (
        <p>
          <Link href={`/session/${firstSession.slug}`}>
            Start with the first session →
          </Link>
        </p>
      )}

      <hr />

      <h2>About</h2>
      <p>
        Hi, I&apos;m Luan — a data scientist with an MSc in physics. I built
        this website with Claude Opus 4.6. During my master&apos;s I studied the
        mathematical theory of neural networks and image recognition with CNNs
        (see my{" "}
        <a
          href="https://repositorio.ufc.br/bitstream/riufc/40344/1/2019_dis_lmgmoura.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          dissertation
        </a>
        ). Years later, wanting to understand deeply how LLMs work, I decided to
        write this course on top of that foundation.
      </p>
      <p>
        If you&apos;d like to contribute or have any feedback, reach me on{" "}
        <a
          href="https://www.linkedin.com/in/luan-misael-moura-54a87798/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>{" "}
        or by email at{" "}
        <a href="mailto:luanmisaelmoura@gmail.com">luanmisaelmoura@gmail.com</a>
        .
      </p>

      <hr />

      <p>
        <em>
          Sign in with Google (button in the top-right) to save your progress
          and pick up where you left off on any device. Without signing in, your
          checkmarks are kept only in this browser.
        </em>
      </p>
    </article>
  );
}
