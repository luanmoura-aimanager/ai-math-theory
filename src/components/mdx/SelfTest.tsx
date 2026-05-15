import type { ReactNode } from "react";

export function SelfTest({ children }: { children: ReactNode }) {
  return (
    <div className="mdx-self-test">
      <span className="mdx-self-test__label">Auto-teste</span>
      {children}
    </div>
  );
}
