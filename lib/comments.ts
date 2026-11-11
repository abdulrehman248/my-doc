import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { documentComments, documents, users } from "@/db/schema";
import { getDocumentAccess, isDocumentId } from "@/lib/documents";

export const MAX_COMMENT_BODY_LENGTH = 2000;
export const MAX_COMMENT_QUOTE_LENGTH = 500;

export type DocumentComment = {
  id: string;
  documentId: string;
  authorId: string;
  authorEmail: string;
  body: string;
  quote: string;
  resolvedAt: Date | null;
  createdAt: Date;
};

export function validateCommentBody(body: string): string | null {
  const trimmed = body.trim();
  if (!trimmed) {
    return "Enter a comment.";
  }
  if (trimmed.length > MAX_COMMENT_BODY_LENGTH) {
    return `Comment must be ${MAX_COMMENT_BODY_LENGTH} characters or fewer.`;
  }
  return null;
}

export function validateCommentQuote(quote: string): string | null {
  const trimmed = quote.trim();
  if (!trimmed) {
    return "Select text to comment on.";
  }
  if (trimmed.length > MAX_COMMENT_QUOTE_LENGTH) {
    return `Selected text must be ${MAX_COMMENT_QUOTE_LENGTH} characters or fewer.`;
  }
  return null;
}

export async function listDocumentComments(
  documentId: string,
  userId: string,
): Promise<DocumentComment[] | null> {
  const access = await getDocumentAccess(documentId, userId);
  if (!access) {
    return null;
  }

  const db = getDb();
  return db
    .select({
      id: documentComments.id,
      documentId: documentComments.documentId,
      authorId: documentComments.authorId,
      authorEmail: users.email,
      body: documentComments.body,
      quote: documentComments.quote,
      resolvedAt: documentComments.resolvedAt,
      createdAt: documentComments.createdAt,
    })
    .from(documentComments)
    .innerJoin(users, eq(users.id, documentComments.authorId))
    .where(eq(documentComments.documentId, documentId))
    .orderBy(asc(documentComments.createdAt));
}

export async function createDocumentComment(
  documentId: string,
  authorId: string,
  body: string,
  quote: string,
): Promise<{ ok: true; comment: DocumentComment } | { ok: false; error: string }> {
  const bodyError = validateCommentBody(body);
  if (bodyError) {
    return { ok: false, error: bodyError };
  }
  const quoteError = validateCommentQuote(quote);
  if (quoteError) {
    return { ok: false, error: quoteError };
  }

  const access = await getDocumentAccess(documentId, authorId);
  if (!access) {
    return { ok: false, error: "You do not have access to this document." };
  }

  const db = getDb();
  const rows = await db
    .insert(documentComments)
    .values({
      documentId,
      authorId,
      body: body.trim(),
      quote: quote.trim(),
    })
    .returning({
      id: documentComments.id,
      documentId: documentComments.documentId,
      authorId: documentComments.authorId,
      body: documentComments.body,
      quote: documentComments.quote,
      resolvedAt: documentComments.resolvedAt,
      createdAt: documentComments.createdAt,
    });

  const created = rows[0];
  if (!created) {
    return { ok: false, error: "Could not create comment." };
  }

  const authorRows = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, authorId))
    .limit(1);

  const authorEmail = authorRows[0]?.email;
  if (!authorEmail) {
    return { ok: false, error: "Could not create comment." };
  }

  return {
    ok: true,
    comment: {
      ...created,
      authorEmail,
    },
  };
}

export async function resolveDocumentComment(
  commentId: string,
  userId: string,
): Promise<boolean> {
  if (!isDocumentId(commentId)) {
    return false;
  }

  const db = getDb();
  const rows = await db
    .select({
      commentId: documentComments.id,
      documentId: documentComments.documentId,
      authorId: documentComments.authorId,
      resolvedAt: documentComments.resolvedAt,
    })
    .from(documentComments)
    .innerJoin(documents, eq(documents.id, documentComments.documentId))
    .where(eq(documentComments.id, commentId))
    .limit(1);

  const row = rows[0];
  if (!row || row.resolvedAt) {
    return false;
  }

  const access = await getDocumentAccess(row.documentId, userId);
  if (!access) {
    return false;
  }
  if (row.authorId !== userId && access.access !== "owner") {
    return false;
  }

  await db
    .update(documentComments)
    .set({ resolvedAt: new Date() })
    .where(and(eq(documentComments.id, commentId), isNull(documentComments.resolvedAt)));

  return true;
}

export async function deleteDocumentComment(
  commentId: string,
  userId: string,
): Promise<boolean> {
  if (!isDocumentId(commentId)) {
    return false;
  }

  const db = getDb();
  const rows = await db
    .select({
      commentId: documentComments.id,
      documentId: documentComments.documentId,
      authorId: documentComments.authorId,
    })
    .from(documentComments)
    .innerJoin(documents, eq(documents.id, documentComments.documentId))
    .where(eq(documentComments.id, commentId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return false;
  }

  const access = await getDocumentAccess(row.documentId, userId);
  if (!access) {
    return false;
  }
  if (row.authorId !== userId && access.access !== "owner") {
    return false;
  }

  await db.delete(documentComments).where(eq(documentComments.id, commentId));
  return true;
}
