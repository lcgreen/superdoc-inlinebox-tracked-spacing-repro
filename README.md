# SuperDoc inlineBox spacing with tracked changes

Minimal synthetic reproduction of a render-only spacing issue, reproduced with SuperDoc **2.24.0** in Chromium.

The document reads `Before [deleted: removed words ] [inserted: added] following text should wrap after the citation.`

The Document API returns insertion offsets **7–12**. An `inlineBox` targeting its final character (**11–12**) with `gapAfter: 24` paints the gap after **v** in deleted `removed words`, rather than the final **d** in inserted `added`.

## Expected behaviour

The 24 px gap should appear immediately after the final **d** in inserted `added`. That space should participate in line wrapping, allowing a citation to remain beside its owning text while following words wrap within the document margins. Earlier deleted text should remain intact, with no new gap inside it.

## Actual behaviour

The gap appears after **v** in deleted `removed words`, splitting the wrong text. This appears to be a visible/tracked coordinate mismatch; the internal cause is unconfirmed.

## Run

Requires Node.js and npm.

```sh
npm install
npx playwright install chromium
npm test
```

**The test is expected to fail:** `expected 'v' to be 'd'`. It also saves `synthetic-gap.png`.

## Screenshots

Captured from the minimal synthetic DOCX included in this repository. The DOCX contains only its document XML and required package declarations.

![Gap incorrectly placed inside earlier deleted text in SuperDoc 2.24.0](synthetic-gap-2.24.0.png)

## Contents

- `synthetic.docx`: hand-authored synthetic text and tracked changes; no customer document or metadata.
- `spacing.browser.test.ts`: failing Chromium test using public extension APIs.
- `vitest.config.ts`: browser test configuration.

SuperDoc is downloaded from npm and is not vendored here. Its own licensing terms apply.
