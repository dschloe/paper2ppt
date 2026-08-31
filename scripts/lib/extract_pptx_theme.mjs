import fs from "node:fs";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true,
});

/** Extract pptx.json-compatible theme from a .pptx file. */
export async function extractPptxTheme(pptxPath) {
  const zip = await JSZip.loadAsync(fs.readFileSync(pptxPath));
  const themeFile = Object.keys(zip.files).find(
    (f) => f.match(/ppt\/theme\/theme\d+\.xml$/)
  );
  if (!themeFile) return defaultTheme();

  const xml = await zip.files[themeFile].async("string");
  const doc = parser.parse(xml);
  const scheme = doc?.theme?.themeElements?.clrScheme;
  const fonts = doc?.theme?.themeElements?.fontScheme;

  const color = (key) => hexFromClr(scheme?.[key]?.srgbClr || scheme?.[key]?.sysClr);

  const minor = fonts?.font?.find?.((f) => f["@_script"] === "Latn")?.typeface
    || fonts?.minorFont?.latin?.["@_typeface"]
    || "Helvetica Neue";
  const major = fonts?.majorFont?.latin?.["@_typeface"] || minor;

  return {
    fontFace: major,
    titleColor: color("dk1") || "0F172A",
    subtitleColor: color("dk2") || "475569",
    bodyColor: color("dk1") || "1A1A1A",
    accentColor: color("accent1") || "2563EB",
    slideBackground: color("lt1") || "FFFFFF",
    leadBackground: color("dk2") || undefined,
    titleSize: 28,
    leadTitleSize: 36,
    subtitleSize: 18,
    bodySize: 16,
    tableFontSize: 13,
    tableHeaderFill: color("accent1") || "2563EB",
    tableHeaderColor: color("lt1") || "FFFFFF",
    titleBar: false,
    _extractedFrom: pptxPath,
  };
}

function hexFromClr(node) {
  if (!node) return null;
  if (node.srgbClr) {
    const val = node.srgbClr["@_val"];
    return val ? val.replace("#", "").toUpperCase() : null;
  }
  if (node.sysClr) {
    const last = node.sysClr["@_lastClr"];
    if (last) return last.replace("#", "").toUpperCase();
    const sysMap = {
      windowText: "000000",
      window: "FFFFFF",
      highlight: "0000FF",
      btnFace: "F0F0F0",
    };
    return sysMap[node.sysClr["@_val"]] || null;
  }
  return null;
}

function defaultTheme() {
  return {
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
    titleBar: false,
  };
}
