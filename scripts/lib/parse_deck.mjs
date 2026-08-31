/** Parse Marp deck.md into slide objects for PPTX export. */

import { parseImageMarkdown } from "./resolve_asset.mjs";

const LAYOUT_RE = /<!--\s*layout:\s*(\S+)\s*-->/;

export function parseDeck(content) {
  let body = content.trim();
  if (body.startsWith("---")) {
    const end = body.indexOf("---", 3);
    body = body.slice(end + 3).trim();
  }
  return body
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseSlide);
}

export function parseSlide(raw) {
  const layoutMatch = raw.match(LAYOUT_RE);
  const layoutHint = layoutMatch?.[1] || null;

  const isLead = /<!--\s*_class:\s*lead\s*-->/.test(raw);
  const footer = parseFooter(raw);
  let text = raw.replace(/<!--[\s\S]*?-->/g, "");

  const twoColumn = parseTwoColumn(text);
  if (twoColumn) {
    return {
      isLead,
      layout: layoutHint || (twoColumn.rightImage || twoColumn.leftImage ? "image-bullets" : "two-column"),
      title: twoColumn.title,
      subtitle: twoColumn.subtitle,
      bullets: [],
      left: twoColumn.left,
      right: twoColumn.right,
      leftImage: twoColumn.leftImage,
      rightImage: twoColumn.rightImage,
      twoColumn: true,
      table: null,
      image: null,
      caption: twoColumn.caption,
      footer,
    };
  }

  text = text
    .replace(/<div[^>]*>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let title = "";
  let subtitle = "";
  const bullets = [];
  const tableLines = [];
  const extras = [];
  let image = null;
  let caption = "";

  for (const line of lines) {
    if (line.startsWith("# ")) {
      title = stripMd(line.slice(2));
      continue;
    }
    if (line.startsWith("## ")) {
      subtitle = stripMd(line.slice(3));
      continue;
    }
    const img = parseImageMarkdown(line);
    if (img) {
      image = img;
      continue;
    }
    if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      caption = stripMd(line.replace(/^\*+|\*+$/g, ""));
      continue;
    }
    if (line.startsWith("|")) {
      tableLines.push(line);
      continue;
    }
    if (line.startsWith("- ")) {
      bullets.push(stripMd(line.slice(2)));
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      bullets.push(stripMd(line.replace(/^\d+\.\s+/, "")));
      continue;
    }
    extras.push(stripMd(line));
  }

  const table = parseTable(tableLines);
  let layout = layoutHint;
  if (!layout) {
    if (image && table) layout = "image-table";
    else if (image) layout = "figure";
    else if (table) layout = "table";
    else layout = "bullets";
  }

  return {
    isLead,
    layout,
    title,
    subtitle,
    bullets: bullets.length ? bullets : image || table ? [] : extras,
    table,
    image,
    caption,
    twoColumn: false,
    left: [],
    right: [],
    leftImage: null,
    rightImage: null,
    footer,
  };
}

function parseFooter(raw) {
  const match = raw.match(/<!--\s*_?footer:\s*(.+?)\s*-->/i);
  if (!match) return "";
  return stripMd(stripQuotes(match[1].trim()));
}

function stripQuotes(s) {
  return s.replace(/^['"]|['"]$/g, "");
}

function parseTwoColumn(text) {
  if (!/<div[^>]*display:\s*flex/i.test(text)) return null;

  const titleMatch = text.match(/^#\s+(.+)$/m);
  const subtitleMatch = text.match(/^##\s+(.+)$/m);
  const parts = text.split(/<div[^>]*>/i).slice(1);
  const columns = parts
    .map((p) => p.replace(/<\/div>[\s\S]*/i, "").trim())
    .filter(Boolean);

  if (columns.length < 2) return null;

  const leftParsed = parseColumn(columns[0]);
  const rightParsed = parseColumn(columns[1]);

  return {
    title: titleMatch ? stripMd(titleMatch[1]) : "",
    subtitle: subtitleMatch ? stripMd(subtitleMatch[1]) : "",
    left: leftParsed.bullets,
    right: rightParsed.bullets,
    leftImage: leftParsed.image,
    rightImage: rightParsed.image,
    caption: leftParsed.caption || rightParsed.caption,
  };
}

function parseColumn(block) {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  const bullets = [];
  let image = null;
  let caption = "";

  for (const line of lines) {
    const img = parseImageMarkdown(line);
    if (img) {
      image = img;
      continue;
    }
    if (line.startsWith("*") && line.endsWith("*")) {
      caption = stripMd(line.replace(/^\*+|\*+$/g, ""));
      continue;
    }
    if (line.startsWith("- ") || /^\d+\.\s/.test(line)) {
      bullets.push(stripMd(line.replace(/^(- |\d+\.\s+)/, "")));
    }
  }
  return { bullets, image, caption };
}

function parseTable(lines) {
  if (lines.length < 2) return null;
  const rows = [];
  for (const line of lines) {
    if (/^\|[-\s|:]+\|$/.test(line.replace(/\s/g, ""))) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => stripMd(c.trim()));
    if (cells.length) rows.push(cells);
  }
  return rows.length ? rows : null;
}

function stripMd(s) {
  return s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");
}
