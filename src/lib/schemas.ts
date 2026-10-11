import { z } from "zod";

/** The document types the app supports. Add a new id here AND in documentTypes.ts. */
export const DOCUMENT_TYPE_IDS = [
  "nda",
  "service-agreement",
  "business-letter",
] as const;

export type DocumentTypeId = (typeof DOCUMENT_TYPE_IDS)[number];

/** Maximum lengths (in characters). The server enforces these too. */
export const LIMITS = {
  name: 120,
  jurisdiction: 120,
  purpose: 1000,
  extraDetails: 3000,
} as const;

export const draftRequestSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPE_IDS, {
    errorMap: () => ({ message: "Please choose a valid document type." }),
  }),
  partyOne: z
    .string()
    .trim()
    .min(1, "This name is required.")
    .max(LIMITS.name, `Please keep this under ${LIMITS.name} characters.`),
  partyTwo: z
    .string()
    .trim()
    .min(1, "This name is required.")
    .max(LIMITS.name, `Please keep this under ${LIMITS.name} characters.`),
  jurisdiction: z
    .string()
    .trim()
    .min(2, "Please enter a country, state, or region (for example: Punjab, Pakistan).")
    .max(LIMITS.jurisdiction, `Please keep this under ${LIMITS.jurisdiction} characters.`),
  purpose: z
    .string()
    .trim()
    .min(10, "Please describe the purpose in at least a short sentence (10+ characters).")
    .max(LIMITS.purpose, `Please keep this under ${LIMITS.purpose} characters.`),
  extraDetails: z
    .string()
    .trim()
    .max(LIMITS.extraDetails, `Please keep this under ${LIMITS.extraDetails} characters.`)
    .default(""),
});

export type DraftRequest = z.infer<typeof draftRequestSchema>;

export type FieldName = Exclude<keyof DraftRequest, "documentType">;
export type FieldErrors = Partial<Record<FieldName | "documentType", string>>;

export type ValidationResult =
  | { ok: true; data: DraftRequest }
  | { ok: false; fieldErrors: FieldErrors };

/**
 * Validate unknown input (from the form in the browser, or from a request body
 * on the server) and return friendly per-field messages.
 */
export function validateDraftRequest(input: unknown): ValidationResult {
  const result = draftRequestSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }

  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key as keyof FieldErrors] = issue.message;
    }
  }
  return { ok: false, fieldErrors };
}
