import Link from "next/link";

export default function DocumentNotFound() {
  return (
    <main className="g-auth">
      <div className="g-auth-panel">
        <div className="g-brand">
          <span className="g-brand-mark" aria-hidden>
            A
          </span>
          <span className="g-brand-name">Ajaia Docs</span>
        </div>
        <h1 className="g-auth-title">Document not found</h1>
        <p className="g-auth-sub">
          This document does not exist, or you do not have access.
        </p>
        <Link href="/" className="g-btn g-btn-primary mt-6 inline-flex no-underline">
          Back to Docs home
        </Link>
      </div>
    </main>
  );
}
