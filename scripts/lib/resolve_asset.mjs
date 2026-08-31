import fs from "node:fs";
import path from "node:path";

const IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)/;
const SIZED_IMAGE_RE = /!\[width:(\d+)px\]\(([^)]+)\)/;

export function parseImageMarkdown(line) {
  const sized = line.match(SIZED_IMAGE_RE);
  if (sized) {
    return { alt: "", path: sized[2].trim(), widthPx: Number(sized[1]) };
  }
  const plain = line.match(IMAGE_RE);
  if (plain) {
    return { alt: plain[1].trim(), path: plain[2].trim(), widthPx: null };
  }
  return null;
}

export function resolveAssetPath(assetPath, deckDir, skillRoot) {
  const candidates = [
    path.resolve(deckDir, assetPath),
    path.resolve(skillRoot, assetPath),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}
