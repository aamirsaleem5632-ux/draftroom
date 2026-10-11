import type { Metadata } from "next";
import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draftroom | AI Legal Document Drafting",
  description:
    "Draft common legal documents with AI assistance, edit them, and export to PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/dashboard" className="text-lg font-bold text-slate-900">
              Draft<span className="text-indigo-600">room</span>
            </Link>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Draft tool, not legal advice
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
            <Disclaimer />
          </div>
        </footer>
      </body>
    </html>
  );
}
