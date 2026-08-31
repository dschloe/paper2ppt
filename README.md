# paper-to-slides

**Cursor 스킬** — PPTX 양식 + 논문 PDF → 편집 가능한 슬라이드.

```
template.pptx  +  paper.pdf  →  Cursor 채팅  →  deck-editable.pptx
```

한글·영어 논문 모두 지원.

---

## 목차

- [개요](#개요)
- [설치](#설치)
- [빠른 시작 (3단계)](#빠른-시작-3단계)
- [사용 메뉴얼](#사용-메뉴얼)
  - [1. PPT 양식 등록](#1-ppt-양식-등록)
  - [2. Cursor에서 변환](#2-cursor에서-변환)
  - [3. 결과물](#3-결과물)
  - [4. 직접 빌드 (터미널)](#4-직접-빌드-터미널)
  - [5. 수정하기](#5-수정하기)
  - [6. 이미지와 표](#6-이미지와-표)
  - [7. 인용 (in-text citation)](#7-인용-in-text-citation)
  - [8. 타이틀 슬라이드·HTML 미리보기](#8-타이틀-슬라이드html-미리보기)
  - [9. 폰트 (OS 설치 글꼴)](#9-폰트-os-설치-글꼴)
- [내장 템플릿](#내장-템플릿)
- [커스텀 템플릿 만들기](#커스텀-템플릿-만들기)
- [출력 형식 비교](#출력-형식-비교)
- [샘플 테스트](#샘플-테스트)
- [프로젝트 구조](#프로젝트-구조)
- [추가 문서](#추가-문서)
- [Cursor 마켓플레이스](#cursor-마켓플레이스)
- [자주 묻는 질문](#자주-묻는-질문)

---

## 개요

| 입력 | 출력 |
|------|------|
| 논문 PDF (또는 arXiv 링크) | `deck-editable.pptx` — PowerPoint에서 **텍스트 직접 편집 가능** |
| PPTX 양식 (`template.pptx`) | `deck.md` — 슬라이드 내용 원본 |
| (선택) HTML 미리보기 | `deck.html` — 브라우저 발표용 |

Python 앱이 아닙니다. **Cursor 에이전트**가 논문을 읽고, 템플릿 규칙에 맞춰 슬라이드를 만듭니다.

---

## 설치

```bash
git clone https://github.com/dschloe/paper2ppt.git
cp -r paper2ppt ~/.cursor/skills/paper-to-slides
cd ~/.cursor/skills/paper-to-slides && npm install
```

HTML 미리보기가 필요하면 (선택):

```bash
npm install -g @marp-team/marp-cli
```

Cursor를 재시작하거나 새 채팅을 열면 스킬이 자동으로 인식됩니다.

---

## 빠른 시작 (3단계)

### ① 양식 등록 (처음 한 번)

```bash
node scripts/import_pptx_template.mjs ~/my-template.pptx --name my-style
```

내장 템플릿만 쓸 거면 이 단계는 건너뛰고 `academic`을 쓰면 됩니다.

### ② Cursor 채팅

```
my-style 템플릿으로 이 논문 7장 슬라이드 만들어줘
```

PDF를 채팅에 첨부하거나, 파일 경로·arXiv 링크를 붙여넣으세요.

### ③ 결과 확인

에이전트가 `deck-editable.pptx`를 만들어 줍니다. PowerPoint에서 바로 열어 편집할 수 있습니다.

---

## 사용 메뉴얼

### 1. PPT 양식 등록

회사·학교에서 쓰는 PPT 양식이 있으면 등록합니다.

```bash
node scripts/import_pptx_template.mjs ~/Downloads/my-format.pptx --name my-style
```

생성되는 폴더:

```
templates/my-style/
├── template.pptx   # 당신의 양식 (복사본)
├── pptx.json       # 색상·폰트 자동 추출
└── template.yaml   # 슬라이드 구성 (7장 기본)
```

이후 채팅에서 `my-style 템플릿으로 ...`라고 지정하면 됩니다.

프로젝트 기본 템플릿을 고정하려면 프로젝트 루트에 `.paper2slides` 파일을 만듭니다:

```
template: my-style
```

### 2. Cursor에서 변환

**한글 예시**

```
academic 템플릿으로 이 논문 슬라이드 만들어줘
```

```
이 PDF 논문을 7장 발표자료로 요약해줘. 결과는 samples/runs/my-paper/ 에 저장해줘
```

**영어 예시**

```
summarize this PDF as slides using the academic template
```

```
make a 7-slide deck from this arXiv paper: https://arxiv.org/abs/2412.xxxxx
```

에이전트가 자동으로:

1. 논문 PDF 읽기
2. `deck.md` 작성 (제목 → 문제 → 방법 → 결과 → 한계 → 결론)
3. `deck-editable.pptx` 렌더링

### 3. 결과물

| 파일 | 설명 |
|------|------|
| `deck-editable.pptx` | **주요 결과물** — PowerPoint·Keynote에서 텍스트·표 편집 가능 |
| `deck.md` | 슬라이드 내용 원본 — 수정 후 재생성할 때 사용 |
| `deck.html` | 브라우저 발표용 (빌드 시 자동 생성, `output/assets/`에 이미지 복사) |
| `deck.pptx` | Marp 이미지 기반 PPTX (`--pptx` 옵션 시, 편집 불가) |

### 4. 직접 빌드 (터미널)

에이전트가 만든 `deck.md`를 직접 렌더링할 때:

```bash
# 편집 가능 PPTX (권장)
scripts/build_deck.sh path/to/deck.md path/to/output/deck \
  --template my-style --editable-pptx

# HTML만
scripts/build_deck.sh path/to/deck.md path/to/output/deck --template academic

# Marp 이미지 PPTX (편집 불가)
scripts/build_deck.sh path/to/deck.md path/to/output/deck --template academic --pptx
```

결과: `output/deck-editable.pptx`, `output/deck.html`, `output/assets/` (HTML용 이미지)

### 5. 수정하기

| 바꾸고 싶은 것 | 방법 |
|---------------|------|
| 슬라이드 **내용** (문구, 숫자) | `deck.md` 편집, 또는 Cursor에 *"3번 슬라이드 Method에 한 줄 추가해줘"* |
| **색·폰트** | `templates/<id>/pptx.json` 수정 (`titleFontFace` / `bodyFontFace`), `theme.css`의 `font-family`, 또는 양식 pptx 재import |
| **슬라이드 구성** (7장 → 10장) | `templates/<id>/template.yaml`의 `chapters` 수정 |
| PowerPoint에서 직접 손보기 | `deck-editable.pptx` 열어서 편집 (텍스트 박스가 살아 있음) |

내용을 크게 바꾼 뒤에는 `deck.md` 수정 → `--editable-pptx` 재실행이 가장 깔끔합니다.

### 6. 이미지와 표

논문의 **표·그림**을 슬라이드에 넣을 수 있습니다.

**표** — `deck.md`에 마크다운 테이블 작성 (결과 비교 슬라이드에 권장):

```markdown
# Key Results

| Method | Accuracy |
|---|---|
| Baseline | 71.2% |
| **Ours** | **78.9%** |
```

**이미지** — PDF에서 그림 추출 후 슬라이드에 삽입:

```bash
# poppler 필요: brew install poppler
scripts/extract_pdf_figures.sh paper.pdf samples/runs/my-run/assets/
```

`deck.md` 예시:

```markdown
<!-- layout: figure -->
# 방법론 개요

![Figure 2](assets/fig-002.png)

*출처: 논문 Figure 2*
```

**표 + 이미지 나란히:**

```markdown
<!-- layout: image-table -->
# 실험 결과

| Method | Score |
|---|---|
| Ours | 78.9% |

![width:380px](assets/fig-chart.png)
```

Cursor 채팅: *"논문 Figure 2랑 Table 3 넣어서 슬라이드 만들어줘"*

자세한 문법: [`references/marp-syntax.md`](references/marp-syntax.md)

### 7. 인용 (in-text citation)

이론·선행연구·통계를 인용할 때 슬라이드 불릿 끝에 **(저자, 연도)** 형식을 붙입니다.

```markdown
- **RAG**로 환각 감소 (Patrick Lewis et al., 2021)
- Spence (1973)은 학력을 노동시장 신호로 본다
- 2023년 졸업자 취업률 70.3% (교육부, 2023)
```

- 발표 논문 저자는 **풀네임** — `Afzal et al.` 대신 `Anum Afzal, Alexander Kowsik, Rajna Fani, & Florian Matthes`
- 논문 **본인 그림·표**: `*출처: Anum Afzal, Alexander Kowsik, Rajna Fani, & Florian Matthes (2024), Figure 2*`
- 마지막 슬라이드에 **주요 참고문헌** 5~8개 요약 가능
- Cursor 채팅: *"in-text citation 추가해줘"*

### 8. 타이틀 슬라이드·HTML 미리보기

**타이틀 슬라이드** 권장 형식:

```markdown
<!-- _class: lead -->
<!-- _footer: "https://arxiv.org/abs/2407.05925 · https://aclanthology.org/2024.dash-1.2/" -->

# Towards Optimizing and Evaluating a Retrieval Augmented QA Chatbot using LLMs with Human-in-the-Loop (2024)

## Anum Afzal, Alexander Kowsik, Rajna Fani, Florian Matthes

ACL DaSH 2024 · Human-in-the-Loop on industrial HR data
```

- `#` 제목: 논문 **전체 제목 + (연도)** — 줄임말 대신 정식 제목
- `##` 저자: **풀네임** (제목 아래 별도 줄)
- `<!-- _footer: ... -->`: 하단 footnote에 arXiv·ACL 등 **논문 링크**

**HTML 미리보기** (`deck.html`을 Chrome에서 열 때):

| 기능 | 설명 |
|------|------|
| 이미지 | `build_deck.sh`가 `assets/`를 `output/assets/`로 복사 — 경로 깨짐 방지 |
| 제목 고정 | 내용이 긴 슬라이드에서 스크롤 시 `#` 제목·파란 구분선이 상단에 고정 |

`output/deck.html`을 열 때는 **강력 새로고침**(Cmd+Shift+R)을 권장합니다.

### 9. 폰트 (OS 설치 글꼴)

폰트 **파일 경로**가 아니라, macOS·Windows에 **이미 설치된 글꼴 이름**을 지정합니다.

| 파일 | 설정 예시 (`my-style`) |
|------|------------------------|
| `templates/<id>/theme.css` | `section h1` → 제목, `section` → 본문 `font-family` |
| `templates/<id>/pptx.json` | `"titleFontFace"`, `"bodyFontFace"` |

기본 `my-style` 예시:

- 제목: **S-Core Dream 5 Medium** (에스코어 드림 5 Medium)
- 본문: **S-Core Dream 4 Regular** (에스코어 드림 4 Regular)

Font Book(맥)에서 보이는 **정확한 이름**을 써야 합니다. 다른 PC에서도 같은 폰트가 설치되어 있어야 PPTX·HTML이 동일하게 보입니다.

Cursor 채팅 예시: *"제목은 에스코어 Medium, 본문은 에스코어 Regular로 해줘"*

---

## 내장 템플릿

| ID | 용도 | 특징 |
|----|------|------|
| `academic` | 논문 리뷰, 랩 미팅 (기본) | 흰 배경, 파란 악센트, 7장 구성 |
| `seminar` | 세미나·학회 발표 | 큰 글씨, 고대비 헤더 |
| `my-style` | 심화 발표 (20~30장) | 에스코어 드림 제목/본문, 타이틀 footnote·링크 지원 |

별도 양식 없이 바로 사용:

```
academic 템플릿으로 이 논문 슬라이드 만들어줘
```

---

## 커스텀 템플릿 만들기

```bash
# 1) 예시 폴더 복사
cp -r templates/_example templates/my-style

# 2) my-style/template.pptx 를 본인 양식으로 교체

# 3) import (색/폰트 추출 + template.yaml 생성)
node scripts/import_pptx_template.mjs templates/my-style/template.pptx --name my-style

# 4) 필요하면 template.yaml 에서 슬라이드 제목·개수 조정
```

자세한 템플릿 스펙: [`references/template-system.md`](references/template-system.md)

---

## 출력 형식 비교

| 형식 | 명령 | PowerPoint 편집 | 용도 |
|------|------|-----------------|------|
| `deck-editable.pptx` | `--editable-pptx` | ✅ 텍스트·표 편집 가능 | **일반 사용 (권장)** |
| `deck.html` | (기본 포함) | — | 브라우저 발표, 공유 |
| `deck.pptx` | `--pptx` | ❌ 슬라이드가 이미지 | 빠른 공유용 |

---

## 샘플 테스트

repo에 포함된 샘플 논문으로 테스트:

```bash
# 영어 논문 30장 (my-style, Afzal et al. 2024 HR RAG)
scripts/build_deck.sh \
  samples/runs/my-style-afzal-30/deck.md \
  samples/runs/my-style-afzal-30/output/deck \
  --template my-style --editable-pptx

# 영어 논문 7장 (academic)
scripts/build_deck.sh \
  samples/runs/academic-afzal-hr-rag/deck.md \
  samples/runs/academic-afzal-hr-rag/output/deck \
  --template academic --editable-pptx
```

PDF에서 그림 추출 (선택):

```bash
brew install poppler   # 최초 1회
scripts/extract_pdf_figures.sh \
  "samples/papers/Afzal et al. - 2024 - Towards Optimizing and Evaluating a Retrieval Augmented QA Chatbot using LLMs with Human-in-the-Loop.pdf" \
  samples/runs/my-style-afzal-30/assets/
```

샘플 구조:

```
samples/
├── papers/              # 테스트용 PDF (git 제외)
└── runs/<name>/
    ├── source.md        # 사용한 논문 정보·arXiv 링크
    ├── deck.md          # 슬라이드 원본
    ├── assets/          # PDF에서 추출한 fig-*.png
    └── output/
        ├── deck.html
        ├── deck-editable.pptx
        └── assets/      # HTML 미리보기용 (빌드 시 자동 복사)
```

자세한 내용: [`samples/README.md`](samples/README.md)

---

## 프로젝트 구조

```
paper-to-slides/
├── SKILL.md                    # Cursor 에이전트 워크플로
├── README.md                   # 이 문서 (사용 메뉴얼)
├── MARKETPLACE.md              # 마켓플레이스 제출 가이드
├── .cursor-plugin/             # Cursor 마켓플레이스 매니페스트
├── assets/logo.svg             # 마켓플레이스 아이콘
├── templates/
│   ├── academic/               # 기본 템플릿
│   ├── seminar/
│   ├── my-style/               # 에스코어 폰트·20~30장 심화 구성
│   ├── _example/               # 커스텀 템플릿 시작점
│   └── <your-name>/            # import로 생성
│       ├── template.pptx
│       ├── pptx.json
│       └── template.yaml
├── scripts/
│   ├── import_pptx_template.mjs
│   ├── build_editable_pptx.mjs
│   └── build_deck.sh
├── references/
│   ├── quickstart.md           # README 요약본
│   ├── template-system.md
│   └── marp-syntax.md
└── samples/                    # 테스트 예시
```

---

## 추가 문서

| 문서 | 대상 | 내용 |
|------|------|------|
| **README.md** (이 파일) | 사용자 | 설치·사용·수정 전체 메뉴얼 |
| [`references/quickstart.md`](references/quickstart.md) | 사용자 | 빠른 참조 요약 |
| [`references/template-system.md`](references/template-system.md) | 고급 / 에이전트 | 템플릿 파일 규격 |
| [`references/marp-syntax.md`](references/marp-syntax.md) | 고급 | `deck.md` 문법 |
| [`SKILL.md`](SKILL.md) | Cursor 에이전트 | 자동 변환 워크플로 |
| [`samples/README.md`](samples/README.md) | 개발자 | 샘플 테스트 방법 |

---

## Cursor 마켓플레이스

| 방법 | 심사 | 지금 가능? |
|------|------|-----------|
| `~/.cursor/skills/` 복사 | 없음 | ✅ |
| [Cursor Marketplace](https://cursor.com/marketplace/publish) | 수동 심사 | ✅ 제출 준비 완료 |

### 제출 방법

1. 이 저장소를 GitHub에 push (`https://github.com/dschloe/paper2ppt`)
2. [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) 에서 repo URL 제출
3. 심사 통과 후 **Customize → Marketplace** 에서 설치

로컬 테스트·체크리스트: [`MARKETPLACE.md`](MARKETPLACE.md)

### 플러그인 구성

| 파일 | 역할 |
|------|------|
| `.cursor-plugin/plugin.json` | 마켓플레이스 매니페스트 |
| `SKILL.md` | 에이전트 워크플로 (루트 스킬) |
| `assets/logo.svg` | 마켓플레이스 아이콘 |
| `templates/`, `scripts/`, `references/` | 템플릿·빌드·문법 |

---

## 자주 묻는 질문

**Q. Python 설치가 필요한가요?**  
아니요. Node.js만 있으면 됩니다 (`npm install`).

**Q. 논문이 한글인데 슬라이드는 영어로 만들 수 있나요?**  
네. 채팅에서 *"영어로 슬라이드 만들어줘"*라고 요청하면 됩니다.

**Q. PPTX에서 글자를 직접 고칠 수 있나요?**  
`deck-editable.pptx`는 가능합니다. `deck.pptx`(Marp)는 이미지라 편집이 어렵습니다.

**Q. 내 회사 PPT 양식 그대로 쓸 수 있나요?**  
**부분적으로 가능합니다.** PowerPoint 파일을 그대로 “슬라이드 복사”하는 방식은 아니고, **양식에서 색·폰트를 읽어** 새 슬라이드를 같은 톤으로 만듭니다.

1. **등록** — 회사 `.pptx`를 import합니다.
   ```bash
   node scripts/import_pptx_template.mjs ~/company-template.pptx --name company
   ```
2. **자동 추출되는 것** — PPT 테마에서 **글꼴, 제목/본문 색, 강조색, 표 헤더 색** 등이 `templates/company/pptx.json`에 저장됩니다. 원본 파일은 `templates/company/template.pptx`에 보관됩니다.
3. **생성되는 것** — 논문 내용은 `template.yaml`의 슬라이드 구조(제목·불릿·표 등)에 맞춰 `deck-editable.pptx`로 출력됩니다. **텍스트 박스는 편집 가능**합니다.
4. **그대로 안 되는 것** — 회사 로고 위치, 슬라이드 마스터 모양, 도형·배경 이미지, 정확한 여백/박스 배치는 **자동 복제되지 않습니다.** (향후 `template.pptx` 슬라이드를 직접 채우는 방식으로 확장 예정)
5. **미세 조정** — 색이 어긋나면 `templates/company/pptx.json`을 직접 수정하거나, 양식 pptx를 고친 뒤 import를 다시 실행하세요.

정리: **브랜드 색·폰트는 반영**, **레이아웃은 스킬 기본 구조 + 편집 가능 PPTX**입니다. 픽셀 단위 동일 양식이 필요하면 생성 후 PowerPoint에서 로고·마스터를 수동으로 맞추는 것이 가장 빠릅니다.

**Q. arXiv 링크만 주면 되나요?**  
네. 채팅에 링크를 붙이고 변환을 요청하면 됩니다.

**Q. 슬라이드 장수를 바꾸고 싶어요.**  
*"30장으로 만들어줘"* 또는 `template.yaml`의 `chapters`를 수정하세요. `deck.md` 장수는 템플릿 기본값(7·20장)보다 늘어날 수 있습니다.

**Q. HTML에서 이미지가 안 보여요.**  
`deck.html`과 같은 폴더에 `output/assets/`가 있어야 합니다. `build_deck.sh`를 다시 실행하면 자동 복사됩니다. `deck.md`가 있는 `assets/`가 아닌 **`output/assets/`**를 Chrome이 참조합니다.

**Q. 제목 슬라이드에서 저자가 제목과 겹쳐요.**  
긴 제목은 여러 줄로 나뉩니다. `my-style` 템플릿은 제목·저자 간격을 넓혀 두었습니다. 그래도 겹치면 `theme.css`의 `section.lead h1` `margin-bottom` 또는 PPTX `leadTitleSize`를 조정하세요.
