import type { DocumentTypeId } from "./schemas";

export interface DocumentTypeDefinition {
  id: DocumentTypeId;
  title: string;
  description: string;
  /** Short label used on the dashboard card. */
  badge: string;
  partyOneLabel: string;
  partyOnePlaceholder: string;
  partyTwoLabel: string;
  partyTwoPlaceholder: string;
  purposeLabel: string;
  purposePlaceholder: string;
  extraDetailsPlaceholder: string;
  /** Used for the PDF title and filename in Stage D. */
  fileSlug: string;
}

export const DOCUMENT_TYPES: DocumentTypeDefinition[] = [
  {
    id: "nda",
    title: "Non-Disclosure Agreement (NDA)",
    description:
      "Keep shared business information confidential between two parties.",
    badge: "Confidentiality",
    partyOneLabel: "Disclosing party",
    partyOnePlaceholder: "e.g. Acme Traders (Pvt) Ltd",
    partyTwoLabel: "Receiving party",
    partyTwoPlaceholder: "e.g. Ali Khan",
    purposeLabel: "Purpose of sharing information",
    purposePlaceholder:
      "e.g. Evaluating a possible software development partnership.",
    extraDetailsPlaceholder:
      "Optional: duration of confidentiality, what counts as confidential, any special terms.",
    fileSlug: "nda",
  },
  {
    id: "service-agreement",
    title: "Service Agreement",
    description:
      "Set out the work, payment, and responsibilities between a client and a provider.",
    badge: "Services",
    partyOneLabel: "Service provider",
    partyOnePlaceholder: "e.g. Sara Ahmed (Freelance Designer)",
    partyTwoLabel: "Client",
    partyTwoPlaceholder: "e.g. Bright Future Ltd",
    purposeLabel: "Services to be provided",
    purposePlaceholder:
      "e.g. Design and delivery of a company website within 6 weeks.",
    extraDetailsPlaceholder:
      "Optional: fees, payment schedule, deadlines, deliverables, termination terms.",
    fileSlug: "service-agreement",
  },
  {
    id: "business-letter",
    title: "Formal Business Letter",
    description:
      "A professional letter, such as a notice, request, or formal complaint.",
    badge: "Correspondence",
    partyOneLabel: "Sender",
    partyOnePlaceholder: "e.g. Bilal Hussain",
    partyTwoLabel: "Recipient",
    partyTwoPlaceholder: "e.g. The Manager, City Supplies Ltd",
    purposeLabel: "What the letter is about",
    purposePlaceholder:
      "e.g. Request for a refund for a delayed order, with a 14-day deadline.",
    extraDetailsPlaceholder:
      "Optional: order numbers, dates, tone (firm or polite), what you want to happen next.",
    fileSlug: "business-letter",
  },
];

export function getDocumentType(
  id: string,
): DocumentTypeDefinition | undefined {
  return DOCUMENT_TYPES.find((type) => type.id === id);
}
