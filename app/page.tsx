import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listOwnedDocuments, listSharedDocuments } from "@/lib/documents";
import { createDocument } from "./create-document";
import { DocumentsView } from "./documents-view";
import { UploadDialog } from "./upload-dialog";
import { UserMenu } from "./user-menu";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [owned, shared] = await Promise.all([
    listOwnedDocuments(user.id),
    listSharedDocuments(user.id),
  ]);

  const ownedForClient = owned.map((doc) => ({
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updatedAt.toISOString(),
  }));

  const sharedForClient = shared.map((doc) => ({
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updatedAt.toISOString(),
    ownerEmail: doc.ownerEmail,
    role: doc.role,
  }));

  return (
    <div className="g-app">
      <header className="g-topbar">
        <div className="g-brand">
          <span className="g-brand-mark" aria-hidden>
            A
          </span>
          <p className="g-brand-name m-0">Ajaia Docs</p>
        </div>
        <div className="g-actions">
          <UploadDialog />
          <form action={createDocument}>
            <button type="submit" className="g-btn g-btn-primary">
              Blank document
            </button>
          </form>
          <UserMenu email={user.email} />
        </div>
      </header>

      <main className="g-main">
        <DocumentsView owned={ownedForClient} shared={sharedForClient} />
      </main>
    </div>
  );
}
