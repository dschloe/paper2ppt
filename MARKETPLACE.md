# Cursor Marketplace — Paper to Slides

Submit this repository to the [Cursor Marketplace](https://cursor.com/marketplace/publish).

## Before you submit

1. **Public GitHub repo** — `https://github.com/dschloe/paper2ppt`
2. **Push all plugin files** — manifest, `SKILL.md`, `templates/`, `scripts/`, `references/`, `assets/logo.svg`
3. **Local smoke test** (recommended):

```bash
# Option A — skills path (works today)
cp -r . ~/.cursor/skills/paper-to-slides
cd ~/.cursor/skills/paper-to-slides && npm install

# Option B — plugin local path (marketplace-style)
mkdir -p ~/.cursor/plugins/local
cp -r . ~/.cursor/plugins/local/paper-to-slides
cd ~/.cursor/plugins/local/paper-to-slides && npm install
```

Restart Cursor → **Customize** → confirm **Paper to Slides** skill appears.

4. **Quick agent test** in a new chat:

```
academic 템플릿으로 이 논문 7장 슬라이드 만들어줘. Figure 2랑 Table 3 넣어줘
```

(PDF attached or path under `samples/papers/`)

## Submit

1. Open [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)
2. Repository URL: `https://github.com/dschloe/paper2ppt`
3. Wait for manual review (typically a few days)

## Manifest

- Path: `.cursor-plugin/plugin.json`
- Skill: root `SKILL.md` (auto-discovered; no `skills/` override)
- Logo: `assets/logo.svg`

## Checklist (Cursor review)

- [x] Valid `.cursor-plugin/plugin.json`
- [x] Unique kebab-case `name`: `paper-to-slides`
- [x] `description` explains purpose
- [x] `SKILL.md` has `name` + `description` frontmatter
- [x] `README.md` documents install and usage
- [x] `LICENSE` (MIT)
- [x] Logo committed and referenced in manifest
- [x] Relative paths only in manifest
- [ ] Repository pushed to GitHub (you)
- [ ] Submitted at marketplace publish form (you)

## After approval

Users install from **Cursor → Customize → Marketplace**, or continue manual install:

```bash
git clone https://github.com/dschloe/paper2ppt.git
cp -r paper2ppt ~/.cursor/skills/paper-to-slides
cd ~/.cursor/skills/paper-to-slides && npm install
```
