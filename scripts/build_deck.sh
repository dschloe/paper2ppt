#!/usr/bin/env bash
# Render a Marp markdown deck to HTML (always) and PPTX (optional).
#
# Usage:
#   ./build_deck.sh <deck.md> <output-basename> [--template <id>] [--pptx] [--editable-pptx]
#
# Requires: Node.js + @marp-team/marp-cli
#   npm install -g @marp-team/marp-cli
#
# Note on PPTX export: Marp's --pptx flag renders each slide via headless
# Chromium and embeds the result as an image inside a real .pptx container.
# It opens fine in PowerPoint/Keynote/Google Slides, but text is NOT
# individually editable — treat it as "PPTX-shaped HTML", not a native deck.

set -euo pipefail

DECK_MD="${1:?Usage: build_deck.sh <deck.md> <output-basename> [--template <id>] [--pptx]}"
OUT_BASE="${2:?Usage: build_deck.sh <deck.md> <output-basename> [--template <id>] [--pptx]}"
shift 2

TEMPLATE_ID="academic"
WANT_PPTX=""
WANT_EDITABLE_PPTX=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --template)
      TEMPLATE_ID="${2:?--template requires an id (e.g. academic, seminar)}"
      shift 2
      ;;
    --pptx)
      WANT_PPTX="--pptx"
      shift
      ;;
    --editable-pptx)
      WANT_EDITABLE_PPTX="--editable-pptx"
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="${SCRIPT_DIR}/.."
THEME="${SKILL_ROOT}/templates/${TEMPLATE_ID}/theme.css"

if [[ ! -f "$THEME" ]]; then
  echo "Template not found: ${TEMPLATE_ID}" >&2
  echo "Available templates:" >&2
  for d in "${SKILL_ROOT}"/templates/*/; do
    base="$(basename "$d")"
    [[ "$base" == _* ]] && continue
    echo "  - ${base}" >&2
  done
  exit 1
fi

if ! command -v marp &> /dev/null; then
  echo "marp-cli not found. Install it with: npm install -g @marp-team/marp-cli" >&2
  exit 1
fi

DECK_DIR="$(cd "$(dirname "$DECK_MD")" && pwd)"
mkdir -p "$(dirname "${OUT_BASE}.html")"
OUT_DIR="$(cd "$(dirname "${OUT_BASE}.html")" && pwd)"

sync_deck_assets() {
  local assets_src="${DECK_DIR}/assets"
  local assets_dst="${OUT_DIR}/assets"
  if [[ -d "$assets_src" ]]; then
    rm -rf "$assets_dst"
    cp -R "$assets_src" "$assets_dst"
    echo "  -> ${assets_dst}/ (images for HTML preview)"
  fi
}

echo "Rendering HTML (template: ${TEMPLATE_ID})..."
marp "$DECK_MD" --theme "$THEME" --html --allow-local-files -o "${OUT_BASE}.html"
echo "  -> ${OUT_BASE}.html"
sync_deck_assets

if [[ "$WANT_PPTX" == "--pptx" ]]; then
  echo "Rendering PPTX (image-based slides inside a .pptx container)..."
  marp "$DECK_MD" --theme "$THEME" --pptx --allow-local-files -o "${OUT_BASE}.pptx"
  echo "  -> ${OUT_BASE}.pptx"
fi

if [[ "$WANT_EDITABLE_PPTX" == "--editable-pptx" ]]; then
  if [[ ! -d "${SKILL_ROOT}/node_modules/pptxgenjs" ]]; then
    echo "Installing dependencies (npm install)..." >&2
    (cd "$SKILL_ROOT" && npm install --silent)
  fi
  echo "Rendering editable PPTX (native text boxes)..."
  node "${SCRIPT_DIR}/build_editable_pptx.mjs" "$DECK_MD" "${OUT_BASE}-editable.pptx" --template "$TEMPLATE_ID"
fi
