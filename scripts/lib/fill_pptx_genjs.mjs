import fs from "node:fs";
import path from "node:path";
import pptxgen from "pptxgenjs";
import { resolveAssetPath } from "./resolve_asset.mjs";

function titleFont(theme) {
  return theme.titleFontFace || theme.fontFace;
}

function bodyFont(theme) {
  return theme.bodyFontFace || theme.fontFace;
}

/** Approximate rendered text height in inches for pptxgenjs layout. */
function estimateTextHeight(text, fontSizePt, charsPerLine) {
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  const lineH = (fontSizePt / 72) * 1.18;
  return lines * lineH;
}

export async function fillPptxGenjs({ slides, theme, outputPath, deckDir = ".", skillRoot = "." }) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  pptx.author = "paper-to-slides";

  for (const slide of slides) {
    addSlide(pptx, slide, theme, deckDir, skillRoot);
  }

  await pptx.writeFile({ fileName: outputPath });
}

function addSlide(pptx, slide, theme, deckDir, skillRoot) {
  const s = pptx.addSlide();
  const bg = slide.isLead ? theme.leadBackground : theme.slideBackground;
  if (bg) s.background = { color: bg };

  const bodyColor = slide.isLead ? "F8FAFC" : theme.bodyColor;
  const contentY = addTitleBlock(s, pptx, slide, theme);

  if (slide.twoColumn) {
    if (slide.leftImage || slide.rightImage) {
      addImageBulletsColumn(s, slide.left, slide.leftImage, theme, bodyColor, deckDir, skillRoot, 0.5, contentY, 4.2);
      addImageBulletsColumn(s, slide.right, slide.rightImage, theme, bodyColor, deckDir, skillRoot, 5.0, contentY, 4.2);
    } else {
      addBullets(s, slide.left, theme, bodyColor, 0.5, contentY, 4.2);
      addBullets(s, slide.right, theme, bodyColor, 5.0, contentY, 4.2);
    }
    if (slide.caption) addCaption(s, slide.caption, theme, bodyColor, contentY);
  } else if (slide.layout === "image-table" && slide.image && slide.table) {
    addTable(s, slide.table, theme, bodyColor, 0.5, contentY, 4.8);
    addImage(s, slide.image, deckDir, skillRoot, 5.5, contentY, 4.0, 3.8);
    if (slide.caption) addCaption(s, slide.caption, theme, bodyColor, contentY + 3.9);
  } else if (slide.image && slide.layout === "figure") {
    addImage(s, slide.image, deckDir, skillRoot, 1.0, contentY, 8.0, 3.6);
    if (slide.caption) addCaption(s, slide.caption, theme, bodyColor, contentY + 3.7);
    if (slide.bullets.length) {
      addBullets(s, slide.bullets, theme, bodyColor, 0.5, contentY + 4.0, 9);
    }
  } else if (slide.table) {
    addTable(s, slide.table, theme, bodyColor, 0.5, contentY, 9);
  } else if (slide.bullets.length && !slide.isLead) {
    addBullets(s, slide.bullets, theme, bodyColor, 0.5, contentY, 9);
  }

  if (slide.footer) addFooter(s, slide.footer, theme, slide.isLead);
}

function addTitleBlock(s, pptx, slide, theme) {
  if (theme.titleBar && !slide.isLead) {
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: 1.1,
      fill: { color: theme.accentColor },
    });
    s.addText(slide.title, {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.8,
      fontFace: titleFont(theme),
      fontSize: theme.titleSize,
      bold: false,
      color: theme.titleColor,
      valign: "middle",
    });
    return 1.35;
  }

  if (slide.isLead) {
    const titleY = 1.55;
    const leadFontSize = theme.leadTitleSize || 36;
    const leadTitleH = estimateTextHeight(slide.title, leadFontSize, 42);
    s.addText(slide.title, {
      x: 0.5,
      y: titleY,
      w: 9,
      h: leadTitleH,
      fontFace: titleFont(theme),
      fontSize: leadFontSize,
      bold: false,
      color: theme.titleColor,
      valign: "top",
    });

    let y = titleY + leadTitleH + 0.55;
    if (slide.subtitle) {
      s.addText(slide.subtitle, {
        x: 0.5,
        y,
        w: 9,
        h: 0.45,
        fontFace: bodyFont(theme),
        fontSize: theme.subtitleSize,
        color: theme.subtitleColor,
        valign: "top",
      });
      y += 0.5;
    }
    for (const line of slide.bullets || []) {
      s.addText(line, {
        x: 0.5,
        y,
        w: 9,
        h: 0.35,
        fontFace: bodyFont(theme),
        fontSize: (theme.subtitleSize || 18) - 1,
        color: theme.subtitleColor,
        valign: "top",
      });
      y += 0.38;
    }
    return y;
  }

  const titleY = 0.45;
  const titleFontSize = theme.titleSize || 28;
  const titleH = estimateTextHeight(slide.title, titleFontSize, 48);
  s.addText(slide.title, {
    x: 0.5,
    y: titleY,
    w: 9,
    h: titleH,
    fontFace: titleFont(theme),
    fontSize: titleFontSize,
    bold: false,
    color: theme.titleColor,
    valign: "top",
  });

  if (!theme.titleBar) {
    const barY = titleY + titleH + 0.04;
    s.addShape(pptx.ShapeType.rect, {
      x: 0.5,
      y: barY,
      w: 9,
      h: 0.05,
      fill: { color: theme.accentColor },
    });
    return barY + 0.17;
  }

  return titleY + titleH + 0.2;
}

function addTable(s, table, theme, bodyColor, x, y, w) {
  const header = table[0];
  const body = table.slice(1);
  s.addTable(
    [
      header.map((cell) => ({
        text: cell,
        options: {
          fontFace: titleFont(theme),
          bold: false,
          color: theme.tableHeaderColor,
          fill: { color: theme.tableHeaderFill },
        },
      })),
      ...body.map((row) =>
        row.map((cell) => ({
          text: cell,
          options: { fontFace: bodyFont(theme), color: bodyColor },
        }))
      ),
    ],
    {
      x,
      y,
      w,
      fontFace: bodyFont(theme),
      fontSize: theme.tableFontSize || 13,
      border: { pt: 0.5, color: "E2E8F0" },
      valign: "middle",
    }
  );
}

function addImage(s, image, deckDir, skillRoot, x, y, w, h) {
  const resolved = resolveAssetPath(image.path, deckDir, skillRoot);
  if (!resolved) {
    s.addText(`[이미지 없음: ${image.path}]`, {
      x,
      y,
      w,
      h,
      fontFace: "Helvetica Neue",
      fontSize: 14,
      color: "94A3B8",
      italic: true,
    });
    return;
  }
  const opts = { path: resolved, x, y, w, h };
  if (image.widthPx) {
    opts.w = image.widthPx / 96;
    opts.h = h;
  }
  s.addImage(opts);
}

function addFooter(s, text, theme, isLead) {
  s.addText(text, {
    x: 0.5,
    y: 5.15,
    w: 9,
    h: 0.3,
    fontFace: bodyFont(theme),
    fontSize: 11,
    color: isLead ? (theme.subtitleColor || "64748B") : theme.subtitleColor || "94A3B8",
    valign: "bottom",
  });
}

function addCaption(s, text, theme, color, y) {
  s.addText(text, {
    x: 0.5,
    y,
    w: 9,
    h: 0.35,
    fontFace: bodyFont(theme),
    fontSize: (theme.bodySize || 16) - 2,
    color: color || theme.subtitleColor,
    italic: true,
  });
}

function addImageBulletsColumn(s, bullets, image, theme, color, deckDir, skillRoot, x, y, w) {
  if (image) {
    addImage(s, image, deckDir, skillRoot, x, y, w, 2.2);
    if (bullets.length) addBullets(s, bullets, theme, color, x, y + 2.35, w);
  } else if (bullets.length) {
    addBullets(s, bullets, theme, color, x, y, w);
  }
}

function addBullets(slide, items, theme, color, x, y, w) {
  if (!items.length) return;
  slide.addText(
    items.map((b) => ({
      text: b,
      options: {
        fontFace: bodyFont(theme),
        fontSize: theme.bodySize,
        color,
        bullet: { code: "2022" },
        paraSpaceAfter: 8,
      },
    })),
    { x, y, w, h: 5.2 - y, valign: "top" }
  );
}
