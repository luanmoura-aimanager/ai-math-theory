import Link from "next/link";
import type { Session } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { dbEnabled } from "@/lib/db";

// Server component: reads the session directly. The auth control only appears
// when a database is configured (dbEnabled); otherwise the site is anonymous-
// only and there is nothing to sign in to.
export async function Header() {
  const session = dbEnabled() ? await auth() : null;

  return (
    <header className="h-14 shrink-0 border-b border-[var(--rule)] bg-[var(--background-elev)]/80 backdrop-blur-sm">
      {/* pl-14 on mobile leaves room for the fixed hamburger button rendered
          by Sidebar; desktop keeps the original px-5 layout. */}
      <div className="h-full pl-14 pr-5 md:px-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-[14px] font-medium text-[var(--foreground)] tracking-tight"
        >
          AI / ML Theory
        </Link>
        {dbEnabled() && <AuthControl session={session} />}
      </div>
    </header>
  );
}

function AuthControl({ session }: { session: Session | null }) {
  if (session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit" className={btnClass}>
          Sign out ({session.user.name?.split(" ")[0] ?? "account"})
        </button>
      </form>
    );
  }
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <button type="submit" className={btnClass}>
        Sign in with Google
      </button>
    </form>
  );
}

const btnClass =
  "inline-flex items-center gap-2 rounded-md border border-[var(--rule)] bg-[var(--background-elev)] px-3 py-1.5 text-[13px] font-medium text-[var(--foreground)] hover:bg-[var(--background)] transition-colors";
