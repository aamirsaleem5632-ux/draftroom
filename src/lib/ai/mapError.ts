import { DraftError } from "@/lib/errors";

function readStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

function readMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}

/**
 * Turn whatever the AI SDK threw into one of our friendly error codes.
 * It looks at the HTTP status and message instead of the SDK's own classes,
 * so it keeps working if the SDK is updated.
 */
export function mapAiError(error: unknown): DraftError {
  if (error instanceof DraftError) return error;

  const status = readStatus(error);
  const message = readMessage(error).toLowerCase();
  const name = error instanceof Error ? error.name : "";

  if (
    name === "AbortError" ||
    name === "TimeoutError" ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("aborted")
  ) {
    return new DraftError("AI_TIMEOUT");
  }
  if (message.includes("location is not supported")) {
    return new DraftError("AI_REGION");
  }
  if (message.includes("api key")) {
    return new DraftError("AI_AUTH");
  }
  if (status === 429) return new DraftError("AI_RATE_LIMITED");
  if (status === 401 || status === 403) return new DraftError("AI_AUTH");
  if (status === 404) return new DraftError("AI_MODEL");
  if (status === 408 || status === 504) return new DraftError("AI_TIMEOUT");

  return new DraftError("AI_UNAVAILABLE");
}
