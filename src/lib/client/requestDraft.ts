import { API_DRAFT_PATH, CLIENT_TIMEOUT_MS } from "@/lib/config";
import {
  ERROR_MESSAGES,
  type ApiErrorBody,
  type ApiSuccessBody,
  type ErrorCode,
} from "@/lib/errors";
import type { DraftRequest, FieldErrors } from "@/lib/schemas";

export type DraftOutcome =
  | { ok: true; draft: string; truncated: boolean }
  | { ok: false; code: ErrorCode; message: string; fieldErrors?: FieldErrors };

function fail(code: ErrorCode, message?: string, fieldErrors?: FieldErrors): DraftOutcome {
  return { ok: false, code, message: message ?? ERROR_MESSAGES[code], fieldErrors };
}

function isSuccessBody(value: unknown): value is ApiSuccessBody {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ApiSuccessBody).draft === "string" &&
    (value as ApiSuccessBody).draft.trim().length > 0
  );
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) return false;
  const error = (value as ApiErrorBody).error;
  return (
    typeof error === "object" &&
    error !== null &&
    typeof error.code === "string" &&
    typeof error.message === "string"
  );
}

/**
 * Ask our own server (never Gemini directly) for a draft.
 * Always resolves with a result object, so the form can show a friendly message.
 * `signal` lets the caller cancel (for example when the page is closed).
 */
export async function requestDraft(
  data: DraftRequest,
  signal: AbortSignal,
): Promise<DraftOutcome> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), CLIENT_TIMEOUT_MS);
  const cancel = () => timeout.abort();
  signal.addEventListener("abort", cancel);

  try {
    const response = await fetch(API_DRAFT_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: timeout.signal,
    });

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // The reply was not JSON (for example an HTML error page). Handled below.
    }

    if (response.ok && isSuccessBody(body)) {
      return { ok: true, draft: body.draft, truncated: body.truncated === true };
    }
    if (isErrorBody(body)) {
      return fail(body.error.code, body.error.message, body.error.fieldErrors);
    }
    if (response.status === 429) return fail("RATE_LIMITED");
    return fail(response.ok ? "BAD_RESPONSE" : "INTERNAL");
  } catch {
    if (signal.aborted) return fail("NETWORK");
    return fail(timeout.signal.aborted ? "CLIENT_TIMEOUT" : "NETWORK");
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
  }
}
