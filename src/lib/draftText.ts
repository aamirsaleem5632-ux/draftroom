/**
 * Small, dependency-free helpers for the draft text. Used by the server
 * (to label and tidy the AI reply) and by the browser (placeholder count, PDF).
 */

/** First line of every generated draft. The server adds it, not the AI. */
export const DRAFT_LABEL =
  "DRAFT - AI-GENERATED - NOT LEGAL ADVICE - REVIEW WITH A QUALIFIED LAWYER BEFORE USE";

/** Printed in the footer of every PDF page. */
export const PDF_FOOTER_TEXT = "AI-generated draft. Not legal advice.";

/**
 * The AI is told to reply in plain text, but models sometimes slip in Markdown
 * (**bold**, # headings, code fences). This removes the most common leftovers
 * so they don't appear as stray symbols in the editor and the PDF.
 */
export function cleanModelText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((line) => !/^\s*```/.test(line))
    .map((line) =>
      line
        .replace(/^\s{0,3}#{1,6}\s+/, "")
        .replace(/^\s*[*]\s+/, "- ")
        .replace(/\*\*/g, "")
        .replace(/__/g, "")
        .replace(/[ \t]+$/g, ""),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Put the fixed "this is a draft" label above the AI text. */
export function withDraftLabel(body: string): string {
  return `${DRAFT_LABEL}\n\n${body}`;
}

/** Counts [PLACEHOLDERS] that still need to be filled in. */
export function countPlaceholders(text: string): number {
  const matches = text.match(/\[[A-Za-z0-9][^\]\n]{0,120}\]/g);
  return matches ? matches.length : 0;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
