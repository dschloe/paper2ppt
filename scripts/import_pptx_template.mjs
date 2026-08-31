#!/usr/bin/env node
/**
 * Import a user .pptx as a paper-to-slides template.
 *
 * Usage:
 *   node scripts/import_pptx_template.mjs <user.pptx> --name <template-id>
 *
 * Creates templates/<id>/ with:
 *   template.pptx  — user's format (copied)
 *   pptx.json      — colors/fonts extracted from the pptx theme
 *   template.yaml  — slide outline (from _example if missing)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractPptxTheme } from "./lib/extract_pptx_theme.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.join(__dirname, "..");

const args = process.argv.slice(2);
if (args.length < 3 || !args.includes("--name")) {
  console.error("Usage: node import_pptx_template.mjs <user.pptx> --name <template-id>");
  process.exit(1);
}

const pptxPath = path.resolve(args[0]);
const nameIdx = args.indexOf("--name");
const templateId = args[nameIdx + 1];

if (!fs.existsSync(pptxPath)) {
  console.error(`File not found: ${pptxPath}`);
  process.exit(1);
}

const destDir = path.join(SKILL_ROOT, "templates", templateId);
fs.mkdirSync(destDir, { recursive: true });

fs.copyFileSync(pptxPath, path.join(destDir, "template.pptx"));

const theme = await extractPptxTheme(pptxPath);
fs.writeFileSync(path.join(destDir, "pptx.json"), JSON.stringify(theme, null, 2) + "\n");

const yamlSrc = path.join(SKILL_ROOT, "templates", "_example", "template.yaml");
const yamlDest = path.join(destDir, "template.yaml");
if (!fs.existsSync(yamlDest)) {
  let yaml = fs.readFileSync(yamlSrc, "utf8");
  yaml = yaml.replace(/^id: .+$/m, `id: ${templateId}`);
  yaml = yaml.replace(/^name: .+$/m, `name: ${templateId}`);
  fs.writeFileSync(yamlDest, yaml);
}

console.log(`Template imported: templates/${templateId}/`);
console.log("  template.pptx  — your slide format");
console.log("  pptx.json      — extracted colors/fonts");
console.log("  template.yaml  — slide outline (edit if needed)");
console.log("");
console.log("Use in Cursor:");
console.log(`  "${templateId} 템플릿으로 이 논문 슬라이드 만들어줘"`);
