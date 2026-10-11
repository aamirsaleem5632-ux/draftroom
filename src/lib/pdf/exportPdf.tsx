/**
 * Build the PDF in the browser from the current text and download it.
 * The PDF library is loaded only when the user clicks Export, so it does not
 * slow down the first page load. The document text never leaves the browser here.
 */
export async function exportPdf(options: {
  text: string;
  fallbackTitle: string;
  filename: string;
}): Promise<void> {
  const [{ pdf }, { default: LegalPdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./LegalPdfDocument"),
  ]);

  const blob = await pdf(
    <LegalPdfDocument text={options.text} fallbackTitle={options.fallbackTitle} />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = options.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before releasing the file.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
