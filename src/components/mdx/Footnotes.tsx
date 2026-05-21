import type { ReactNode } from "react";

/**
 * Paper-style references for a session.
 *
 * Matches the CS-paper convention (IEEE / ACM): inline marker is a
 * bracketed number rendered at body size — e.g. "scaled dot-product
 * attention [3]" — and the bottom block is a 'References' section with
 * a thin rule above it and bracketed entries like "[3] Vaswani et al…".
 *
 * Usage:
 *   ... scaled dot-product attention<FN n={1} />.
 *
 *   <Footnotes>
 *     <FNItem n={1}>Vaswani, A., …</FNItem>
 *     <FNItem n={2}>…</FNItem>
 *   </Footnotes>
 */

export function FN({ n, ns }: { n?: number; ns?: number[] }) {
  // Single ref: <FN n={3} />. Multiple stacked refs: <FN ns={[1,2,4]} />.
  // Single form renders as "[3]" with the whole "[3]" clickable; multi
  // form renders as "[1, 2, 4]" with each number linked individually —
  // the convention used by CS papers when grouping citations.
  const list = ns ?? (n !== undefined ? [n] : []);
  if (list.length === 0) return null;
  if (list.length === 1) {
    const k = list[0];
    return (
      <span className="mdx-fn-ref">
        <a href={`#fn-${k}`} id={`fn-ref-${k}`} aria-label={`Reference ${k}`}>
          [{k}]
        </a>
      </span>
    );
  }
  return (
    <span className="mdx-fn-ref mdx-fn-ref--multi">
      [
      {list.map((k, i) => (
        <span key={k}>
          {i > 0 && ", "}
          <a href={`#fn-${k}`} id={`fn-ref-${k}`} aria-label={`Reference ${k}`}>
            {k}
          </a>
        </span>
      ))}
      ]
    </span>
  );
}

export function FNItem({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li id={`fn-${n}`} className="mdx-fn-item">
      <span className="mdx-fn-item__num">[{n}]</span>
      <span className="mdx-fn-item__body">{children}</span>
      <a href={`#fn-ref-${n}`} className="mdx-fn-backref" aria-label={`Back to citation ${n}`}>
        ↩
      </a>
    </li>
  );
}

export function Footnotes({ children }: { children: ReactNode }) {
  return (
    <section className="mdx-footnotes" aria-label="References">
      <hr className="mdx-footnotes__rule" />
      <h2 className="mdx-footnotes__heading">References</h2>
      <ol className="mdx-footnotes__list">{children}</ol>
    </section>
  );
}
