import Link from "next/link";
import type { DocumentTypeDefinition } from "@/lib/documentTypes";

export default function DocumentTypeCard({
  type,
}: {
  type: DocumentTypeDefinition;
}) {
  return (
    <Link
      href={`/draft/${type.id}`}
      className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <span className="mb-3 inline-flex w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
        {type.badge}
      </span>
      <h2 className="text-lg font-semibold text-slate-900">{type.title}</h2>
      <p className="mt-2 flex-1 text-sm text-slate-600">{type.description}</p>
      <span className="mt-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
        Start drafting &rarr;
      </span>
    </Link>
  );
}
