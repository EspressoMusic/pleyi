/* Shared helper: extract plain text from an uploaded lesson-material file. */
(function () {
  const PLAIN_TEXT_EXTS = [".txt", ".csv", ".md"];
  const SERVER_EXTS = [".pdf", ".docx"];
  const MAX_SIZE = 8 * 1024 * 1024;

  function extOf(name) {
    const i = String(name || "").lastIndexOf(".");
    return i >= 0 ? String(name).slice(i).toLowerCase() : "";
  }

  async function extractMaterialText(file) {
    if (!file) throw new Error("לא נבחר קובץ");
    const ext = extOf(file.name);

    if (PLAIN_TEXT_EXTS.includes(ext)) {
      if (file.size > 1024 * 1024) {
        throw new Error("הקובץ גדול מדי (מקסימום 1MB)");
      }
      return await file.text();
    }

    if (SERVER_EXTS.includes(ext)) {
      if (file.size > MAX_SIZE) {
        throw new Error("הקובץ גדול מדי (מקסימום 8MB)");
      }
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "לא ניתן לחלץ טקסט מהקובץ");
      }
      return data.text;
    }

    throw new Error("סוג קובץ לא נתמך — השתמשו ב-.txt, .csv, .md, .pdf או .docx");
  }

  window.extractMaterialText = extractMaterialText;
})();
