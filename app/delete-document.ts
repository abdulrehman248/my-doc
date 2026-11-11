"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { deleteOwnedDocument } from "@/lib/documents";

export async function deleteDocument(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const documentId = String(formData.get("documentId") ?? "");
  await deleteOwnedDocument(documentId, user.id);
  revalidatePath("/");
}
