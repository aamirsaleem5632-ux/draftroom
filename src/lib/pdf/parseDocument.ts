import { DRAFT_LABEL } from "@/lib/draftText";

/** The pieces the PDF is built from. */
export type PdfBlock =
  | { kind: "label"; text: string }
  | { kind: "title"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; lines: string[] };

/** A short single line without a final full stop looks like a title. */
function looksLikeTitle(lines: string[]): boolean {
  if (lines.length !== 1) return false;
  const line = lines[0];
  return line.length <= 100 && !/[.:;,]$/.test(line);
}

/** A single line with no lowercase letters (and at least 3 letters) looks like a heading. */
function looksLikeHeading(lines: string[]): boolean {
  if (lines.length !== 1) return false;
  const line = lines[0];
  const letters = line.replace(/[^A-Za-zÀ-ɏ]/g, "");
  return line.length <= 90 && letters.length >= 3 && line === line.toUpperCase();
}

/**
 * Turn the (possibly edited) plain text into blocks:
 *  1. the "DRAFT" label line, if it is still there;
 *  2. a title: the first short line, or `fallbackTitle` if there isn't one;
 *  3. headings (UPPERCASE lines) and paragraphs.
 * Paragraphs are separated by blank lines. Line breaks inside a paragraph are kept.
 */
export function parseDocument(text: string, fallbackTitle: string): PdfBlock[] {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    )
    .filter((lines) => lines.length > 0);

  const blocks: PdfBlock[] = [];

  if (paragraphs.length > 0 && paragraphs[0].join(" ") === DRAFT_LABEL) {
    blocks.push({ kind: "label", text: DRAFT_LABEL });
    paragraphs.shift();
  }

  if (paragraphs.length > 0 && looksLikeTitle(paragraphs[0])) {
    blocks.push({ kind: "title", text: paragraphs[0][0] });
    paragraphs.shift();
  } else {
    blocks.push({ kind: "title", text: fallbackTitle });
  }

  for (const lines of paragraphs) {
    if (looksLikeHeading(lines)) {
      blocks.push({ kind: "heading", text: lines[0] });
    } else {
      blocks.push({ kind: "paragraph", lines });
    }
  }

  return blocks;
}
