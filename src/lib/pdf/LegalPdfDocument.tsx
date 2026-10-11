import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDF_FOOTER_TEXT } from "@/lib/draftText";
import { parseDocument } from "./parseDocument";
import { normalizeForPdf } from "./pdfText";

/**
 * The PDF layout. A4 page, 1 inch (72 pt) margins, Times 11 pt with generous
 * line spacing, and "Page X of Y" in the footer of every page.
 * Times-Roman / Times-Bold are built-in PDF fonts, so nothing is downloaded.
 */
const styles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 84,
    paddingHorizontal: 72,
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#111111",
  },
  label: {
    borderWidth: 1,
    borderColor: "#999999",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 18,
    fontFamily: "Helvetica",
    fontSize: 8,
    lineHeight: 1.3,
    textAlign: "center",
    color: "#444444",
  },
  title: {
    fontFamily: "Times-Bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  heading: {
    fontFamily: "Times-Bold",
    fontSize: 11.5,
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    left: 72,
    right: 72,
    bottom: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#666666",
  },
});

interface LegalPdfDocumentProps {
  /** The current (edited) document text. */
  text: string;
  /** Used as the title if the text does not start with a title line. */
  fallbackTitle: string;
}

export default function LegalPdfDocument({
  text,
  fallbackTitle,
}: LegalPdfDocumentProps) {
  const blocks = parseDocument(normalizeForPdf(text), fallbackTitle);
  const titleBlock = blocks.find((block) => block.kind === "title");
  const documentTitle = titleBlock && titleBlock.kind === "title" ? titleBlock.text : fallbackTitle;

  return (
    <Document
      title={documentTitle}
      subject="AI-generated draft - not legal advice"
      creator="Draftroom"
    >
      <Page size="A4" style={styles.page}>
        {blocks.map((block, index) => {
          switch (block.kind) {
            case "label":
              return (
                <Text key={index} style={styles.label}>
                  {block.text}
                </Text>
              );
            case "title":
              return (
                <Text key={index} style={styles.title}>
                  {block.text}
                </Text>
              );
            case "heading":
              return (
                <Text key={index} style={styles.heading}>
                  {block.text}
                </Text>
              );
            default:
              return (
                <View key={index} style={styles.paragraph}>
                  {block.lines.map((line, lineIndex) => (
                    <Text key={lineIndex}>{line}</Text>
                  ))}
                </View>
              );
          }
        })}

        <View style={styles.footer} fixed>
          <Text>{PDF_FOOTER_TEXT}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
