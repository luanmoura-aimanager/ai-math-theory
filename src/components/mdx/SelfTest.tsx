import type { ReactNode } from "react";

export function SelfTest({ children }: { children: ReactNode }) {
  return (
    <div className="mdx-self-test">
      <span className="mdx-self-test__label">Self-test</span>
      {children}
    </div>
  );
}
