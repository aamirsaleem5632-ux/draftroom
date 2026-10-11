import { generateDraftText } from "@/lib/ai/gemini";
import { REQUEST_LIMITS } from "@/lib/config";
import {
  DraftError,
  ERROR_MESSAGES,
  ERROR_STATUS,
  type ApiErrorBody,
  type ApiSuccessBody,
  type ErrorCode,
} from "@/lib/errors";
import { getClientIp } from "@/lib/http/clientIp";
import { readTextWithLimit } from "@/lib/http/readBody";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateDraftRequest, type FieldErrors } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Gives the AI time to answer on hosts that enforce a function time limit. */
export const maxDuration = 60;

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function errorResponse(
  code: ErrorCode,
  extra: { fieldErrors?: FieldErrors; headers?: Record<string, string> } = {},
): Response {
  const body: ApiErrorBody = {
    error: {
      code,
      message: ERROR_MESSAGES[code],
      ...(extra.fieldErrors ? { fieldErrors: extra.fieldErrors } : {}),
    },
  };
  return new Response(JSON.stringify(body), {
    status: ERROR_STATUS[code],
    headers: { ...JSON_HEADERS, ...extra.headers },
  });
}

/** POST /api/draft: validate the form data, ask Gemini for a draft, return it. */
export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Abuse protection first, so rejected requests cost almost nothing.
    const limit = checkRateLimit(
      getClientIp(request.headers),
      REQUEST_LIMITS.rateLimitMax,
      REQUEST_LIMITS.rateLimitWindowMs,
    );
    if (!limit.allowed) {
      return errorResponse("RATE_LIMITED", {
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      });
    }

    // 2. Only accept JSON, and only read a limited amount of it.
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return errorResponse("BAD_REQUEST");
    }
    const rawBody = await readTextWithLimit(request, REQUEST_LIMITS.maxBodyBytes);
    if (rawBody === null) {
      return errorResponse("TOO_LARGE");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return errorResponse("BAD_REQUEST");
    }

    // 3. Validate again on the server. Browser checks can be bypassed.
    const validation = validateDraftRequest(parsed);
    if (!validation.ok) {
      return errorResponse("VALIDATION", { fieldErrors: validation.fieldErrors });
    }

    // 4. Ask the AI. The API key is read inside this call, on the server only.
    const draft = await generateDraftText(validation.data);

    const body: ApiSuccessBody = { draft: draft.text, truncated: draft.truncated };
    return new Response(JSON.stringify(body), { status: 200, headers: JSON_HEADERS });
  } catch (error) {
    const code: ErrorCode = error instanceof DraftError ? error.code : "INTERNAL";
    // Log only the error code and type. Never log the form data, the draft, or the key.
    console.error("[api/draft] request failed", {
      code,
      errorName: error instanceof Error ? error.name : typeof error,
    });
    return errorResponse(code);
  }
}
