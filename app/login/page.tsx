import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="g-auth">
      <div className="g-auth-panel">
        <div className="g-brand">
          <span className="g-brand-mark" aria-hidden>
            A
          </span>
          <span className="g-brand-name">Ajaia Docs</span>
        </div>
        <h1 className="g-auth-title">Sign in</h1>
        <p className="g-auth-sub">to continue to Ajaia Docs</p>
        <LoginForm />
        <p className="g-user mt-5">
          No account?{" "}
          <Link href="/signup" className="g-link">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
