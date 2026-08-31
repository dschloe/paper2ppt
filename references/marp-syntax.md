# Marp Markdown Quick Reference

Marp turns plain Markdown into slides. Basic rules:

## Slide separator
```markdown
---
marp: true
theme: academic-theme
size: 16:9
paginate: true
---

# Slide 1 title

content

---

# Slide 2 title

content
```

## Headers = slide title
`#` for the main title on a slide, `##` for a subtitle line under it.

## Bullets
Keep them short — 5-7 words per line, max ~5 bullets per slide.
```markdown
- Point one
- Point two
```

## Tables (results / comparison slides)
```markdown
# Key Results

| Method | Accuracy | Params |
|---|---|---|
| Baseline | 71.2% | 12M |
| **Ours** | **78.9%** | 12M |
```
→ `deck-editable.pptx`에 **편집 가능한 표**로 렌더됩니다.

## Figures (paper diagrams / charts)

### Figure-only slide
```markdown
<!-- layout: figure -->
# RAG Pipeline

![Figure 2: Method overview](assets/fig-002.png)

*출처: 논문 Figure 2*
```

### Table + image side by side
```markdown
<!-- layout: image-table -->
# Key Results

| Method | Score |
|---|---|
| Baseline | 71.2% |
| **Ours** | **78.9%** |

![width:380px](assets/fig-chart.png)

*Table 3 in the original paper*
```

### Bullets + image (two columns)
```markdown
# How It Works

<div style="display:flex; gap:2rem;">
<div>

- Point one
- Point two

</div>
<div>

![width:400px](assets/fig-architecture.png)

</div>
</div>
```

### Image sizing
- `![alt](path.png)` — default width
- `![width:500px](path.png)` — fixed width (Marp HTML + PPTX)

### Asset paths
- Relative to `deck.md` (e.g. `samples/runs/my-run/assets/fig-001.png`)
- Extract from PDF: `scripts/extract_pdf_figures.sh paper.pdf assets/`

## Background image (title slide)
```markdown
![bg](assets/title-bg.png)
```

## In-text citations

Cite theories, prior findings, and borrowed statistics on the slide where they appear:

```markdown
- **RAG** (Lewis et al., 2021): retrieval + generation for grounded answers
- Spence (1973) argues education signals ability to employers
- 2023년 졸업자 취업률 70.3% (교육부, 2023)
```

Rules:
- **Presenting paper authors:** always full names on the title slide and in citations — e.g. `Anum Afzal, Alexander Kowsik, Rajna Fani, & Florian Matthes (2024)`, not `Afzal et al. (2024)`
- **Cited prior work:** first author's given + family name, then `et al.` if 3+ authors — e.g. `Patrick Lewis et al. (2021)`
- Prefer `(Author, Year)` at the end of the bullet; use `Author (Year)` when the author is the sentence subject
- Cite only works from the paper's reference list — do not invent citations
- Figures/tables from the **current paper**: `*출처: Anum Afzal, Alexander Kowsik, Rajna Fani, & Florian Matthes (2024), Figure 2*`
- Optional final slide: condensed reference list (5–8 key sources)

## Speaker notes
```markdown
<!-- 발표 시 강조할 포인트 -->
```

## Class directive
```markdown
<!-- _class: lead -->
<!-- _footer: "https://arxiv.org/abs/XXXX.XXXXX" -->
# Full Paper Title (2024)
```

Per-slide footer (footnote at bottom) — use on the title slide for the canonical paper URL:
```markdown
<!-- _footer: "https://arxiv.org/abs/XXXX.XXXXX" -->
```

**All slides:** put the same ref in deck frontmatter so HTML and PPTX show it on every page:
```yaml
---
marp: true
footer: 'https://arxiv.org/abs/XXXX.XXXXX · https://aclanthology.org/YYYY.id/'
paginate: true
---
```

## HTML preview: sticky slide title

In browser HTML preview, long slides scroll inside the slide while the `#` title and its underline stay pinned at the top (`position: sticky` in theme CSS). Title slides (`lead`) are excluded.
