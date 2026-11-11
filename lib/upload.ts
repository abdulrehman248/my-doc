import { DEFAULT_TITLE, MAX_TITLE_LENGTH } from "@/lib/documents";
import { parseContentFromStorage, serializeContent } from "@/lib/editor-content";

export const MAX_UPLOAD_BYTES = 512 * 1024;

export type AllowedUploadExtension = ".txt" | ".md";

export function getAllowedUploadExtension(fileName: string): AllowedUploadExtension | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".txt")) {
    return ".txt";
  }
  if (lower.endsWith(".md")) {
    return ".md";
  }
  return null;
}

export function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^/.]+$/, "").trim();
  if (!base) {
    return DEFAULT_TITLE;
  }
  return base.slice(0, MAX_TITLE_LENGTH);
}

export function contentFromUploadText(text: string): string {
  return serializeContent(parseContentFromStorage(text));
}
