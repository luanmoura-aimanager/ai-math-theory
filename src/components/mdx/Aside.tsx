import type { ReactNode } from "react";

type AsideType = "note" | "warning" | "history";

const labels: Record<AsideType, string> = {
  note: "Nota",
  warning: "Atenção",
  history: "Contexto histórico",
};

export function Aside({
  type,
  children,
}: {
  type: AsideType;
  children: ReactNode;
}) {
  return (
    <aside className={`mdx-aside mdx-aside--${type}`}>
      <span className="mdx-aside__label">{labels[type]}</span>
      {children}
    </aside>
  );
}
