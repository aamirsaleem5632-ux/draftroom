/** Make text safe for a file name: lowercase letters, digits and single hyphens. */
export function slugify(input: string, maxLength = 30): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Example: nda-acme-traders-ali-khan-2026-10-11.pdf */
export function buildPdfFilename(
  fileSlug: string,
  partyOne: string,
  partyTwo: string,
  date: Date = new Date(),
): string {
  const parts = [fileSlug, slugify(partyOne), slugify(partyTwo), formatDate(date)];
  return `${parts.filter(Boolean).join("-")}.pdf`;
}
