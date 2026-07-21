/* Extract plain text from uploaded lesson material files (txt/csv/md/pdf/docx) */

const path = require("path");

const PLAIN_TEXT_EXTS = new Set([".txt", ".csv", ".md"]);
const MAX_EXTRACTED_LENGTH = 100000;

// Some malformed/scanned PDFs make the (old) pdf-parse engine spit out raw,
// undecoded PDF stream bytes instead of throwing — catch that before it
// reaches the user as "extracted text".
const PDF_STRUCTURE_RE = /\b(endobj|endstream|xref|trailer|startxref)\b|\/(FlateDecode|Filter|Length)\b/g;

function isGarbledPdfText(text) {
  const sample = String(text || "").slice(0, 5000);
  if (!sample) return false;
  if ((sample.match(PDF_STRUCTURE_RE) || []).length >= 3) return true;

  let nonPrintable = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (code === 9 || code === 10 || code === 13) continue;
    if (code < 32 || code === 127) nonPrintable++;
  }
  return nonPrintable / sample.length > 0.05;
}

async function extractText({ buffer, originalname }) {
  const ext = path.extname(String(originalname || "")).toLowerCase();

  let text;
  if (ext === ".pdf") {
    const pdfParse = require("pdf-parse");
    let data;
    try {
      data = await pdfParse(buffer);
    } catch (e) {
      throw new Error("לא ניתן לחלץ טקסט מה-PDF — ייתכן שהקובץ מוצפן או פגום. נסו קובץ אחר או הדביקו את התוכן ידנית");
    }
    text = data.text;
    if (isGarbledPdfText(text)) {
      throw new Error("ה-PDF כנראה סרוק (תמונה) או בפורמט לא נתמך, ולא ניתן לחלץ ממנו טקסט. נסו קובץ אחר, המירו אותו ל-Word/טקסט, או הדביקו את התוכן ידנית");
    }
  } else if (ext === ".docx") {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (PLAIN_TEXT_EXTS.has(ext)) {
    text = buffer.toString("utf8");
  } else if (ext === ".doc") {
    throw new Error("קבצי .doc ישנים אינם נתמכים — שמרו כ-.docx ונסו שוב");
  } else {
    throw new Error("סוג קובץ לא נתמך — השתמשו ב-.txt, .csv, .md, .pdf או .docx");
  }

  text = String(text || "").trim();
  if (!text) {
    throw new Error("לא נמצא טקסט בקובץ");
  }

  return text.slice(0, MAX_EXTRACTED_LENGTH);
}

module.exports = { extractText };
