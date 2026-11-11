import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { getDb } from "../db/index.ts";
import { documentShares, documents, users } from "../db/schema.ts";
import {
  createOwnedDocument,
  deleteOwnedDocument,
  getDocumentAccess,
  updateEditableDocument,
  upsertDocumentShare,
} from "../lib/documents.ts";

config({ path: ".env.local" });

const OWNER_EMAIL = "ada@ajaia.test";
const VIEWER_EMAIL = "grace@ajaia.test";
const EDITOR_EMAIL = "lin@ajaia.test";

type UserRow = { id: string; email: string };

let owner: UserRow;
let viewer: UserRow;
let editor: UserRow;
let stranger: UserRow;
let documentId: string;

async function requireUser(email: string): Promise<UserRow> {
  const db = getDb();
  const rows = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0];
  if (!user) {
    throw new Error(`Missing seeded user ${email}. Run npm run db:seed.`);
  }
  return user;
}

before(async () => {
  owner = await requireUser(OWNER_EMAIL);
  viewer = await requireUser(VIEWER_EMAIL);
  editor = await requireUser(EDITOR_EMAIL);

  const db = getDb();
  const strangerRows = await db
    .insert(users)
    .values({
      email: `stranger-share-test-${Date.now()}@ajaia.test`,
      passwordHash: "unused-for-permission-test",
    })
    .returning({ id: users.id, email: users.email });
  const created = strangerRows[0];
  if (!created) {
    throw new Error("Could not create stranger user for permission test.");
  }
  stranger = created;

  const document = await createOwnedDocument(
    owner.id,
    "Share permission test",
    JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "body" }] }],
    }),
  );
  documentId = document.id;

  const viewShare = await upsertDocumentShare(documentId, owner.id, viewer.id, "view");
  const editShare = await upsertDocumentShare(documentId, owner.id, editor.id, "edit");
  assert.equal(viewShare, "ok");
  assert.equal(editShare, "ok");
});

after(async () => {
  if (documentId) {
    await deleteOwnedDocument(documentId, owner.id);
  }
  if (stranger?.id) {
    const db = getDb();
    await db.delete(users).where(eq(users.id, stranger.id));
  }
});

test("unrelated user cannot open a private document", async () => {
  const access = await getDocumentAccess(documentId, stranger.id);
  assert.equal(access, null);
});

test("Can view user cannot update the document", async () => {
  const access = await getDocumentAccess(documentId, viewer.id);
  assert.ok(access);
  assert.equal(access.access, "view");
  assert.equal(access.canEdit, false);

  const updated = await updateEditableDocument(
    documentId,
    viewer.id,
    "Hacked by viewer",
    JSON.stringify({ type: "doc", content: [] }),
  );
  assert.equal(updated, null);

  const still = await getDocumentAccess(documentId, owner.id);
  assert.equal(still?.document.title, "Share permission test");
});

test("Can edit user can update the document", async () => {
  const access = await getDocumentAccess(documentId, editor.id);
  assert.ok(access);
  assert.equal(access.access, "edit");
  assert.equal(access.canEdit, true);

  const content = JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "edited" }] }],
  });
  const updated = await updateEditableDocument(
    documentId,
    editor.id,
    "Edited by editor",
    content,
  );
  assert.ok(updated);
  assert.equal(updated.title, "Edited by editor");
  assert.equal(updated.content, content);
});

test("owner can still update the document", async () => {
  const access = await getDocumentAccess(documentId, owner.id);
  assert.ok(access);
  assert.equal(access.access, "owner");
  assert.equal(access.canEdit, true);

  const content = JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "owned" }] }],
  });
  const updated = await updateEditableDocument(
    documentId,
    owner.id,
    "Owned again",
    content,
  );
  assert.ok(updated);
  assert.equal(updated.title, "Owned again");
  assert.equal(updated.content, content);

  // Ensure leftover shares do not block cleanup semantics for the suite.
  const db = getDb();
  const shares = await db
    .select({ id: documentShares.id })
    .from(documentShares)
    .where(eq(documentShares.documentId, documentId));
  assert.equal(shares.length, 2);

  const owned = await db
    .select({ id: documents.id })
    .from(documents)
    .where(eq(documents.id, documentId));
  assert.equal(owned.length, 1);
});
