/* Extract plain text from uploaded lesson material files (txt/csv/md/pdf/docx) */

const path = require("path");

const PLAIN_TEXT_EXTS = new Set([".txt", ".csv", ".md"]);
const MAX_EXTRACTED_LENGTH = 100000;

async function extractText({ buffer, originalname }) {
  const ext = path.extname(String(originalname || "")).toLowerCase();

  let text;
  if (ext === ".pdf") {
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    text = data.text;
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
