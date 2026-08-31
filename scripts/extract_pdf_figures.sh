#!/usr/bin/env bash
# Extract embedded images from a PDF into a run assets folder.
#
# Usage:
#   ./extract_pdf_figures.sh <paper.pdf> <output-dir>
#
# Requires poppler (macOS: brew install poppler)
# Output: output-dir/fig-000.png, fig-001.png, ...

set -euo pipefail

PDF="${1:?Usage: extract_pdf_figures.sh <paper.pdf> <output-dir>}"
OUT_DIR="${2:?Usage: extract_pdf_figures.sh <paper.pdf> <output-dir>}"

if ! command -v pdfimages &>/dev/null; then
  echo "pdfimages not found. Install poppler:" >&2
  echo "  brew install poppler" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
pdfimages -png "$PDF" "$OUT_DIR/fig"
count=$(ls -1 "$OUT_DIR"/fig-*.png 2>/dev/null | wc -l | tr -d ' ')
echo "Extracted $count images to $OUT_DIR/"
ls -1 "$OUT_DIR"/fig-*.png 2>/dev/null || true
