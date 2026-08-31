import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseDeck } from "../scripts/lib/parse_deck.mjs";

test("parseDeck reads footer from frontmatter", () => {
  const content = `---
footer: 'https://arxiv.org/abs/1234.5678'
---

# Title

- bullet
`;
  const { slides, refFooter } = parseDeck(content);
  assert.equal(slides.length, 1);
  assert.equal(refFooter, "https://arxiv.org/abs/1234.5678");
});

test("parseDeck detects lead slide", () => {
  const content = `---
marp: true
---

<!-- _class: lead -->

# Paper Title

## Author Name
`;
  const { slides } = parseDeck(content);
  assert.equal(slides.length, 1);
  assert.equal(slides[0].isLead, true);
  assert.equal(slides[0].title, "Paper Title");
});

test("sample deck parses with expected slide count", () => {
  const deckPath = "samples/runs/my-style-afzal-30/deck.md";
  const { slides, refFooter } = parseDeck(readFileSync(deckPath, "utf8"));
  assert.equal(slides.length, 30);
  assert.match(refFooter, /arxiv\.org/);
  assert.equal(slides[0].isLead, true);
});
