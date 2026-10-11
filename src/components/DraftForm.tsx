"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Banner from "@/components/Banner";
import { TextAreaField, TextField } from "@/components/FormFields";
import Spinner from "@/components/Spinner";
import { requestDraft } from "@/lib/client/requestDraft";
import { getDocumentType } from "@/lib/documentTypes";
import {
  LIMITS,
  validateDraftRequest,
  type DocumentTypeId,
  type DraftRequest,
  type FieldErrors,
  type FieldName,
} from "@/lib/schemas";

type Values = Record<FieldName, string>;

const EMPTY_VALUES: Values = {
  partyOne: "",
  partyTwo: "",
  jurisdiction: "",
  purpose: "",
  extraDetails: "",
};

export interface GeneratedResult {
  draft: string;
  truncated: boolean;
  request: DraftRequest;
}

interface DraftFormProps {
  documentTypeId: DocumentTypeId;
  /** Called with the AI's draft after a successful request. */
  onDraft: (result: GeneratedResult) => void;
  /** Return false to stop the request (for example if the user cancels a confirm box). */
  onBeforeGenerate?: () => boolean;
}

export default function DraftForm({
  documentTypeId,
  onDraft,
  onBeforeGenerate,
}: DraftFormProps) {
  const docType = getDocumentType(documentTypeId);

  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cancel an unfinished request if the user leaves the page.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  if (!docType) {
    return <Banner tone="error">Unknown document type.</Banner>;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = event.target.name as FieldName;
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear the old error for this field as soon as the user edits it.
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setRequestError(null);
  }

  function handleBlur(name: FieldName) {
    const result = validateDraftRequest({ documentType: documentTypeId, ...values });
    if (!result.ok && result.fieldErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: result.fieldErrors[name] }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setRequestError(null);

    // 1. Check the form in the browser for instant feedback.
    const result = validateDraftRequest({ documentType: documentTypeId, ...values });
    if (!result.ok) {
      setErrors(result.fieldErrors);
      return;
    }
    setErrors({});

    if (onBeforeGenerate && !onBeforeGenerate()) return;

    // 2. Ask our own server for a draft. The server checks the data again.
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const outcome = await requestDraft(result.data, controller.signal);
    if (controller.signal.aborted) return; // the page was closed

    setLoading(false);
    if (outcome.ok) {
      onDraft({
        draft: outcome.draft,
        truncated: outcome.truncated,
        request: result.data,
      });
      return;
    }

    setRequestError(outcome.message);
    if (outcome.fieldErrors) setErrors(outcome.fieldErrors);
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {errorCount > 0 ? (
        <Banner tone="error" title="Please fix the highlighted fields">
          {errorCount === 1
            ? "One field needs your attention."
            : `${errorCount} fields need your attention.`}
        </Banner>
      ) : null}

      <fieldset
        disabled={loading}
        className="m-0 min-w-0 space-y-5 border-0 p-0 disabled:opacity-70"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="partyOne"
            label={docType.partyOneLabel}
            value={values.partyOne}
            onChange={handleChange}
            onBlur={() => handleBlur("partyOne")}
            error={errors.partyOne}
            placeholder={docType.partyOnePlaceholder}
            maxLength={LIMITS.name}
            required
          />
          <TextField
            id="partyTwo"
            label={docType.partyTwoLabel}
            value={values.partyTwo}
            onChange={handleChange}
            onBlur={() => handleBlur("partyTwo")}
            error={errors.partyTwo}
            placeholder={docType.partyTwoPlaceholder}
            maxLength={LIMITS.name}
            required
          />
        </div>

        <TextField
          id="jurisdiction"
          label="Jurisdiction"
          hint="The country, state, or region whose law should apply."
          value={values.jurisdiction}
          onChange={handleChange}
          onBlur={() => handleBlur("jurisdiction")}
          error={errors.jurisdiction}
          placeholder="e.g. Punjab, Pakistan"
          maxLength={LIMITS.jurisdiction}
          required
        />

        <TextAreaField
          id="purpose"
          label={docType.purposeLabel}
          value={values.purpose}
          onChange={handleChange}
          onBlur={() => handleBlur("purpose")}
          error={errors.purpose}
          placeholder={docType.purposePlaceholder}
          maxLength={LIMITS.purpose}
          rows={4}
          required
        />

        <TextAreaField
          id="extraDetails"
          label="Extra details"
          hint="Anything else the draft should include. Missing details will be left as [PLACEHOLDERS]."
          value={values.extraDetails}
          onChange={handleChange}
          onBlur={() => handleBlur("extraDetails")}
          error={errors.extraDetails}
          placeholder={docType.extraDetailsPlaceholder}
          maxLength={LIMITS.extraDetails}
          rows={5}
        />
      </fieldset>

      {requestError ? (
        <Banner tone="error" title="We couldn't generate the draft">
          {requestError}
        </Banner>
      ) : null}

      <Banner tone="warning" title="Privacy notice">
        When you press Generate Draft, the details above are sent to
        Google&apos;s Gemini API. On the free tier, Google may use submitted
        content to improve its products. Do not enter confidential information,
        ID numbers or bank details. Use placeholders instead.
      </Banner>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {loading ? (
            <>
              <Spinner />
              Generating draft...
            </>
          ) : (
            "Generate Draft"
          )}
        </button>
        <p className="text-xs text-slate-500" aria-live="polite">
          {loading
            ? "This can take up to a minute. Please keep this page open."
            : "Fields marked * are required."}
        </p>
      </div>
    </form>
  );
}
