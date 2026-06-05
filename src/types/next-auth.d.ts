import type { DefaultSession } from "next-auth";

// Augment the session user with the database id set in the auth.ts callback.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
