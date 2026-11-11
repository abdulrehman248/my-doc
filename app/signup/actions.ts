"use server";

import { redirect } from "next/navigation";
import { createSession, createUser, findUserByEmail } from "@/lib/auth";
import { normalizeEmail, validateCredentials } from "@/lib/credentials";
import type { AuthState } from "@/app/login/actions";

export async function signup(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { error: validationError };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  try {
    const user = await createUser(email, password);
    await createSession(user.id);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "An account with that email already exists." };
    }

    return { error: "Could not create the account. Try again." };
  }

  redirect("/");
}

function isUniqueViolation(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("duplicate key") || message.includes("unique constraint");
}
