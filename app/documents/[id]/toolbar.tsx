"use client";

import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";

type ToolbarProps = {
  editor: Editor;
  showFormatting?: boolean;
  canComment?: boolean;
  onComment?: () => void;
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const icons = {
  bold: (
    <Icon>
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
      <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </Icon>
  ),
  italic: (
    <Icon>
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </Icon>
  ),
  underline: (
    <Icon>
      <path d="M7 4v7a5 5 0 0 0 10 0V4" />
      <line x1="5" y1="20" x2="19" y2="20" />
    </Icon>
  ),
  paragraph: (
    <Icon>
      <path d="M13 4H8a4 4 0 0 0 0 8h1" />
      <line x1="9" y1="4" x2="9" y2="20" />
      <line x1="13" y1="4" x2="13" y2="20" />
      <line x1="17" y1="4" x2="17" y2="20" />
    </Icon>
  ),
  heading1: (
    <Icon>
      <path d="M4 6v12" />
      <path d="M12 6v12" />
      <path d="M4 12h8" />
      <path d="M17 12v6" />
      <path d="M17 10c1.2-1.2 2.5-1.5 3.5-.8" />
    </Icon>
  ),
  heading2: (
    <Icon>
      <path d="M4 6v12" />
      <path d="M12 6v12" />
      <path d="M4 12h8" />
      <path d="M16 12h4c.8 0 1.5.7 1.5 1.5 0 .6-.3 1-.9 1.4L16 18h5" />
    </Icon>
  ),
  bulletList: (
    <Icon>
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
      <circle cx="5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
  ),
  orderedList: (
    <Icon>
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
      <path d="M4 5h2v4" />
      <path d="M4 9h2" />
      <path d="M5 12h1.5a1.2 1.2 0 0 1 0 2.4H4.8L6.5 18H4" />
    </Icon>
  ),
  pageBreak: (
    <Icon>
      <path d="M4 8h16" />
      <path d="M4 16h16" />
      <path d="M8 4v4" />
      <path d="M16 4v4" />
      <path d="M8 16v4" />
      <path d="M16 16v4" />
    </Icon>
  ),
  comment: (
    <Icon>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Icon>
  ),
};

function ToolButton({
  label,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active ?? false}
      disabled={disabled}
      className="g-tool"
    >
      {icon}
    </button>
  );
}

function ToolDivider() {
  return <span className="g-tool-divider" aria-hidden="true" />;
}

export function EditorToolbar({
  editor,
  showFormatting = true,
  canComment = false,
  onComment,
}: ToolbarProps) {
  return (
    <div className="g-toolbar" role="toolbar" aria-label="Document tools">
      {showFormatting ? (
        <>
          <div className="g-tool-group">
            <ToolButton
              label="Bold"
              icon={icons.bold}
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolButton
              label="Italic"
              icon={icons.italic}
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolButton
              label="Underline"
              icon={icons.underline}
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
          </div>
          <ToolDivider />
          <div className="g-tool-group">
            <ToolButton
              label="Normal text"
              icon={icons.paragraph}
              active={editor.isActive("paragraph")}
              onClick={() => editor.chain().focus().setParagraph().run()}
            />
            <ToolButton
              label="Heading 1"
              icon={icons.heading1}
              active={editor.isActive("heading", { level: 1 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            />
            <ToolButton
              label="Heading 2"
              icon={icons.heading2}
              active={editor.isActive("heading", { level: 2 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            />
          </div>
          <ToolDivider />
          <div className="g-tool-group">
            <ToolButton
              label="Bulleted list"
              icon={icons.bulletList}
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolButton
              label="Numbered list"
              icon={icons.orderedList}
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </div>
          <ToolDivider />
          <div className="g-tool-group">
            <ToolButton
              label="Insert page break"
              icon={icons.pageBreak}
              onClick={() => editor.chain().focus().setPageBreak().run()}
            />
          </div>
          <ToolDivider />
        </>
      ) : null}
      <div className="g-tool-group">
        <ToolButton
          label="Add comment"
          icon={icons.comment}
          disabled={!canComment}
          onClick={() => onComment?.()}
        />
      </div>
    </div>
  );
}
