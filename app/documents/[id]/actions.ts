"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, findUserByEmail } from "@/lib/auth";
import { normalizeEmail } from "@/lib/credentials";
import { isEditorContentJson } from "@/lib/editor-content";
import {
  isShareRole,
  removeDocumentShare,
  updateDocumentShareRole,
  updateEditableDocument,
  upsertDocumentShare,
  validateTitle,
  type ShareRole,
} from "@/lib/documents";

export type AutosaveResult =
  | { ok: true }
  | { ok: false; error: string };

export type ShareFormState = {
  error: string | null;
  done: boolean;
};

function revalidateDocument(documentId: string) {
  revalidatePath("/");
  revalidatePath(`/documents/${documentId}`);
}

export async function autosaveDocument(
  documentId: string,
  title: string,
  content: string,
): Promise<AutosaveResult> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const titleError = validateTitle(title);
  if (titleError) {
    return { ok: false, error: titleError };
  }

  if (!isEditorContentJson(content)) {
    return { ok: false, error: "Could not save document content." };
  }

  const updated = await updateEditableDocument(documentId, user.id, title.trim(), content);
  if (!updated) {
    return { ok: false, error: "You do not have permission to edit this document." };
  }

  revalidateDocument(documentId);
  return { ok: true };
}

export async function shareDocument(
  documentId: string,
  _state: ShareFormState,
  formData: FormData,
): Promise<ShareFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const email = normalizeEmail(formData.get("email"));
  const roleValue = String(formData.get("role") ?? "");
  if (!email) {
    return { error: "Enter an email address.", done: false };
  }
  if (!isShareRole(roleValue)) {
    return { error: "Choose Viewer or Editor.", done: false };
  }

  const recipient = await findUserByEmail(email);
  if (!recipient) {
    return { error: "No account exists with that email.", done: false };
  }

  const result = await upsertDocumentShare(documentId, user.id, recipient.id, roleValue);
  if (result === "self") {
    return { error: "You already own this document.", done: false };
  }
  if (result === "not_found") {
    return { error: "Document not found.", done: false };
  }

  revalidateDocument(documentId);
  return { error: null, done: true };
}

export async function changeShareRole(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const shareId = String(formData.get("shareId") ?? "");
  const documentId = String(formData.get("documentId") ?? "");
  const roleValue = String(formData.get("role") ?? "");
  if (!shareId || !documentId || !isShareRole(roleValue)) {
    return;
  }

  const ok = await updateDocumentShareRole(shareId, user.id, roleValue as ShareRole);
  if (!ok) {
    return;
  }

  revalidateDocument(documentId);
}

export async function revokeShare(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const shareId = String(formData.get("shareId") ?? "");
  const documentId = String(formData.get("documentId") ?? "");
  if (!shareId || !documentId) {
    return;
  }

  const ok = await removeDocumentShare(shareId, user.id);
  if (!ok) {
    return;
  }

  revalidateDocument(documentId);
}
