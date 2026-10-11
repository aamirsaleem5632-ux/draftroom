"use client";

import { useEffect, useRef, useState } from "react";
import DraftEditor from "@/components/DraftEditor";
import DraftForm, { type GeneratedResult } from "@/components/DraftForm";
import { getDocumentType } from "@/lib/documentTypes";
import type { DocumentTypeId } from "@/lib/schemas";

/**
 * Holds the application state for one drafting session:
 *  - `result`: what the AI produced (kept so we can "restore original");
 *  - `text`: the CURRENT text in the editor, including the user's edits.
 * The PDF is built from `text`, so edits always end up in the export.
 */
export default function DraftWorkspace({
  documentTypeId,
}: {
  documentTypeId: DocumentTypeId;
}) {
  const docType = getDocumentType(documentTypeId);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [text, setText] = useState("");
  const editorSection = useRef<HTMLElement | null>(null);

  const isEdited = result !== null && text !== result.draft;

  // After a new draft arrives, scroll to it so the user sees it.
  useEffect(() => {
    if (result) {
      editorSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // The draft only exists in this page, so warn before the user loses it.
  const hasText = text.trim().length > 0;
  useEffect(() => {
    if (!hasText) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasText]);

  if (!docType) return null;

  function handleDraft(generated: GeneratedResult) {
    setResult(generated);
    setText(generated.draft);
  }

  function handleBeforeGenerate(): boolean {
    if (!isEdited) return true;
    return window.confirm(
      "Generating a new draft will replace the edits you made. Continue?",
    );
  }

  return (
    <div className="space-y-6">
      <section
        aria-label="Document details"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <DraftForm
          documentTypeId={documentTypeId}
          onDraft={handleDraft}
          onBeforeGenerate={handleBeforeGenerate}
        />
      </section>

      {result ? (
        <section
          ref={editorSection}
          aria-label="Draft preview"
          className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Your draft
          </h2>
          <DraftEditor
            text={text}
            onTextChange={setText}
            isEdited={isEdited}
            onRestore={() => setText(result.draft)}
            truncated={result.truncated}
            documentTitle={docType.title}
            fileSlug={docType.fileSlug}
            partyOne={result.request.partyOne}
            partyTwo={result.request.partyTwo}
          />
        </section>
      ) : null}
    </div>
  );
}
