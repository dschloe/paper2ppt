# Template System (Cursor Skill)

This skill is **agent-driven**. There is no Python app and no runtime that parses templates — the Cursor agent reads template files and applies them when writing Marp markdown.

## Why templates exist

Users struggle with **formatting**, not summarization: fonts, title hierarchy, colors, table styling, slide layout. Templates capture those decisions once so every deck looks consistent.

## Directory layout

```
templates/
├── academic/          # default preset
│   ├── template.yaml  # structure + formatting rules (agent reads this)
│   ├── theme.css      # Marp visual theme (marp-cli reads this)
│   └── pptx.json      # fonts/colors for editable PPTX (pptxgenjs reads this)
├── seminar/           # large-type preset for room projection
│   ├── template.yaml
│   └── theme.css
└── _example/          # copy this folder to create a custom template
    ├── template.yaml
    └── theme.css
```

User-owned templates (optional, checked after built-in presets):

- Project-local: `templates/<name>/` inside the repo
- Personal: `~/.cursor/skills/paper-to-slides/templates/<name>/`

## Template selection (agent)

Resolve in this order:

1. User explicitly names a template ("seminar 템플릿으로", `--template minimal`)
2. Project file `.paper2slides` contains `template: <id>` (one line)
3. Default: `academic`

Always read `templates/<id>/template.yaml` before writing slides. If the id is missing, list available folders under `templates/` (skip `_example`) and ask the user to pick one.

## template.yaml contract

Each template defines three things:

| Section | Purpose |
|---------|---------|
| `marp` | Frontmatter values for the deck (`theme`, `size`, `paginate`) |
| `structure.chapters` | Which slides to create and in what order |
| `layouts` | Per-slide-type rules (bullets, table, figure, two-column) |

The agent maps **paper sections → chapter ids → layout rules → Marp markdown**.

### Chapter ids (standard)

| id | Typical paper source | Default layout |
|----|----------------------|----------------|
| `title` | Title, authors, venue | `lead` |
| `problem` | Introduction, motivation | `bullets` |
| `method` | Method, approach | `bullets` |
| `how` | Architecture, pipeline, algorithm | `two-column` or `bullets` |
| `results` | Experiments, tables | `table` or `bullets` |
| `limitations` | Discussion, limitations | `bullets` |
| `takeaway` | Conclusion | `bullets` |

For longer decks, duplicate or split chapters (e.g. `method-1`, `method-2`) but keep the same layout rules.

## Layout rules (agent applies when writing markdown)

### `lead` (title slide)

```markdown
<!-- _class: lead -->
<!-- _footer: "https://arxiv.org/abs/XXXX.XXXXX" -->
# {paper title} ({year})
## {authors}
{venue} · {one-line hook}
```

- Use the **full paper title** with publication year in the `#` heading — not a shortened alias.
- Put the canonical paper URL in a Marp `_footer` directive (renders as a bottom footnote in HTML and editable PPTX).

### `bullets`

- `#` = slide title (from chapter `heading` or paper section name)
- `-` bullets only; no paragraphs
- Respect `max_items` and `max_words_per_item` from template.yaml

### `table` (results slide)

- Reproduce the paper's headline comparison table when numbers exist
- Bold the best row if `highlight_best: true`
- Never invent statistics

### `figure` (diagram / chart slide)

```markdown
<!-- layout: figure -->
# How It Works

![Figure 2: Pipeline](assets/fig-002.png)

*출처: 논문 Figure 2*
```

Extract images: `scripts/extract_pdf_figures.sh <pdf> <run>/assets/`

### `image-table` (results with chart)

Table markdown + `![width:380px](assets/...)` on the same slide — table left, image right in PPTX.

### `figure` fallback

If the PDF figure is not extractable, use caption only — never fabricate what the figure shows.

### `two-column`

Use the HTML flex pattern from `references/marp-syntax.md` — left column for concept, right for diagram/bullets.

## Marp frontmatter (always include)

Read `marp` block from template.yaml:

```markdown
---
marp: true
theme: academic-theme
size: 16:9
paginate: true
---
```

The `theme:` name must match the `@theme` line in that template's `theme.css`.

## Rendering

After writing `deck.md`, run:

```bash
scripts/build_deck.sh deck.md output-basename --template <id> [--pptx] [--editable-pptx]
```

- `--pptx` → Marp image-based PPTX (not editable in PowerPoint)
- `--editable-pptx` → native `output-basename-editable.pptx` with real text boxes (pptxgenjs + `templates/<id>/pptx.json`)

`build_deck.sh` loads `templates/<id>/theme.css` for HTML. The agent does not hand-edit CSS unless the user asks to customize a template.

## Creating a custom template (tell the user)

1. Copy `templates/_example/` → `templates/my-style/` (or `~/.cursor/skills/paper-to-slides/templates/my-style/`)
2. Edit `template.yaml` — slide count, headings, bullet limits
3. Edit `theme.css` — fonts, colors, table header style (`@theme` name must match `marp.theme`)
4. Edit `pptx.json` — same colors/fonts for editable PowerPoint export
5. Ask the agent: "my-style 템플릿으로 이 논문 슬라이드 만들어줘"

No code changes required.

## What templates do NOT do

- Download PDFs (agent reads uploaded PDFs or URLs directly in Cursor)
- Parse PDF structure programmatically (agent reads and understands the paper)
- Provide native editable PowerPoint (Marp PPTX is image-based; mention this if user asks for .pptx)
