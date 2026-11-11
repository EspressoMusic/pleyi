// Lists short-lesson slides that are text only (a title and lines, with no
// example, drawing, math card or chips). Such a slide shows as a mostly empty
// card, so every slide needs at least one of the parts in VISUAL.
// Run: node scripts/check-lessons.js   (exit code 1 when any are found)
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const FILES = ["public/js/subject-lessons.js", "public/js/english-lessons.js"];
const VISUAL = [
  "fig", "examples", "math", "table", "grid", "steps", "check", "compare", "verdicts",
  "proof", "points", "chips", "result", "pictures", "items", "body", "video",
];

const ctx = { window: {} };
vm.createContext(ctx);
for (const file of FILES) vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), ctx);

let found = 0;
for (const list of [ctx.window.SUBJECT_SHORT_LESSONS, ctx.window.ENGLISH_SHORT_LESSONS]) {
  for (const lesson of list || []) {
    (lesson.slides || []).forEach((slide, i) => {
      if (VISUAL.some((key) => slide[key] != null)) return;
      found++;
      console.log(`${lesson.id}  slide ${i + 1}  ${slide.title}  | ${(slide.lines || []).join(" / ")}`);
    });
  }
}
console.log(found ? `\n${found} text-only slides` : "No text-only slides");
process.exitCode = found ? 1 : 0;
