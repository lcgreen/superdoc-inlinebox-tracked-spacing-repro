# SuperDoc inlineBox spacing with tracked changes

Minimal synthetic reproduction of a render-only spacing issue, observed with SuperDoc **2.17.0** and **2.24.0** in Chromium.

The document reads `Before [deleted: removed words ] [inserted: added] following text should wrap after the citation.`

The Document API returns insertion offsets **7–12**. An `inlineBox` targeting its final character (**11–12**) with `gapAfter: 24` paints the gap after **v** in deleted `removed words`, rather than the final **d** in inserted `added`.

Expected: the reserved space follows the requested insertion. Actual: it splits earlier deleted text. This appears to be a visible/tracked coordinate mismatch; the internal cause is unconfirmed.

## Run

Requires Node.js and npm.

```sh
npm install
npx playwright install chromium
npm test
```

**The test is expected to fail:** `expected 'v' to be 'd'`. It also saves `synthetic-gap.png`.

To test the other verified version:

```sh
npm install superdoc@2.24.0
npm test
```

## Screenshots

Captured from the minimal synthetic DOCX included in this repository. The DOCX contains only its document XML and required package declarations.

### 2.17.0

![Gap inside the earlier deleted text](synthetic-gap-2.17.0.png)

### 2.24.0

![Same failure on 2.24.0](synthetic-gap-2.24.0.png)

## Contents

- `synthetic.docx`: hand-authored synthetic text and tracked changes; no customer document or metadata.
- `spacing.browser.test.ts`: failing Chromium test using public extension APIs.
- `vitest.config.ts`: browser test configuration.

SuperDoc is downloaded from npm and is not vendored here. Its own licensing terms apply.
