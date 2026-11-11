"use client";

import { useActionState } from "react";
import type { AuthState } from "@/app/login/actions";
import { signup } from "./actions";

const initialState: AuthState = { error: null };

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, initialState);

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      {state.error ? (
        <p role="alert" className="g-alert">
          {state.error}
        </p>
      ) : null}
      <label className="g-field" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="g-input"
        />
      </label>
      <label className="g-field" htmlFor="password">
        Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="g-input"
        />
      </label>
      <button type="submit" disabled={pending} className="g-btn g-btn-primary self-start">
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
