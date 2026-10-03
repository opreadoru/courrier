# Courrier

Alex Oprea's proof of concept for reading French administrative letters, for his portfolio and GitHub. MIT licence, public repo. The pitch and the testing story are in the README.

## Run

```
node server.mjs
```

Needs Ollama running with `gemma4:12b`. The app is at `http://localhost:5179`. `?model=<name>` switches the model. Screenshots and scripted checks: `node tools/cdp.mjs <url> <out.png> [js] [waitms] [width] [height] [js-after]` (headless Edge). `node tools/make-sample-pdfs.mjs` rebuilds the two letter1 PDFs from `letter1.txt`.

## Rules

- Privacy first. Real letters used for testing never enter this folder, a commit, a screenshot or a doc. The eval runners in `tools/eval*.mjs` stay git-ignored because they list private file names.
- Sample letters, people and places are invented. Use clearly fictional details only: postcode 99999, addresses on `.example` domains.
- The model finds, the code checks, the person decides. Dates and deadlines are computed in code, never trusted from the model. Courrier never sends anything.
- Nothing leaves the computer in the local version: no external requests, fonts and libraries are vendored in `vendor/`.
- No em dashes and no "X, not Y" contrast sentences in copy. Full connected sentences. One paragraph per line, no hard wraps.

## Open

- Live demo for hiring managers: Gemini 2.5 Flash-Lite on Vertex AI (now named Agent Platform) in its own Google Cloud project, region europe-west1, with a 10 EUR monthly spend cap and daily caps in code. Not built yet. The GitHub version stays local only.
