import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "./form";

export default async function SignupPage() {
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
        <h1 className="g-auth-title">Create your account</h1>
        <p className="g-auth-sub">to use Ajaia Docs</p>
        <SignupForm />
        <p className="g-user mt-5">
          Already have an account?{" "}
          <Link href="/login" className="g-link">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
