/**
 * The PDF uses built-in PDF fonts (Times). They cover English and most
 * Western European letters, but NOT scripts such as Urdu, Arabic or Chinese,
 * and not emoji. Instead of silently printing wrong symbols in a legal document,
 * we detect those characters and ask the user to fix them first.
 */

/** Characters above 0xFF that the standard PDF encoding (WinAnsi) still supports. */
const WIN_ANSI_EXTRAS = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";

/** Remove invisible characters and normalise line breaks and tabs. */
export function normalizeForPdf(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "    ")
    .replace(/[​-‍⁠﻿]/g, "")
    // Remove control characters except the line break.
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, "");
}

/** Returns the distinct characters the PDF fonts cannot show (at most `limit`). */
export function findUnsupportedCharacters(text: string, limit = 10): string[] {
  const found = new Set<string>();
  for (const char of normalizeForPdf(text)) {
    const code = char.codePointAt(0) ?? 0;
    if (char === "\n") continue;
    if (code <= 0xff) continue;
    if (WIN_ANSI_EXTRAS.includes(char)) continue;
    found.add(char);
    if (found.size >= limit) break;
  }
  return Array.from(found);
}
