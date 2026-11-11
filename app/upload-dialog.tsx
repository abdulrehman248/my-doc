"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { uploadDocument, type UploadState } from "./upload-document";

const initialState: UploadState = { error: null };

function FileIcon({ selected }: { selected: boolean }) {
  return (
    <svg
      className="g-file-picker-icon"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 6.5h11.2L28 11.3V33.5H12V6.5Z"
        fill={selected ? "var(--docs-blue-soft)" : "#f1f3f4"}
        stroke={selected ? "var(--docs-blue)" : "var(--docs-line-strong)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M23 6.5v5h5"
        stroke={selected ? "var(--docs-blue)" : "var(--docs-line-strong)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 18h8M16 22.5h8M16 27h5.5"
        stroke={selected ? "var(--docs-blue)" : "var(--docs-muted)"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const titleId = useId();
  const pickerId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(uploadDocument, initialState);

  useEffect(() => {
    if (!open) {
      setFileName(null);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fileRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button type="button" className="g-btn g-btn-secondary" onClick={() => setOpen(true)}>
        Upload
      </button>

      {open ? (
        <div className="g-modal-root">
          <button
            type="button"
            className="g-modal-backdrop"
            aria-label="Close upload dialog"
            onClick={() => setOpen(false)}
          />
          <div
            className="g-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="g-modal-header">
              <div>
                <h2 id={titleId} className="g-modal-title">
                  Upload a file
                </h2>
                <p className="g-user m-0 mt-1">
                  Choose a .txt or .md file (up to 512 KiB). It becomes a new document.
                </p>
              </div>
              <button
                type="button"
                className="g-btn g-btn-ghost"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form action={action} className="mt-4 flex flex-col gap-4">
              <div>
                <input
                  ref={fileRef}
                  id={pickerId}
                  name="file"
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  required
                  className="g-file-input"
                  onChange={(event) => {
                    setFileName(event.target.files?.[0]?.name ?? null);
                  }}
                />
                <label
                  htmlFor={pickerId}
                  className="g-file-picker"
                  data-selected={fileName ? "true" : undefined}
                >
                  <FileIcon selected={Boolean(fileName)} />
                  <span className="g-file-picker-title">
                    {fileName ? fileName : "Select a file"}
                  </span>
                  <span className="g-file-picker-hint">
                    {fileName ? "Click to choose a different file" : ".txt or .md · up to 512 KiB"}
                  </span>
                </label>
              </div>

              {state.error ? (
                <p role="alert" className="g-alert">
                  {state.error}
                </p>
              ) : null}

              <div className="g-modal-actions">
                <button
                  type="button"
                  className="g-btn g-btn-ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={pending} className="g-btn g-btn-primary">
                  {pending ? "Uploading…" : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
