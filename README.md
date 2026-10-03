# Hetti219.github.io

Static portfolio. No build step, no dependencies.

## Editing

Content lives in `index.html`. To add a project, copy an `<article class="node">`
block, fill in its `data-*` attributes, and add a matching `<li>` to `#registry-tree`.

The `data-*` attributes are not decoration — the filter, the copy actions and the
machine rendering all read the node back off the DOM, so a field missing from the
markup is a field missing from every one of them.

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
