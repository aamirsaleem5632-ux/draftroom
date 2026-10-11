# Draftroom: AI legal document drafting (MVP)

A small web app. You pick a document type (NDA, service agreement, or formal
business letter), fill in a form, and an AI (Google Gemini) writes a first draft.
You edit the draft in the browser and export it as a PDF.

> Draftroom is a drafting aid, **not** a law firm. Every draft is labelled as
> AI-generated and must be reviewed by a qualified lawyer before use.

## 1. Run it on Windows (VS Code)

You need **Node.js 20 or newer** (https://nodejs.org, choose "LTS").

1. Unzip the project and open the `draftroom` folder in VS Code.
2. Open the terminal in VS Code (**Ctrl + `**) and run:

```
npm install
```

3. Create your secret settings file. In the same terminal:

```
copy .env.example .env.local
```

4. Get a **free** Gemini key at https://aistudio.google.com/apikey (sign in with
   Google, click **Create API key**). Open `.env.local` in VS Code and replace
   `your_gemini_api_key_here` with your key. Save the file.
5. Start the app:

```
npm run dev
```

6. Open http://localhost:3000 in your browser.

After you change `.env.local`, stop the app (Ctrl + C) and run `npm run dev` again.

Other commands:

```
npm run typecheck   # checks the TypeScript types
npm run lint        # checks code style
npm run build       # makes the production build
npm start           # runs the production build (after npm run build)
```

## 2. How to test it

1. Dashboard: you see three cards. Click one.
2. Press **Generate Draft** with an empty form. Each missing field shows a message.
3. Fill in the form and press **Generate Draft**. The button shows a spinner and
   the form is locked while the AI works (usually 5 to 40 seconds).
4. Your draft appears in the **Your draft** box. Edit it. The word and
   placeholder counters update. **Restore original draft** brings back the AI text.
5. Press **Export PDF**. A file such as `nda-acme-traders-ali-khan-2026-10-11.pdf`
   downloads. Open it: you should see a title, margins, and "Page 1 of N" at the bottom.
6. Test the errors:
   - Remove the key from `.env.local` and generate: "The drafting service isn't set up yet."
   - Put a wrong key: "...couldn't sign in to the AI provider."
   - Press Generate more than 5 times in a minute: "You're going a bit fast."
   - Switch off your internet and generate: "We couldn't reach the server."
   - Type Urdu letters in the draft and export: the PDF explains it cannot show them yet.

## 3. How it works

```
Browser (form, editor, PDF)  --JSON-->  Your server (/api/draft)  --API key-->  Gemini
        ^                                    |  validates, limits, labels          |
        +------------- draft text -----------+<----------- draft text -------------+
```

1. The browser checks the form, then sends it to **your own** `/api/draft`.
2. The server checks everything again, applies limits, builds the prompt, and
   calls Gemini with the secret key (which exists only on the server).
3. The server returns the draft. The browser shows it in an editable box.
4. **Export PDF** builds the PDF inside the browser from the current text.
   Nothing is uploaded for this step.

## 4. Files

| File | What it does |
|---|---|
| `src/app/layout.tsx` | Page shell: header, footer, legal disclaimer |
| `src/app/dashboard/page.tsx` | Dashboard with the document type cards |
| `src/app/draft/[type]/page.tsx` | Page for one document type (404 for unknown types) |
| `src/app/api/draft/route.ts` | **The secure server endpoint.** Rate limit, size limit, validation, calls Gemini, friendly errors |
| `src/components/DraftWorkspace.tsx` | Holds the state: the AI draft and the current edited text |
| `src/components/DraftForm.tsx` | The form, validation messages, loading state, request errors |
| `src/components/DraftEditor.tsx` | Editable text box, Export PDF, Copy, Restore |
| `src/components/FormFields.tsx`, `Banner.tsx`, `Spinner.tsx`, `DocumentTypeCard.tsx`, `Disclaimer.tsx` | Small reusable UI pieces |
| `src/lib/documentTypes.ts` | The three document types as data. Add a new type here and in `schemas.ts` |
| `src/lib/schemas.ts` | Validation rules (Zod), shared by browser and server |
| `src/lib/ai/gemini.ts` | **The only file that talks to Gemini.** Reads the key from the environment |
| `src/lib/ai/prompts.ts` | The AI instructions: placeholders, no invented laws, treat input as data |
| `src/lib/ai/mapError.ts` | Turns Gemini errors into friendly error codes |
| `src/lib/errors.ts` | All error codes and their plain-language messages |
| `src/lib/config.ts` | Limits: body size, requests per minute, model default, timeouts |
| `src/lib/rateLimit.ts`, `src/lib/http/*` | Rate limiter, safe body reader, client IP |
| `src/lib/draftText.ts` | Draft label, Markdown clean-up, placeholder counter |
| `src/lib/client/requestDraft.ts` | The browser's call to `/api/draft`, with timeout and error handling |
| `src/lib/pdf/LegalPdfDocument.tsx` | The PDF layout (A4, 1 inch margins, Times 11 pt, page numbers) |
| `src/lib/pdf/parseDocument.ts` | Turns the text into title, headings and paragraphs |
| `src/lib/pdf/pdfText.ts`, `filename.ts`, `exportPdf.tsx` | Character check, file name, download |
| `.env.example` | Template for your settings. Copy to `.env.local` |
| `.gitignore` | Keeps `.env.local` (your key) out of Git |

## 5. Packages and why

| Package | Why |
|---|---|
| `next`, `react`, `react-dom` | The framework (App Router) |
| `typescript`, `@types/*` | Type checking |
| `tailwindcss`, `@tailwindcss/postcss` | Styling |
| `@google/genai` | Google's official Gemini SDK (server only) |
| `zod` | Validation with clear messages, used in browser and server |
| `@react-pdf/renderer` | Builds a real text PDF in the browser |
| `server-only` | Makes the build fail if browser code ever imports the Gemini file |
| `eslint`, `eslint-config-next`, `@eslint/eslintrc` | Code checks |

## 6. Security, privacy, and legal notes

- **The API key never reaches the browser.** It is read from `GEMINI_API_KEY` in
  `src/lib/ai/gemini.ts` only. Never rename it to start with `NEXT_PUBLIC_`.
  `.env.local` is in `.gitignore`. Only `.env.example` (fake values) is meant to be shared.
- **Validation happens twice**: in the browser (fast feedback) and on the server
  (the one that counts). The server rejects bad types, missing fields, and
  oversized input (32 KB body limit, per-field limits).
- **Rate limit:** 5 drafts per minute per IP, kept in memory. It resets when the
  server restarts and is only approximate on serverless hosts. Use a shared
  store (for example Redis) before a real launch.
- **Prompt injection:** user text is sent as JSON data, and the instructions say
  to treat it as data only. This reduces the risk but cannot remove it.
- **Nothing is stored.** The draft lives only in the browser tab. Logs contain
  error codes only, never form data, drafts, or the key.
- **Free Gemini tier privacy:** Google's pricing page says content sent on the
  free tier may be used to improve Google's products. Do not enter confidential
  or personal information (use placeholders). The paid tier does not do this.
  Check Google's current terms before real users use the app.
- **Legal limits:** the AI is told not to cite laws or invent legal requirements,
  but it can still be wrong. Output is a draft for a lawyer to review, not legal
  advice. Before charging money or going public, get advice from a lawyer in
  your market and add a Terms of Service and a Privacy Policy.
- **PDF fonts:** the PDF uses built-in Times, which shows English and Western
  European letters. Urdu script, Arabic, Chinese and emoji are not supported yet,
  so the app asks the user to replace them before exporting. Roman Urdu is fine.

## 7. Troubleshooting

| Problem | What to do |
|---|---|
| "The drafting service isn't set up yet" | `.env.local` is missing or the key is empty. Restart `npm run dev` after editing it |
| "couldn't sign in to the AI provider" | The key is wrong or was revoked. Create a new one in Google AI Studio |
| "selected AI model isn't available" | Google renamed the model. Check https://ai.google.dev/gemini-api/docs/models and set `GEMINI_MODEL` in `.env.local` |
| "busy or the free usage limit was reached" | Free tier limits. Wait a minute, or try a lighter model such as `gemini-3.5-flash-lite` |
| "isn't available from this server's location" | Gemini is not offered from the server's region. Deploy to another region |
| `npm install` fails on a package version | Run `npm install @google/genai @react-pdf/renderer server-only zod` to fetch the latest versions |
| Blank draft or half a draft | The AI hit its length limit. Generate again |

## 8. MVP vs. later

**Included now:** dashboard, three document types, validated form, secure Gemini
route, loading and error states, editable preview, PDF export, disclaimers,
basic rate limiting.

**Later (not built):** user accounts, saved drafts and history (needs a
database), subscriptions and payments, more document types, Urdu/RTL PDF
support, server-side PDF, e-signatures, analytics.

## 9. Deploying (when you are ready)

Vercel or Netlify both work. Add `GEMINI_API_KEY` (and optionally
`GEMINI_MODEL`) in the host's **Environment Variables** settings. Never put the
key in the code or in Git.
