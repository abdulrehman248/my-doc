"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  createDocumentComment,
  deleteDocumentComment,
  resolveDocumentComment,
  type DocumentComment,
} from "@/lib/comments";

export type CommentActionResult =
  | { ok: true; comment?: DocumentComment }
  | { ok: false; error: string };

function revalidateDocument(documentId: string) {
  revalidatePath(`/documents/${documentId}`);
}

export async function createComment(
  documentId: string,
  body: string,
  quote: string,
): Promise<CommentActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const result = await createDocumentComment(documentId, user.id, body, quote);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidateDocument(documentId);
  return { ok: true, comment: result.comment };
}

export async function resolveComment(
  documentId: string,
  commentId: string,
): Promise<CommentActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const ok = await resolveDocumentComment(commentId, user.id);
  if (!ok) {
    return { ok: false, error: "You cannot resolve this comment." };
  }

  revalidateDocument(documentId);
  return { ok: true };
}

export async function deleteComment(
  documentId: string,
  commentId: string,
): Promise<CommentActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const ok = await deleteDocumentComment(commentId, user.id);
  if (!ok) {
    return { ok: false, error: "You cannot delete this comment." };
  }

  revalidateDocument(documentId);
  return { ok: true };
}
