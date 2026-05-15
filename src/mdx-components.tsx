// Required by @next/mdx — maps JSX tags used inside .mdx files to React components.
import type { MDXComponents } from "mdx/types";
import { Aside } from "@/components/mdx/Aside";
import { SelfTest } from "@/components/mdx/SelfTest";
import { Figure } from "@/components/mdx/Figure";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Aside,
    SelfTest,
    Figure,
  };
}
