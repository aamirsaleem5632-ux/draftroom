"use client";

import { useEffect, useRef, useState } from "react";
import Banner from "@/components/Banner";
import Spinner from "@/components/Spinner";
import { countPlaceholders, countWords } from "@/lib/draftText";
import { exportPdf } from "@/lib/pdf/exportPdf";
import { buildPdfFilename } from "@/lib/pdf/filename";
import { findUnsupportedCharacters } from "@/lib/pdf/pdfText";

interface DraftEditorProps {
  /** The current text. It lives in the parent component's state. */
  text: string;
  onTextChange: (text: string) => void;
  /** True when the text differs from what the AI wrote. */
  isEdited: boolean;
  onRestore: () => void;
  /** True when the AI stopped early because of its length limit. */
  truncated: boolean;
  documentTitle: string;
  fileSlug: string;
  partyOne: string;
  partyTwo: string;
}

const MAX_EDIT_LENGTH = 60000;

const secondaryButton =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

export default function DraftEditor({
  text,
  onTextChange,
  isEdited,
  onRestore,
  truncated,
  documentTitle,
  fileSlug,
  partyOne,
  partyTwo,
}: DraftEditorProps) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const placeholders = countPlaceholders(text);
  const words = countWords(text);

  async function handleExport() {
    setExportError(null);

    if (!text.trim()) {
      setExportError("There is nothing to export yet. Add some text first.");
      return;
    }

    const unsupported = findUnsupportedCharacters(text);
    if (unsupported.length > 0) {
      setExportError(
        `The PDF cannot show these characters yet: ${unsupported.join(" ")}. Please replace them with English letters (for example, write names in English letters) and export again.`,
      );
      return;
    }

    setExporting(true);
    try {
      await exportPdf({
        text,
        fallbackTitle: documentTitle,
        filename: buildPdfFilename(fileSlug, partyOne, partyTwo),
      });
    } catch {
      setExportError(
        "We couldn't create the PDF. Please try again. Your text is still safe in the editor.",
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleCopy() {
    setExportError(null);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setExportError(
        "Your browser blocked copying. Select the text in the box and copy it yourself.",
      );
    }
  }

  return (
    <div className="space-y-4">
      <Banner tone="warning" title="This is an AI-generated draft">
        It is not legal advice and may contain mistakes or gaps. Fill in every
        [PLACEHOLDER], then have a qualified lawyer review it before you sign or
        send it.
      </Banner>

      {truncated ? (
        <Banner tone="warning" title="The draft may be incomplete">
          The AI stopped before it finished. Check the ending, complete it
          yourself, or generate the draft again.
        </Banner>
      ) : null}

      <div>
        <label
          htmlFor="draftText"
          className="block text-sm font-medium text-slate-800"
        >
          Document text (you can edit it)
        </label>
        <textarea
          id="draftText"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          maxLength={MAX_EDIT_LENGTH}
          rows={26}
          spellCheck
          className="mt-1 block min-h-96 w-full resize-y rounded-lg border border-slate-300 bg-white p-4 font-serif text-[15px] leading-7 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <p className="mt-1 text-xs text-slate-500" aria-live="polite">
          {words} words
          {placeholders > 0
            ? ` | ${placeholders} placeholder${placeholders === 1 ? "" : "s"} left to fill in`
            : " | no placeholders left"}
          {isEdited ? " | edited" : ""}
        </p>
      </div>

      {exportError ? (
        <Banner tone="error" title="Couldn't finish that">
          {exportError}
        </Banner>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          aria-busy={exporting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          {exporting ? (
            <>
              <Spinner />
              Creating PDF...
            </>
          ) : (
            "Export PDF"
          )}
        </button>
        <button type="button" onClick={handleCopy} className={secondaryButton}>
          {copied ? "Copied" : "Copy text"}
        </button>
        <button
          type="button"
          onClick={onRestore}
          disabled={!isEdited}
          className={secondaryButton}
        >
          Restore original draft
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Your draft is not saved anywhere. If you close or refresh this page, it
        is lost, so export or copy it first.
      </p>
    </div>
  );
}
