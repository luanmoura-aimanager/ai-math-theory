import Link from "next/link";
import { getChapterTree } from "@/lib/content";

export default function HomePage() {
  const chapters = getChapterTree();
  const firstSession = chapters[0]?.sessions[0];

  return (
    <article className="prose-textbook">
      <h1>Do perceptron aos LLMs</h1>

      <p>
        Curso de fundamentos matemáticos rigorosos para deep learning e modelos
        de linguagem de larga escala. As sessões são curtas, verbosas em
        derivações, e desenhadas para serem acompanhadas com caneta na mão.
      </p>

      <p>
        O leitor-alvo é um pós-graduando STEM (física, EE, matemática aplicada,
        CS) com cálculo multivariável e álgebra linear no banco. Cada sessão
        mostra todo passo algébrico — sem &ldquo;decorre que&rdquo;, sem
        &ldquo;é fácil ver&rdquo;.
      </p>

      <h2>Como começar</h2>
      <p>
        Use a barra lateral à esquerda para navegar pelos capítulos. Marque
        sessões como concluídas e o ✓ aparece no índice.
      </p>

      {firstSession && (
        <p>
          <Link href={`/session/${firstSession.slug}`}>
            Começar pela primeira sessão →
          </Link>
        </p>
      )}

      <hr />

      <p>
        <em>
          Demo MVP. Login Google, persistência cross-device e sandbox de código
          chegam nas próximas fases (ver <code>website_plan.md</code>).
        </em>
      </p>
    </article>
  );
}
