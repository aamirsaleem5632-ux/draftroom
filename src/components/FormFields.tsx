import type { ChangeEvent, ReactNode } from "react";

interface BaseFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  error?: string;
  placeholder?: string;
  maxLength: number;
  required?: boolean;
  hint?: string;
}

const inputClasses = (hasError: boolean) =>
  `mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
  }`;

function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  length,
  maxLength,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  length: number;
  maxLength: number;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
        {!required ? (
          <span className="font-normal text-slate-500"> (optional)</span>
        ) : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {children}
      <div className="mt-1 flex items-start justify-between gap-3">
        <p id={`${id}-error`} className="min-h-4 text-xs text-red-600">
          {error ?? ""}
        </p>
        <p className="shrink-0 text-xs text-slate-400">
          {length}/{maxLength}
        </p>
      </div>
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return ids || undefined;
}

export function TextField(props: BaseFieldProps) {
  const { id, value, error, hint, maxLength } = props;
  return (
    <FieldShell
      id={id}
      label={props.label}
      required={props.required}
      hint={hint}
      error={error}
      length={value.length}
      maxLength={maxLength}
    >
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={inputClasses(Boolean(error))}
      />
    </FieldShell>
  );
}

export function TextAreaField(props: BaseFieldProps & { rows?: number }) {
  const { id, value, error, hint, maxLength } = props;
  return (
    <FieldShell
      id={id}
      label={props.label}
      required={props.required}
      hint={hint}
      error={error}
      length={value.length}
      maxLength={maxLength}
    >
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        maxLength={maxLength}
        rows={props.rows ?? 4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={inputClasses(Boolean(error))}
      />
    </FieldShell>
  );
}
