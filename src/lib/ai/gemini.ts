import "server-only";
import { GoogleGenAI } from "@google/genai";
import { AI_SETTINGS } from "@/lib/config";
import { cleanModelText, withDraftLabel } from "@/lib/draftText";
import { DraftError } from "@/lib/errors";
import type { DraftRequest } from "@/lib/schemas";
import { mapAiError } from "./mapError";
import { SYSTEM_INSTRUCTION, buildUserPrompt } from "./prompts";

/**
 * This is the ONLY file that talks to Google's Gemini API.
 *
 * - "server-only" (above) makes the build fail if a browser file ever imports this.
 * - The API key is read from process.env on the server. It is never sent to the
 *   browser, never logged, and never included in an error message.
 */

export interface GeneratedDraft {
  text: string;
  truncated: boolean;
}

export async function generateDraftText(
  request: DraftRequest,
): Promise<GeneratedDraft> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new DraftError("NOT_CONFIGURED");
  }
  const model = process.env.GEMINI_MODEL?.trim() || AI_SETTINGS.defaultModel;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: AI_SETTINGS.timeoutMs },
  });

  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: buildUserPrompt(request),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: AI_SETTINGS.maxOutputTokens,
      },
    });
  } catch (error) {
    // Safe to log: only the HTTP status and error type. No key, no user text.
    console.error("[gemini] request failed", {
      status:
        typeof error === "object" && error !== null && "status" in error
          ? (error as { status: unknown }).status
          : undefined,
      errorName: error instanceof Error ? error.name : typeof error,
      model,
    });
    throw mapAiError(error);
  }

  // The prompt itself was refused by Google's safety filters.
  if (response.promptFeedback?.blockReason) {
    throw new DraftError("AI_BLOCKED");
  }

  const text = cleanModelText(response.text ?? "");
  const finishReason = String(response.candidates?.[0]?.finishReason ?? "");

  if (!text) {
    const blockedReasons = ["SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII"];
    throw new DraftError(blockedReasons.includes(finishReason) ? "AI_BLOCKED" : "AI_EMPTY");
  }

  return {
    text: withDraftLabel(text),
    truncated: finishReason === "MAX_TOKENS",
  };
}
