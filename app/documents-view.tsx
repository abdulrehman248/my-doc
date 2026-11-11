"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { ShareRole } from "@/lib/documents";
import { DeleteDocumentButton } from "./delete-document-button";

type OwnedDoc = {
  id: string;
  title: string;
  updatedAt: string;
};

type SharedDoc = {
  id: string;
  title: string;
  updatedAt: string;
  ownerEmail: string;
  role: ShareRole;
};

type ViewMode = "grid" | "list";

const VIEW_STORAGE_KEY = "ajaia-docs-view";
const SECTION_STORAGE_KEY = "ajaia-docs-sections";

type SectionKey = "owned" | "shared";

type SectionState = Record<SectionKey, boolean>;

const DEFAULT_SECTIONS: SectionState = {
  owned: true,
  shared: true,
};

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function roleLabel(role: ShareRole): string {
  return role === "edit" ? "Can edit" : "Can view";
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="g-section-chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      data-open={open ? "true" : undefined}
    >
      <path
        d="M4.5 6.25 8 9.75l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocThumb() {
  return (
    <div className="g-doc-thumb" aria-hidden>
      <span className="g-doc-thumb-lines">
        <span />
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

function DocSection({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panelId = useId();

  return (
    <section className="g-section">
      <button
        type="button"
        className="g-section-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <ChevronIcon open={open} />
        <span className="g-section-title m-0">{title}</span>
        <span className="g-section-count">{count}</span>
      </button>
      <div id={panelId} className="g-section-panel" hidden={!open}>
        {children}
      </div>
    </section>
  );
}

type DocumentsViewProps = {
  owned: OwnedDoc[];
  shared: SharedDoc[];
};

export function DocumentsView({ owned, shared }: DocumentsViewProps) {
  const [view, setView] = useState<ViewMode>("grid");
  const [sections, setSections] = useState<SectionState>(DEFAULT_SECTIONS);

  useEffect(() => {
    const storedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (storedView === "list" || storedView === "grid") {
      setView(storedView);
    }

    try {
      const raw = window.localStorage.getItem(SECTION_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed: unknown = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        "owned" in parsed &&
        "shared" in parsed &&
        typeof (parsed as SectionState).owned === "boolean" &&
        typeof (parsed as SectionState).shared === "boolean"
      ) {
        setSections(parsed as SectionState);
      }
    } catch {
      // Ignore bad stored state.
    }
  }, []);

  function chooseView(next: ViewMode) {
    setView(next);
    window.localStorage.setItem(VIEW_STORAGE_KEY, next);
  }

  function toggleSection(key: SectionKey) {
    setSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      window.localStorage.setItem(SECTION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <>
      <div className="g-view-bar">
        <div className="g-view-toggle" role="group" aria-label="Document layout">
          <button
            type="button"
            className="g-view-btn"
            aria-pressed={view === "grid"}
            aria-label="Grid view"
            onClick={() => chooseView("grid")}
          >
            <GridIcon />
          </button>
          <button
            type="button"
            className="g-view-btn"
            aria-pressed={view === "list"}
            aria-label="List view"
            onClick={() => chooseView("list")}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      <DocSection
        title="Owned by me"
        count={owned.length}
        open={sections.owned}
        onToggle={() => toggleSection("owned")}
      >
        {owned.length === 0 ? (
          <div className="g-card">
            <p className="g-empty">No documents yet. Create a blank document to begin.</p>
          </div>
        ) : view === "grid" ? (
          <ul className="g-doc-grid">
            {owned.map((doc) => (
              <li key={doc.id} className="g-doc-tile">
                <Link href={`/documents/${doc.id}`} className="g-doc-tile-link">
                  <DocThumb />
                  <span className="g-doc-tile-body">
                    <span className="g-doc-title">{doc.title}</span>
                    <span className="g-doc-meta">Opened {formatUpdatedAt(doc.updatedAt)}</span>
                  </span>
                </Link>
                <div className="g-doc-tile-actions">
                  <DeleteDocumentButton documentId={doc.id} title={doc.title} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="g-card">
            <ul className="g-list">
              {owned.map((doc) => (
                <li key={doc.id} className="g-list-row">
                  <Link href={`/documents/${doc.id}`} className="g-list-main">
                    <span className="g-doc-title">{doc.title}</span>
                    <span className="g-doc-meta">Opened {formatUpdatedAt(doc.updatedAt)}</span>
                  </Link>
                  <DeleteDocumentButton documentId={doc.id} title={doc.title} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </DocSection>

      <DocSection
        title="Shared with me"
        count={shared.length}
        open={sections.shared}
        onToggle={() => toggleSection("shared")}
      >
        {shared.length === 0 ? (
          <div className="g-card">
            <p className="g-empty">Nothing shared with you yet.</p>
          </div>
        ) : view === "grid" ? (
          <ul className="g-doc-grid">
            {shared.map((doc) => (
              <li key={doc.id} className="g-doc-tile">
                <Link href={`/documents/${doc.id}`} className="g-doc-tile-link">
                  <DocThumb />
                  <span className="g-doc-tile-body">
                    <span className="g-doc-title">{doc.title}</span>
                    <span className="g-doc-meta">
                      {doc.ownerEmail} · {roleLabel(doc.role)} · {formatUpdatedAt(doc.updatedAt)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="g-card">
            <ul className="g-list">
              {shared.map((doc) => (
                <li key={doc.id}>
                  <Link href={`/documents/${doc.id}`}>
                    <span className="g-doc-title">{doc.title}</span>
                    <span className="g-doc-meta">
                      {doc.ownerEmail} · {roleLabel(doc.role)} · {formatUpdatedAt(doc.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DocSection>
    </>
  );
}
