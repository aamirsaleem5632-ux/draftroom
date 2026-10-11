import Link from "next/link";
import { notFound } from "next/navigation";
import DraftWorkspace from "@/components/DraftWorkspace";
import { DOCUMENT_TYPES, getDocumentType } from "@/lib/documentTypes";

export function generateStaticParams() {
  return DOCUMENT_TYPES.map((type) => ({ type: type.id }));
}

export default async function DraftPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const docType = getDocumentType(type);

  if (!docType) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          &larr; Back to dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          {docType.title}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">{docType.description}</p>
      </div>

      <DraftWorkspace documentTypeId={docType.id} />
    </div>
  );
}
