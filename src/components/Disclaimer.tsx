/** Short legal notice shown on every page. */
export default function Disclaimer() {
  return (
    <p className="text-xs leading-relaxed text-slate-500">
      Draftroom produces AI-generated drafts for general information only. It is
      not a law firm and does not give legal advice. Laws differ by country and
      region, so please have a qualified lawyer review any document before you
      sign or send it. Details you enter are sent to Google&apos;s Gemini API to
      write the draft, and on the free tier Google may use them to improve its
      products. Do not enter sensitive personal data such as ID numbers or bank
      details.
    </p>
  );
}
