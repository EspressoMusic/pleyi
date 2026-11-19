/* Builds public/js/road-city.js (window.RoadCity) from scripts/road-city/entry.ts
   and the PAT game's drawing code, with the esbuild that comes with PAT.

   Run after changing entry.ts or PAT's art: node scripts/build-road-city.js
   Then bump road-city.js's ?v= in public/road-safety.html. */

const { execFileSync } = require("child_process");
const path = require("path");

const PAT = path.join(__dirname, "..", "..", "..", "PAT");
const esbuild = path.join(PAT, "node_modules", "@esbuild", "win32-x64", "esbuild.exe");

execFileSync(
  esbuild,
  [
    path.join(__dirname, "road-city", "entry.ts"),
    "--bundle",
    "--format=iife",
    "--minify",
    "--target=es2020",
    "--legal-comments=none",
    `--outfile=${path.join(__dirname, "..", "public", "js", "road-city.js")}`,
  ],
  { stdio: "inherit" }
);
