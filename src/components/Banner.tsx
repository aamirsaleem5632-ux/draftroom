import type { ReactNode } from "react";

type Tone = "error" | "info" | "success" | "warning";

const TONE_STYLES: Record<Tone, string> = {
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

interface BannerProps {
  tone: Tone;
  title?: string;
  children: ReactNode;
}

/** A message box. Errors use role="alert" so screen readers announce them. */
export default function Banner({ tone, title, children }: BannerProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm ${TONE_STYLES[tone]}`}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}
