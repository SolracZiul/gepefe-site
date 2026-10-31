import type { Session, User } from "@supabase/supabase-js";

export type SignUpOutcome =
  | { status: "signed-in"; userId: string }
  | { status: "needs-confirmation" }
  | { status: "failed"; message: string };

const FALLBACK_ERROR = "Não foi possível criar a conta. Tente novamente.";

/**
 * Turns a supabase.auth.signUp() result into what the UI should do next.
 *
 * With email confirmation disabled the signup response already carries a live
 * session, so the user is signed in and must be sent straight into the app.
 * The "needs-confirmation" branch only happens while the project still asks
 * every new account to click a link in their inbox.
 */
export function resolveSignUpResult(result: {
  error?: { message?: string } | null;
  data?: { session?: Session | null; user?: User | null } | null;
}): SignUpOutcome {
  if (result.error) {
    return { status: "failed", message: result.error.message || FALLBACK_ERROR };
  }

  const session = result.data?.session ?? null;
  if (session?.user) {
    return { status: "signed-in", userId: session.user.id };
  }

  if (result.data?.user) {
    return { status: "needs-confirmation" };
  }

  return { status: "failed", message: FALLBACK_ERROR };
}
