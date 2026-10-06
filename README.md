# Hetti219.github.io

Static portfolio. No build step, no dependencies.

## Editing

Content lives in `index.html` and nowhere else. Adding a project means five edits:

1. an `<article class="node">` block — title, tagline, description, highlights,
   metrics, schema box
2. a matching `<li>` in `#registry-tree`
3. an entry in the JSON-LD `hasOfferCatalog`
4. `llms.txt`, which is hand-maintained
5. nothing else — the tests fail if 1–4 disagree

The `data-*` attributes are not decoration. `readNode` in `app.js` reads the node
back off the DOM — title, tagline and status off the elements that render them,
the rest off their attributes — so the filter, the copy actions and the machine
rendering cannot drift from what is on screen, and a field missing from the markup
is a field missing from all of them.

## Verifying

```
node --test tests/*.test.mjs
```

(Bare `node --test tests/` fails on Node 24 — it tries to load the directory as a
module.)

## Previewing

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Serve it over HTTP rather than opening the file
directly: `location.replace`, `history.replaceState` and the `llms.txt` fetch all
behave differently on `file://`.

## Deploying

Push to `main`. GitHub Pages serves the repository root (Settings → Pages →
Deploy from a branch → `main` / root). `.nojekyll` disables Jekyll processing.

## What is here

| File | Role |
| :--- | :--- |
| `index.html` | All content, in the markup, before any script runs |
| `styles.css` | Design tokens, layout, motion |
| `app.js` | Progressive enhancement only — shows, hides, filters, reformats |
| `llms.txt` | Machine manifest for AI crawlers |
| `robots.txt` | Crawl permission |
| `404.html` | Not-found page, same register as the rest |
| `tests/` | Node's built-in test runner; no test dependencies |

The contract that matters: every word is in `index.html` before `app.js` loads.
Scripting off, the page is a complete document. That is deliberate — the previous
React build served an empty `<div id="root">`, so a crawler or an LLM fetching the
site got nothing at all.
