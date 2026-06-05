import { handlers } from "@/auth";

// Auth.js route handlers (sign-in, callback, sign-out). The Google redirect URI
// must point at /api/auth/callback/google — see .env.example.
export const { GET, POST } = handlers;
