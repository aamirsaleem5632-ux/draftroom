/**
 * Settings shared by the browser and the server. Nothing secret lives here:
 * secrets (the API key) are read from environment variables on the server only.
 */

export const API_DRAFT_PATH = "/api/draft";

export const REQUEST_LIMITS = {
  /** Largest request body the server will read. Our form never needs more. */
  maxBodyBytes: 32 * 1024,
  /** Simple abuse protection: at most this many drafts per IP address... */
  rateLimitMax: 5,
  /** ...in this many milliseconds. */
  rateLimitWindowMs: 60_000,
} as const;

export const AI_SETTINGS = {
  /** Used when GEMINI_MODEL is not set. Check Google's docs for current names. */
  defaultModel: "gemini-3.8-flash",
  /** Upper limit for the reply. Thinking models count their "thinking" in this too. */
  maxOutputTokens: 16384,
  /** How long the server waits for Gemini before giving up. */
  timeoutMs: 55_000,
} as const;

/** The browser waits a little longer than the server so the server can answer first. */
export const CLIENT_TIMEOUT_MS = 65_000;
