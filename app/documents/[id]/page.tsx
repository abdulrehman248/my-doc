import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listDocumentComments } from "@/lib/comments";
import { getDocumentAccess, listDocumentShares } from "@/lib/documents";
import { UserMenu } from "@/app/user-menu";
import { DocumentForm } from "./form";
import { ShareDialog } from "./share-dialog";

type DocumentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentPage({ params }: DocumentPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const access = await getDocumentAccess(id, user.id);
  if (!access) {
    notFound();
  }

  const shares = access.canManageShares
    ? ((await listDocumentShares(id, user.id)) ?? [])
    : [];
  const comments = (await listDocumentComments(id, user.id)) ?? [];

  return (
    <div className="g-app g-editor-page">
      <header className="g-topbar">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="g-brand">
            <span className="g-brand-mark" aria-hidden>
              A
            </span>
            <span className="g-brand-name">Docs</span>
          </Link>
          {access.access !== "owner" ? (
            <p className="g-user m-0">
              {access.access === "edit" ? "Can edit" : "Can view"}
            </p>
          ) : null}
        </div>
        <div className="g-actions">
          <UserMenu email={user.email} />
        </div>
      </header>

      <DocumentForm
        documentId={access.document.id}
        title={access.document.title}
        content={access.document.content}
        readOnly={!access.canEdit}
        currentUserId={user.id}
        currentUserEmail={user.email}
        isOwner={access.access === "owner"}
        initialComments={comments}
        shareSlot={
          access.canManageShares ? (
            <ShareDialog
              documentId={access.document.id}
              documentTitle={access.document.title}
              shares={shares}
            />
          ) : null
        }
      />
    </div>
  );
}
