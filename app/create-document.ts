"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createOwnedDocument } from "@/lib/documents";

export async function createDocument(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const document = await createOwnedDocument(user.id);
  redirect(`/documents/${document.id}`);
}
