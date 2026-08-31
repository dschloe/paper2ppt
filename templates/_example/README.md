# Example custom template

Copy this folder to `templates/my-style/` and replace `template.pptx` with your own.

```bash
cp -r templates/_example templates/my-style
# replace templates/my-style/template.pptx with your file, then:
node scripts/import_pptx_template.mjs templates/my-style/template.pptx --name my-style
```

Files:

| File | Purpose |
|------|---------|
| `template.pptx` | Your PowerPoint format (colors/fonts extracted automatically) |
| `pptx.json` | Extracted theme for editable export |
| `template.yaml` | Slide outline the agent follows |
| `theme.css` | Optional — HTML preview only |
