---
name: paper-to-slides
description: >
  Convert an academic paper (PDF upload or arXiv/DOI/URL link) into an editable PowerPoint
  deck using the user's PPTX template. Use when the user wants paper-to-slides, paper-to-ppt,
  or says "이 논문 PPT로 요약해줘", "summarize this paper as slides", "논문 발표자료 만들어줘",
  "논문 리뷰용 슬라이드", or provides template.pptx plus a paper. Works in Korean or English.
  Trigger even if they do not say PowerPoint. Do NOT use for non-paper slide decks.
compatibility:
  - "Node.js — run npm install once in the skill root"
---

# Paper → Editable PPTX

**Two inputs:** (1) `template.pptx` (slide format) + (2) a paper (PDF path, upload, or link).  
**Two outputs:** `deck.md` + `deck-editable.pptx` (native, editable PowerPoint).

Read the paper in Cursor. Write slide content. Render with the template's colors/fonts.

## Quick workflow

```
User: [template.pptx] + [paper.pdf]  "이 논문 슬라이드로 만들어줘"
  → import template (if new)
  → read paper
  → write deck.md
  → build deck-editable.pptx
```

## 1. Template

| Situation | Action |
|-----------|--------|
| User attached `template.pptx` | `node scripts/import_pptx_template.mjs <path> --name <id>` → creates `templates/<id>/` |
| User names built-in (`academic`, `seminar`) | Use `templates/<id>/` |
| `.paper2slides` has `template: <id>` | Use that id |
| Nothing specified | Default: `academic` |

Import copies the pptx and extracts colors/fonts into `pptx.json`. Read `templates/<id>/template.yaml` for slide structure.

Custom template setup (tell user once):

```bash
node scripts/import_pptx_template.mjs ~/my-deck.pptx --name my-style
```

## 2. Paper

- Local PDF → read in Cursor
- arXiv / open URL → fetch PDF
- Paywalled → ask user to upload

Extract: title, authors, venue, problem, method, how it works, results (real numbers only), limitations, takeaway.

## 3. Write `deck.md`

Follow `structure.chapters` in `template.yaml` (default 7 slides):

1. Title · 2. Problem · 3. Method · 4. How it works · 5. Results · 6. Limitations · 7. Takeaway

Rules:
- Short bullets (see `max_items` / `max_words_per_item` in template.yaml)
- **Tables** for headline numbers — reproduce key comparison tables from the paper; never invent statistics
- **Figures** — extract images from the PDF when possible (see below); use `figure`, `image-table`, or two-column layouts
- If a figure cannot be extracted, reference it: `*출처: 논문 Figure N*` — never fabricate diagram content
- **In-text citations:** cite sources for claims, theories, and prior findings — `(Author, Year)` or `Author (Year)`; use the paper's reference list; **presenting authors: full names** (e.g. `Anum Afzal, Alexander Kowsik, Rajna Fani, & Florian Matthes, 2024` — not `Afzal et al.`); cited works: first author's full name + `et al.` when 3+ authors (e.g. `Patrick Lewis et al., 2021`); add a short **References** block on the final slide when space allows
- **Language:** match user request (Korean or English); keep model/benchmark names original

Save to e.g. `samples/runs/<paper-name>/deck.md` with an `assets/` subfolder for images.

### Figures and tables

1. **Extract images** (when poppler is installed: `brew install poppler`):
   ```bash
   scripts/extract_pdf_figures.sh <paper.pdf> samples/runs/<name>/assets/
   ```
   Or save/crop figures manually into `assets/fig-001.png`, etc.

2. **Pick layouts** in `deck.md` (see `references/marp-syntax.md`):
   - `table` — markdown `| col | col |` only
   - `<!-- layout: figure -->` — image + caption
   - `<!-- layout: image-table -->` — table left, image right
   - two-column HTML — bullets left, `![width:400px](assets/...)` right

3. **Use paper tables** on results slides; **use figures** for architecture/pipeline slides (Figure 1–3 typically).

## 4. Render

```bash
scripts/build_deck.sh <deck.md> <output/deck> --template <id> --editable-pptx
```

Produces `output/deck-editable.pptx`. HTML preview (`deck.html`) is included automatically.

## 5. Deliver

Give the user `deck-editable.pptx`. Mention template id, slide count, language. Do not paste full slide text in chat.

## Edge cases

- Scanned PDF → warn, ask to proceed
- Multiple papers → ask which one
- User edits in PowerPoint later → edit `deck.md` and re-render, or edit the pptx directly (text is native)

## References

- `references/quickstart.md` — user-facing 3-step guide
- `references/template-system.md` — template file contract
- `references/marp-syntax.md` — deck.md syntax
