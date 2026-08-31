# Quickstart

> **전체 메뉴얼은 [README.md](../README.md)에 있습니다.** 이 파일은 빠른 참조용 요약입니다.

## 준비 (한 번만)

```bash
cp -r paper-to-slides ~/.cursor/skills/paper-to-slides
cd ~/.cursor/skills/paper-to-slides && npm install
```

## 3단계

1. **양식 등록** (선택): `node scripts/import_pptx_template.mjs ~/my.pptx --name my-style`
2. **Cursor 채팅**: `my-style 템플릿으로 이 논문 슬라이드 만들어줘`
3. **결과**: `deck-editable.pptx` (PowerPoint 편집 가능)

## 직접 빌드

```bash
scripts/build_deck.sh deck.md output/deck --template academic --editable-pptx
```

## 내장 템플릿

| ID | 용도 |
|----|------|
| `academic` | 논문 리뷰 (기본) |
| `seminar` | 큰 글씨 세미나용 |

자세한 내용 → [README.md](../README.md)
