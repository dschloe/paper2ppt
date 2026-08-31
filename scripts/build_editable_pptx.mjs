#!/usr/bin/env node
/**
 * Build native editable PPTX from deck.md + template.
 *
 * Usage:
 *   node build_editable_pptx.mjs <deck.md> <output.pptx> [--template <id>]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDeck } from "./lib/parse_deck.mjs";
import { fillPptxGenjs } from "./lib/fill_pptx_genjs.mjs";
import { extractPptxTheme } from "./lib/extract_pptx_theme.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.join(__dirname, "..");

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node build_editable_pptx.mjs <deck.md> <output.pptx> [--template <id>]");
  process.exit(1);
}

const deckPath = path.resolve(args[0]);
const outPath = path.resolve(args[1]);
let templateId = "academic";

for (let i = 2; i < args.length; i++) {
  if (args[i] === "--template") templateId = args[++i];
}

const templateDir = path.join(SKILL_ROOT, "templates", templateId);
const pptxJsonPath = path.join(templateDir, "pptx.json");
const templatePptx = path.join(templateDir, "template.pptx");

if (!fs.existsSync(pptxJsonPath) && !fs.existsSync(templatePptx)) {
  console.error(`Template not found: ${templateId}`);
  process.exit(1);
}

let theme;
if (fs.existsSync(pptxJsonPath)) {
  theme = JSON.parse(fs.readFileSync(pptxJsonPath, "utf8"));
}
if (fs.existsSync(templatePptx)) {
  const extracted = await extractPptxTheme(templatePptx);
  theme = { ...extracted, ...theme, ...extracted };
}

const { slides, refFooter } = parseDeck(fs.readFileSync(deckPath, "utf8"));
const deckDir = path.dirname(deckPath);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
await fillPptxGenjs({ slides, theme, refFooter, outputPath: outPath, deckDir, skillRoot: SKILL_ROOT });
console.log(`  -> ${outPath}`);
