import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { documentShares, documents, users } from "@/db/schema";

export const MAX_TITLE_LENGTH = 200;
export const DEFAULT_TITLE = "Untitled";

export type ShareRole = "view" | "edit";
export type AccessLevel = "owner" | ShareRole;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isDocumentId(value: string): boolean {
  return UUID_RE.test(value);
}

export function isShareRole(value: string): value is ShareRole {
  return value === "view" || value === "edit";
}

export type DocumentListItem = {
  id: string;
  title: string;
  updatedAt: Date;
};

export type SharedDocumentListItem = DocumentListItem & {
  ownerEmail: string;
  role: ShareRole;
};

export type DocumentRecord = {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentAccess = {
  document: DocumentRecord;
  access: AccessLevel;
  canEdit: boolean;
  canManageShares: boolean;
};

export type DocumentShareListItem = {
  id: string;
  userId: string;
  email: string;
  role: ShareRole;
};

export function validateTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) {
    return "Title is required.";
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }
  return null;
}

export async function listOwnedDocuments(ownerId: string): Promise<DocumentListItem[]> {
  const db = getDb();
  return db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(eq(documents.ownerId, ownerId))
    .orderBy(desc(documents.updatedAt));
}

export async function listSharedDocuments(userId: string): Promise<SharedDocumentListItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
      ownerEmail: users.email,
      role: documentShares.role,
    })
    .from(documentShares)
    .innerJoin(documents, eq(documents.id, documentShares.documentId))
    .innerJoin(users, eq(users.id, documents.ownerId))
    .where(eq(documentShares.userId, userId))
    .orderBy(desc(documents.updatedAt));

  return rows
    .filter((row): row is typeof row & { role: ShareRole } => isShareRole(row.role))
    .map((row) => ({
      id: row.id,
      title: row.title,
      updatedAt: row.updatedAt,
      ownerEmail: row.ownerEmail,
      role: row.role,
    }));
}

export async function getDocumentAccess(
  documentId: string,
  userId: string,
): Promise<DocumentAccess | null> {
  if (!isDocumentId(documentId)) {
    return null;
  }

  const db = getDb();
  const rows = await db
    .select({
      id: documents.id,
      ownerId: documents.ownerId,
      title: documents.title,
      content: documents.content,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  const document = rows[0];
  if (!document) {
    return null;
  }

  if (document.ownerId === userId) {
    return {
      document,
      access: "owner",
      canEdit: true,
      canManageShares: true,
    };
  }

  const shareRows = await db
    .select({ role: documentShares.role })
    .from(documentShares)
    .where(and(eq(documentShares.documentId, documentId), eq(documentShares.userId, userId)))
    .limit(1);

  const role = shareRows[0]?.role;
  if (!role || !isShareRole(role)) {
    return null;
  }

  return {
    document,
    access: role,
    canEdit: role === "edit",
    canManageShares: false,
  };
}

export async function createOwnedDocument(
  ownerId: string,
  title: string = DEFAULT_TITLE,
  content: string = "",
): Promise<DocumentRecord> {
  const db = getDb();
  const rows = await db
    .insert(documents)
    .values({
      ownerId,
      title,
      content,
    })
    .returning({
      id: documents.id,
      ownerId: documents.ownerId,
      title: documents.title,
      content: documents.content,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    });

  const document = rows[0];
  if (!document) {
    throw new Error("Could not create document");
  }

  return document;
}

export async function updateEditableDocument(
  documentId: string,
  userId: string,
  title: string,
  content: string,
): Promise<DocumentRecord | null> {
  const access = await getDocumentAccess(documentId, userId);
  if (!access?.canEdit) {
    return null;
  }

  const db = getDb();
  const rows = await db
    .update(documents)
    .set({
      title,
      content,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId))
    .returning({
      id: documents.id,
      ownerId: documents.ownerId,
      title: documents.title,
      content: documents.content,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    });

  return rows[0] ?? null;
}

export async function deleteOwnedDocument(
  documentId: string,
  ownerId: string,
): Promise<boolean> {
  if (!isDocumentId(documentId)) {
    return false;
  }

  const db = getDb();
  const rows = await db
    .delete(documents)
    .where(and(eq(documents.id, documentId), eq(documents.ownerId, ownerId)))
    .returning({ id: documents.id });

  return Boolean(rows[0]);
}

export async function listDocumentShares(
  documentId: string,
  ownerId: string,
): Promise<DocumentShareListItem[] | null> {
  if (!isDocumentId(documentId)) {
    return null;
  }

  const db = getDb();
  const owned = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.ownerId, ownerId)))
    .limit(1);

  if (!owned[0]) {
    return null;
  }

  const rows = await db
    .select({
      id: documentShares.id,
      userId: documentShares.userId,
      email: users.email,
      role: documentShares.role,
    })
    .from(documentShares)
    .innerJoin(users, eq(users.id, documentShares.userId))
    .where(eq(documentShares.documentId, documentId))
    .orderBy(users.email);

  return rows
    .filter((row): row is typeof row & { role: ShareRole } => isShareRole(row.role))
    .map((row) => ({
      id: row.id,
      userId: row.userId,
      email: row.email,
      role: row.role,
    }));
}

export async function upsertDocumentShare(
  documentId: string,
  ownerId: string,
  recipientUserId: string,
  role: ShareRole,
): Promise<"ok" | "not_found" | "self"> {
  if (recipientUserId === ownerId) {
    return "self";
  }

  const db = getDb();
  const owned = await db
    .select({ id: documents.id })
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.ownerId, ownerId)))
    .limit(1);

  if (!owned[0]) {
    return "not_found";
  }

  await db
    .insert(documentShares)
    .values({
      documentId,
      userId: recipientUserId,
      role,
    })
    .onConflictDoUpdate({
      target: [documentShares.documentId, documentShares.userId],
      set: { role },
    });

  return "ok";
}

export async function updateDocumentShareRole(
  shareId: string,
  ownerId: string,
  role: ShareRole,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({
      shareId: documentShares.id,
      documentId: documentShares.documentId,
      ownerId: documents.ownerId,
    })
    .from(documentShares)
    .innerJoin(documents, eq(documents.id, documentShares.documentId))
    .where(eq(documentShares.id, shareId))
    .limit(1);

  const share = rows[0];
  if (!share || share.ownerId !== ownerId) {
    return false;
  }

  await db.update(documentShares).set({ role }).where(eq(documentShares.id, shareId));
  return true;
}

export async function removeDocumentShare(shareId: string, ownerId: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({
      shareId: documentShares.id,
      ownerId: documents.ownerId,
    })
    .from(documentShares)
    .innerJoin(documents, eq(documents.id, documentShares.documentId))
    .where(eq(documentShares.id, shareId))
    .limit(1);

  const share = rows[0];
  if (!share || share.ownerId !== ownerId) {
    return false;
  }

  await db.delete(documentShares).where(eq(documentShares.id, shareId));
  return true;
}
