# Samples

End-to-end test runs for the paper-to-slides skill. Not part of the skill install — safe to delete when publishing.

## Layout

```
samples/
├── papers/              # optional local PDFs (gitignored)
└── runs/<run-name>/     # one folder per test
    ├── source.md        # arXiv URL or path to the PDF used
    ├── deck.md          # Marp markdown the agent wrote
    └── output/          # rendered files (gitignored)
        ├── deck.html
        ├── assets/            # copied from run assets/ for HTML image paths
        ├── deck.pptx          # optional, Marp image-based
        └── deck-editable.pptx # optional, native editable
```

## Naming runs

Use `{template}-{short-paper-name}`, e.g.:

- `runs/academic-attention/`
- `runs/seminar-bert/`

## Run a test (in Cursor chat)

1. Put a PDF in `samples/papers/` **or** paste an arXiv link in chat.
2. Ask: `academic 템플릿으로 이 논문 슬라이드 만들어줘. 결과는 samples/runs/<name>/ 에 저장해줘`
3. Render (if marp-cli is installed):

```bash
scripts/build_deck.sh samples/runs/<name>/deck.md samples/runs/<name>/output/deck --template academic
```

Add `--pptx` for Marp image-based export, or `--editable-pptx` for **native editable** PowerPoint:

```bash
scripts/build_deck.sh samples/runs/<name>/deck.md samples/runs/<name>/output/deck --template academic --editable-pptx
```

## What to commit

| File | Commit? |
|------|---------|
| `source.md`, `deck.md` | Yes — useful as reference |
| `papers/*.pdf` | No — large / copyright |
| `output/*` | No — regenerate with `build_deck.sh` |
