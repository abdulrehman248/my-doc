"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createOwnedDocument } from "@/lib/documents";
import {
  contentFromUploadText,
  getAllowedUploadExtension,
  MAX_UPLOAD_BYTES,
  titleFromFileName,
} from "@/lib/upload";

export type UploadState = {
  error: string | null;
};

export async function uploadDocument(
  _state: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a .txt or .md file." };
  }

  if (!getAllowedUploadExtension(file.name)) {
    return { error: "Only .txt and .md files are accepted." };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "File must be 512 KiB or smaller." };
  }

  const text = await file.text();
  const document = await createOwnedDocument(
    user.id,
    titleFromFileName(file.name),
    contentFromUploadText(text),
  );

  redirect(`/documents/${document.id}`);
}
