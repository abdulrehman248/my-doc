export type EditorDoc = {
  type: "doc";
  content: Array<Record<string, unknown>>;
};

const EMPTY_DOC: EditorDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function parseContentFromStorage(raw: string): EditorDoc {
  const trimmed = raw.trim();
  if (!trimmed) {
    return EMPTY_DOC;
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (
      parsed &&
      typeof parsed === "object" &&
      "type" in parsed &&
      (parsed as { type: unknown }).type === "doc" &&
      "content" in parsed &&
      Array.isArray((parsed as { content: unknown }).content)
    ) {
      return parsed as EditorDoc;
    }
  } catch {
    // Existing plain-text rows become paragraphs.
  }

  return {
    type: "doc",
    content: raw.split("\n").map((line) =>
      line.length === 0
        ? { type: "paragraph" }
        : { type: "paragraph", content: [{ type: "text", text: line }] },
    ),
  };
}

export function serializeContent(doc: unknown): string {
  return JSON.stringify(doc);
}

export function isEditorContentJson(raw: string): boolean {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Boolean(
      parsed &&
        typeof parsed === "object" &&
        "type" in parsed &&
        (parsed as { type: unknown }).type === "doc",
    );
  } catch {
    return false;
  }
}
