"use client";

import { deleteDocument } from "./delete-document";

type DeleteDocumentButtonProps = {
  documentId: string;
  title: string;
};

export function DeleteDocumentButton({ documentId, title }: DeleteDocumentButtonProps) {
  return (
    <form
      action={deleteDocument}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="documentId" value={documentId} />
      <button type="submit" className="g-btn g-btn-danger" aria-label={`Delete ${title}`}>
        Delete
      </button>
    </form>
  );
}
