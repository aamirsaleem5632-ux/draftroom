import type { FieldErrors } from "./schemas";

/**
 * Every error the app can show, with a plain-language message.
 * Technical details are only ever written to the server log, never shown to users.
 */
export type ErrorCode =
  // Problems with the request itself
  | "BAD_REQUEST"
  | "VALIDATION"
  | "TOO_LARGE"
  | "RATE_LIMITED"
  // Problems on our server
  | "NOT_CONFIGURED"
  | "INTERNAL"
  // Problems with the AI provider
  | "AI_AUTH"
  | "AI_MODEL"
  | "AI_REGION"
  | "AI_RATE_LIMITED"
  | "AI_BLOCKED"
  | "AI_EMPTY"
  | "AI_TIMEOUT"
  | "AI_UNAVAILABLE"
  // Problems only the browser can detect
  | "NETWORK"
  | "CLIENT_TIMEOUT"
  | "BAD_RESPONSE";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  BAD_REQUEST:
    "We couldn't read that request. Please refresh the page and try again.",
  VALIDATION: "Please fix the highlighted fields and try again.",
  TOO_LARGE: "Your details are too long. Please shorten them and try again.",
  RATE_LIMITED:
    "You're going a bit fast. Please wait about a minute and try again.",
  NOT_CONFIGURED:
    "The drafting service isn't set up yet. The site owner needs to add a Gemini API key.",
  INTERNAL: "Something went wrong on our side. Please try again.",
  AI_AUTH:
    "The drafting service couldn't sign in to the AI provider. The site owner should check the API key.",
  AI_MODEL:
    "The selected AI model isn't available. The site owner should check the model setting.",
  AI_REGION:
    "The AI provider isn't available from this server's location. The site owner should try a different host region.",
  AI_RATE_LIMITED:
    "The AI service is busy or the free usage limit was reached. Please wait a minute and try again.",
  AI_BLOCKED:
    "The AI couldn't draft this request. Try rewording your details and generate again.",
  AI_EMPTY: "The AI returned an empty draft. Please try again.",
  AI_TIMEOUT: "The AI took too long to respond. Please try again.",
  AI_UNAVAILABLE:
    "The AI service is temporarily unavailable. Please try again in a few minutes.",
  NETWORK:
    "We couldn't reach the server. Check your internet connection and try again.",
  CLIENT_TIMEOUT: "This is taking too long. Please try again.",
  BAD_RESPONSE: "We got an unexpected reply from the server. Please try again.",
};

/** HTTP status the server uses for each code. */
export const ERROR_STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION: 400,
  TOO_LARGE: 413,
  RATE_LIMITED: 429,
  NOT_CONFIGURED: 500,
  INTERNAL: 500,
  AI_AUTH: 502,
  AI_MODEL: 502,
  AI_REGION: 502,
  AI_RATE_LIMITED: 429,
  AI_BLOCKED: 422,
  AI_EMPTY: 502,
  AI_TIMEOUT: 504,
  AI_UNAVAILABLE: 502,
  NETWORK: 0,
  CLIENT_TIMEOUT: 0,
  BAD_RESPONSE: 0,
};

/** An error with a code from the list above. Thrown on the server, caught by the API route. */
export class DraftError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode) {
    super(code);
    this.name = "DraftError";
    this.code = code;
  }
}

/** The JSON shape the API route returns on failure. */
export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    fieldErrors?: FieldErrors;
  };
}

/** The JSON shape the API route returns on success. */
export interface ApiSuccessBody {
  draft: string;
  /** True when the AI stopped early because it hit its length limit. */
  truncated: boolean;
}
