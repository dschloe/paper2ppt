# paper-to-slides

**Cursor skill** — PPTX template + paper PDF → editable slides.

```
template.pptx  +  paper.pdf  →  Cursor chat  →  deck-editable.pptx
```

Supports papers in English and Korean.

---

## Table of contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick start (3 steps)](#quick-start-3-steps)
- [User manual](#user-manual)
  - [1. Register a PPT template](#1-register-a-ppt-template)
  - [2. Convert in Cursor](#2-convert-in-cursor)
  - [3. Output files](#3-output-files)
  - [4. Build from the terminal](#4-build-from-the-terminal)
  - [5. Editing](#5-editing)
  - [6. Images and tables](#6-images-and-tables)
  - [7. In-text citations](#7-in-text-citations)
  - [8. Title slide & HTML preview](#8-title-slide--html-preview)
  - [9. Fonts (OS-installed)](#9-fonts-os-installed)
- [Built-in templates](#built-in-templates)
- [Create a custom template](#create-a-custom-template)
- [Output format comparison](#output-format-comparison)
- [Sample test](#sample-test)
- [Project structure](#project-structure)
- [Additional docs](#additional-docs)
- [Cursor Marketplace](#cursor-marketplace)
- [FAQ](#faq)

---

## Overview

| Input | Output |
|------|------|
| Paper PDF (or arXiv link) | `deck-editable.pptx` — **directly editable text** in PowerPoint |
| PPTX template (`template.pptx`) | `deck.md` — slide content source |
| (optional) HTML preview | `deck.html` — present in the browser |

This is not a Python app. A **Cursor agent** reads the paper and writes slides following template rules.

---

## Installation

```bash
git clone https://github.com/dschloe/paper2ppt.git
cp -r paper2ppt ~/.cursor/skills/paper-to-slides
cd ~/.cursor/skills/paper-to-slides && npm install
```

For HTML preview (optional):

```bash
npm install -g @marp-team/marp-cli
```

Restart Cursor or open a new chat — the skill is picked up automatically.

---

## Quick start (3 steps)

### ① Register a template (once)

```bash
node scripts/import_pptx_template.mjs ~/my-template.pptx --name my-style
```

Skip this if you only use built-in templates — start with `academic`.

### ② Cursor chat

```
Make a 7-slide deck from this paper using the my-style template.
```

Attach a PDF, paste a file path, or paste an arXiv link.

### ③ Check the result

The agent produces `deck-editable.pptx`. Open it in PowerPoint and edit directly.

---

## User manual

### 1. Register a PPT template

If you have a company or school PPT format, register it:

```bash
node scripts/import_pptx_template.mjs ~/Downloads/my-format.pptx --name my-style
```

Created folder:

```
templates/my-style/
├── template.pptx   # your template (copy)
├── pptx.json       # colors & fonts (auto-extracted)
└── template.yaml   # slide structure (7 slides by default)
```

Then ask in chat: `using the my-style template ...`

To pin a default template for a project, create `.paper2slides` at the repo root:

```
template: my-style
```

### 2. Convert in Cursor

**English examples**

```
Summarize this PDF as slides using the academic template.
```

```
Make a 7-slide deck from this arXiv paper: https://arxiv.org/abs/2412.xxxxx
```

**Korean paper, English slides**

```
Make slides from this Korean paper in English using the academic template.
```

The agent will:

1. Read the paper PDF
2. Write `deck.md` (title → problem → method → results → limitations → conclusion)
3. Render `deck-editable.pptx`

### 3. Output files

| File | Description |
|------|------|
| `deck-editable.pptx` | **Main output** — editable text and tables in PowerPoint / Keynote |
| `deck.md` | Slide source — edit and rebuild |
| `deck.html` | Browser presentation (auto-generated; images copied to `output/assets/`) |
| `deck.pptx` | Marp image-based PPTX (`--pptx` option; not editable) |

### 4. Build from the terminal

To render `deck.md` the agent wrote:

```bash
# Editable PPTX (recommended)
scripts/build_deck.sh path/to/deck.md path/to/output/deck \
  --template my-style --editable-pptx

# HTML only
scripts/build_deck.sh path/to/deck.md path/to/output/deck --template academic

# Marp image PPTX (not editable)
scripts/build_deck.sh path/to/deck.md path/to/output/deck --template academic --pptx
```

Output: `output/deck-editable.pptx`, `output/deck.html`, `output/assets/` (images for HTML)

### 5. Editing

| What to change | How |
|---------------|------|
| Slide **content** (wording, numbers) | Edit `deck.md`, or ask Cursor: *"Add one line to slide 3 Method"* |
| **Colors & fonts** | Edit `templates/<id>/pptx.json` (`titleFontFace` / `bodyFontFace`), `theme.css` `font-family`, or re-import the template pptx |
| **Structure** (7 → 10 slides) | Edit `chapters` in `templates/<id>/template.yaml` |
| Edit directly in PowerPoint | Open `deck-editable.pptx` (text boxes are live) |

After large content changes: edit `deck.md` → re-run `--editable-pptx`.

### 6. Images and tables

You can place **tables and figures** from the paper on slides.

**Table** — markdown table in `deck.md` (good for results slides):

```markdown
# Key Results

| Method | Accuracy |
|---|---|
| Baseline | 71.2% |
| **Ours** | **78.9%** |
```

**Image** — extract from PDF, then reference in the deck:

```bash
# requires poppler: brew install poppler
scripts/extract_pdf_figures.sh paper.pdf samples/runs/my-run/assets/
```

`deck.md` example:

```markdown
<!-- layout: figure -->
# Method Overview

![Figure 2](assets/fig-002.png)

*Source: paper Figure 2*
```

**Table + image side by side:**

```markdown
<!-- layout: image-table -->
# Experiment Results

| Method | Score |
|---|---|
| Ours | 78.9% |

![width:380px](assets/fig-chart.png)
```

In Cursor: *"Add paper Figure 2 and Table 3 to the deck."*

Syntax details: [`references/marp-syntax.md`](references/marp-syntax.md)

### 7. In-text citations

Cite theories, prior work, and statistics with **(Author, Year)** at the end of bullets:

```markdown
- **RAG** reduces hallucinations (Patrick Lewis et al., 2021)
- Spence (1973) treats education as a labor-market signal
- Graduate employment rate 70.3% in 2023 (Ministry of Education, 2023)
```

- **Presenting authors:** full names — `Anum Afzal, Alexander Kowsik, Rajna Fani, & Florian Matthes`, not `Afzal et al.`
- **Figures/tables from the current paper:** `*Source: Anum Afzal, Alexander Kowsik, Rajna Fani, & Florian Matthes (2024), Figure 2*`
- Optional final slide: condensed reference list (5–8 sources)
- In Cursor: *"Add in-text citations."*

### 8. Title slide & HTML preview

**Recommended title slide** (`deck.md`):

```markdown
---
marp: true
paginate: true
footer: 'https://arxiv.org/abs/2407.05925 · https://aclanthology.org/2024.dash-1.2/'
---

<!-- _class: lead -->

# Towards Optimizing and Evaluating a Retrieval Augmented QA Chatbot using LLMs with Human-in-the-Loop (2024)

## Anum Afzal, Alexander Kowsik, Rajna Fani, Florian Matthes

ACL DaSH 2024 · Human-in-the-Loop on industrial HR data
```

- `#` title: **full paper title + (year)** — not a shortened alias
- `##` authors: **full names** on a separate line below the title
- `footer:` in frontmatter: **paper ref links on every slide** (HTML + editable PPTX)
- PPTX also shows **page numbers** bottom-right on every slide

**HTML preview** (open `deck.html` in Chrome):

| Feature | Description |
|------|------|
| Images | `build_deck.sh` copies `assets/` → `output/assets/` so paths work |
| Sticky title | On long slides, `#` heading and blue rule stay pinned while scrolling |

Use a **hard refresh** (Cmd+Shift+R) when reopening `output/deck.html`.

### 9. Fonts (OS-installed)

Specify fonts by **installed font name**, not file path (macOS / Windows).

| File | Example (`my-style`) |
|------|------------------------|
| `templates/<id>/theme.css` | `section h1` → title, `section` → body `font-family` |
| `templates/<id>/pptx.json` | `"titleFontFace"`, `"bodyFontFace"` |

Default `my-style`:

- Title: **S-Core Dream 5 Medium**
- Body: **S-Core Dream 4 Regular**

Use the **exact name** from Font Book (Mac) or Font settings (Windows). Other machines need the same fonts installed for matching PPTX/HTML.

In Cursor: *"Use S-Core Medium for titles and S-Core Regular for body text."*

---

## Built-in templates

| ID | Use case | Notes |
|----|------|------|
| `academic` | Paper review, lab meeting (default) | White background, blue accent, 7-slide structure |
| `seminar` | Seminar / conference talk | Large type, high-contrast header |
| `my-style` | In-depth deck (20–30 slides) | S-Core Dream title/body, title footnote & ref links |

Use without a custom template:

```
Make slides from this paper using the academic template.
```

---

## Create a custom template

```bash
# 1) Copy the example folder
cp -r templates/_example templates/my-style

# 2) Replace my-style/template.pptx with your format

# 3) Import (extract colors/fonts + generate template.yaml)
node scripts/import_pptx_template.mjs templates/my-style/template.pptx --name my-style

# 4) Adjust slide titles and count in template.yaml if needed
```

Template spec: [`references/template-system.md`](references/template-system.md)

---

## Output format comparison

| Format | Command | Editable in PowerPoint | Use case |
|------|------|-----------------|------|
| `deck-editable.pptx` | `--editable-pptx` | Yes — text & tables | **Default (recommended)** |
| `deck.html` | (included by default) | — | Browser presentation, sharing |
| `deck.pptx` | `--pptx` | No — slides are images | Quick share |

---

## Sample test

Test with the sample paper in the repo:

```bash
# English paper, 30 slides (my-style, Afzal et al. 2024 HR RAG)
scripts/build_deck.sh \
  samples/runs/my-style-afzal-30/deck.md \
  samples/runs/my-style-afzal-30/output/deck \
  --template my-style --editable-pptx

# English paper, 7 slides (academic)
scripts/build_deck.sh \
  samples/runs/academic-afzal-hr-rag/deck.md \
  samples/runs/academic-afzal-hr-rag/output/deck \
  --template academic --editable-pptx
```

Extract figures from PDF (optional):

```bash
brew install poppler   # once
scripts/extract_pdf_figures.sh \
  "samples/papers/Afzal et al. - 2024 - Towards Optimizing and Evaluating a Retrieval Augmented QA Chatbot using LLMs with Human-in-the-Loop.pdf" \
  samples/runs/my-style-afzal-30/assets/
```

Sample layout:

```
samples/
├── papers/              # test PDFs (gitignored)
└── runs/<name>/
    ├── source.md        # paper metadata & arXiv link
    ├── deck.md          # slide source
    ├── assets/          # fig-*.png extracted from PDF
    └── output/
        ├── deck.html
        ├── deck-editable.pptx
        └── assets/      # copied for HTML preview on build
```

More: [`samples/README.md`](samples/README.md)

---

## Project structure

```
paper-to-slides/
├── SKILL.md                    # Cursor agent workflow
├── README.md                   # this file (user manual)
├── MARKETPLACE.md              # marketplace submission guide
├── .cursor-plugin/             # Cursor marketplace manifest
├── assets/logo.svg             # marketplace icon
├── templates/
│   ├── academic/               # default template
│   ├── seminar/
│   ├── my-style/               # S-Core fonts, 20–30 slide structure
│   ├── _example/               # custom template starter
│   └── <your-name>/            # created by import
│       ├── template.pptx
│       ├── pptx.json
│       └── template.yaml
├── scripts/
│   ├── import_pptx_template.mjs
│   ├── build_editable_pptx.mjs
│   └── build_deck.sh
├── references/
│   ├── quickstart.md           # README summary
│   ├── template-system.md
│   └── marp-syntax.md
└── samples/                    # test examples
```

---

## Additional docs

| Doc | Audience | Content |
|------|------|------|
| **README.md** (this file) | Users | Install, use, edit |
| [`references/quickstart.md`](references/quickstart.md) | Users | Quick reference |
| [`references/template-system.md`](references/template-system.md) | Advanced / agent | Template file spec |
| [`references/marp-syntax.md`](references/marp-syntax.md) | Advanced | `deck.md` syntax |
| [`SKILL.md`](SKILL.md) | Cursor agent | Conversion workflow |
| [`samples/README.md`](samples/README.md) | Developers | Sample testing |

---

## Cursor Marketplace

| Method | Review | Available now? |
|------|------|-----------|
| Copy to `~/.cursor/skills/` | None | Yes |
| [Cursor Marketplace](https://cursor.com/marketplace/publish) | Manual review | Ready to submit |

### How to submit

1. Push this repo to GitHub (`https://github.com/dschloe/paper2ppt`)
2. Submit the repo URL at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)
3. After approval, install via **Customize → Marketplace**

Local test & checklist: [`MARKETPLACE.md`](MARKETPLACE.md)

### Plugin layout

| File | Role |
|------|------|
| `.cursor-plugin/plugin.json` | Marketplace manifest |
| `SKILL.md` | Agent workflow (root skill) |
| `assets/logo.svg` | Marketplace icon |
| `templates/`, `scripts/`, `references/` | Templates, build, syntax |

---

## FAQ

**Q. Do I need Python?**  
No. Node.js is enough (`npm install`).

**Q. My paper is in Korean — can slides be in English?**  
Yes. Ask in chat: *"Make the slides in English."*

**Q. Can I edit text directly in the PPTX?**  
Yes with `deck-editable.pptx`. `deck.pptx` (Marp) is image-based and hard to edit.

**Q. Can I use my company PPT template as-is?**  
**Partially.** The skill does not copy slides from your PowerPoint file; it **reads colors and fonts** from the template and builds new slides in that tone.

1. **Register** — import your company `.pptx`:
   ```bash
   node scripts/import_pptx_template.mjs ~/company-template.pptx --name company
   ```
2. **Auto-extracted** — font, title/body colors, accent, table header colors → `templates/company/pptx.json`. Original file kept at `templates/company/template.pptx`.
3. **Generated** — paper content is laid out per `template.yaml` into `deck-editable.pptx` with **editable text boxes**.
4. **Not replicated** — logo placement, slide master shapes, background images, exact margins/box positions. (Future: fill slides directly from `template.pptx`.)
5. **Tweaks** — edit `templates/company/pptx.json` or fix the source pptx and re-import.

Summary: **brand colors & fonts yes**; **layout = skill structure + editable PPTX**. For pixel-perfect masters, adjust logo/master manually in PowerPoint after generation.

**Q. Is an arXiv link enough?**  
Yes. Paste the link in chat and ask for conversion.

**Q. How do I change the slide count?**  
Ask for *"30 slides"* or edit `chapters` in `template.yaml`. `deck.md` can exceed the template default (7 or 20 slides).

**Q. Images don't show in HTML.**  
`output/assets/` must sit next to `deck.html`. Re-run `build_deck.sh` — it copies assets automatically. Chrome loads from **`output/assets/`**, not the run folder's `assets/`.

**Q. Authors overlap the title on the title slide.**  
Long titles wrap to multiple lines. `my-style` adds spacing between title and authors. If needed, adjust `section.lead h1` `margin-bottom` in `theme.css` or `leadTitleSize` in PPTX theme.

**Q. How do I show paper links on every slide?**  
Add `footer:` with arXiv/ACL URLs in `deck.md` frontmatter — see [Title slide & HTML preview](#8-title-slide--html-preview).
