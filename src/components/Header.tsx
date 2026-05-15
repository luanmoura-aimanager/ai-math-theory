import Link from "next/link";

export function Header() {
  return (
    <header className="h-14 shrink-0 border-b border-[var(--rule)] bg-[var(--background-elev)]/80 backdrop-blur-sm">
      <div className="h-full px-5 flex items-center">
        <Link
          href="/"
          className="text-[14px] font-medium text-[var(--foreground)] tracking-tight"
        >
          AI / ML Theory
        </Link>
      </div>
    </header>
  );
}
