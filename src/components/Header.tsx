import Link from "next/link";

export function Header() {
  return (
    <header className="h-14 shrink-0 border-b border-[var(--rule)] bg-[var(--background-elev)]/80 backdrop-blur-sm">
      {/* pl-14 on mobile leaves room for the fixed hamburger button rendered
          by Sidebar; desktop keeps the original px-5 layout. */}
      <div className="h-full pl-14 pr-5 md:px-5 flex items-center">
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
