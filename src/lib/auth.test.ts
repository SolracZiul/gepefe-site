import { describe, expect, test } from "bun:test";
import { resolveSignUpResult } from "./auth";

describe("resolveSignUpResult", () => {
  test("a session in the response means the account is already signed in", () => {
    const outcome = resolveSignUpResult({
      data: { session: { user: { id: "user-1" } } as never, user: { id: "user-1" } as never },
    });

    expect(outcome).toEqual({ status: "signed-in", userId: "user-1" });
  });

  test("a user without a session still needs email confirmation", () => {
    const outcome = resolveSignUpResult({
      data: { session: null, user: { id: "user-2" } as never },
    });

    expect(outcome).toEqual({ status: "needs-confirmation" });
  });

  test("a rejected signup reports the server message", () => {
    const outcome = resolveSignUpResult({
      error: { message: "Email already registered" },
      data: { session: null, user: null },
    });

    expect(outcome).toEqual({ status: "failed", message: "Email already registered" });
  });

  test("an empty response is a failure, not a successful signup", () => {
    const outcome = resolveSignUpResult({ data: { session: null, user: null } });

    expect(outcome.status).toBe("failed");
    expect(outcome.status === "failed" && outcome.message).toBe(
      "Não foi possível criar a conta. Tente novamente.",
    );
  });
});
