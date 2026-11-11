"use server";

import { redirect } from "next/navigation";
import { createSession, findUserByEmail, passwordMatches } from "@/lib/auth";
import { normalizeEmail, validateCredentials } from "@/lib/credentials";

export type AuthState = {
  error: string | null;
};

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { error: validationError };
  }

  const user = await findUserByEmail(email);
  const matches = await passwordMatches(
    password,
    user?.passwordHash ??
      "scrypt:00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  );

  if (!user || !matches) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/");
}
