#!/usr/bin/env node
/** Generate a starter 4-slide layout template.pptx for templates/_example */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fillPptxGenjs } from "./lib/fill_pptx_genjs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "../templates/_example/template.pptx");

const theme = {
  fontFace: "Helvetica Neue",
  titleColor: "0F172A",
  subtitleColor: "475569",
  bodyColor: "1A1A1A",
  accentColor: "2563EB",
  titleSize: 28,
  leadTitleSize: 36,
  subtitleSize: 18,
  bodySize: 16,
  tableFontSize: 13,
  tableHeaderFill: "2563EB",
  tableHeaderColor: "FFFFFF",
};

const slides = [
  {
    isLead: true,
    title: "{{TITLE}}",
    subtitle: "{{AUTHORS}} · {{VENUE}}",
    bullets: ["{{HOOK}}"],
    table: null,
    twoColumn: false,
    left: [],
    right: [],
  },
  {
    isLead: false,
    title: "{{SECTION}}",
    subtitle: "",
    bullets: ["{{BULLET_1}}", "{{BULLET_2}}", "{{BULLET_3}}"],
    table: null,
    twoColumn: false,
    left: [],
    right: [],
  },
  {
    isLead: false,
    title: "Key Results",
    subtitle: "",
    bullets: [],
    table: [
      ["Method", "Score", "Note"],
      ["Baseline", "0.00", "example"],
      ["Ours", "0.00", "example"],
    ],
    twoColumn: false,
    left: [],
    right: [],
  },
  {
    isLead: false,
    title: "{{LEFT_TITLE}}",
    subtitle: "",
    bullets: [],
    twoColumn: true,
    left: ["{{LEFT_1}}", "{{LEFT_2}}"],
    right: ["{{RIGHT_1}}", "{{RIGHT_2}}"],
    table: null,
  },
];

await fillPptxGenjs({ slides, theme, outputPath: out });
console.log(`Created ${out}`);
