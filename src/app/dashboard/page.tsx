import DocumentTypeCard from "@/components/DocumentTypeCard";
import { DOCUMENT_TYPES } from "@/lib/documentTypes";

const STEPS = [
  { title: "1. Choose", text: "Pick the type of document you need." },
  { title: "2. Describe", text: "Enter the parties, jurisdiction, and purpose." },
  { title: "3. Review", text: "Edit the draft and export it as a PDF." },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          What would you like to draft?
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Choose a document type, fill in a few details, and get a first draft
          you can edit before exporting.
        </p>
      </section>

      <section
        aria-label="Document types"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {DOCUMENT_TYPES.map((type) => (
          <DocumentTypeCard key={type.id} type={type} />
        ))}
      </section>

      <section aria-label="How it works">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          How it works
        </h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.title}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="font-semibold text-slate-900">{step.title}</p>
              <p className="mt-1 text-sm text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
