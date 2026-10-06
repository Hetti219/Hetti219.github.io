import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import {
  formatUTC, formatLocal, channelForKey, shouldIgnoreKey, nextEscapeAction,
  nodeMatchesQuery, nodeToSpec, nodeToJson, toMarkdown,
  buildMailto, DISPATCH_TO, formatLatency, shortcutsActive, resolveNodeSlug,
} from '../app.js'

/* The sources, read once — nothing rewrites them mid-run. */
const CSS = readFileSync('styles.css', 'utf8')
const html = readFileSync('index.html', 'utf8')

test('the static skeleton exists', () => {
  for (const p of ['index.html', 'styles.css', 'app.js', 'favicon.svg', '.nojekyll']) {
    assert.ok(existsSync(p), `${p} should exist`)
  }
})

/* ---------- Task 2: design tokens, typography, motion ---------- */

test('every §2.1 colour token is defined with its exact spec value', () => {
  const expected = {
    '--color-bg-base': '#07090E',
    '--color-bg-surface': '#0D1117',
    '--color-bg-elevated': '#131924',
    '--color-border-mist': '#1E2533',
    '--color-border-hard': '#2A3447',
    '--color-text-bone': '#E2E5EC',
    '--color-text-muted': '#8490A6',
    '--color-cobalt-glow': '#2563EB',
    '--color-cobalt-pulse': '#3B82F6',
  }
  for (const [token, hex] of Object.entries(expected)) {
    assert.match(CSS, new RegExp(`${token}\\s*:\\s*${hex}`, 'i'), `${token} must be ${hex}`)
  }
})

test('the type scale uses the six §3.2 sizes', () => {
  const scale = {
    '--fs-overline': '10px',
    '--fs-timestamp': '11px',
    '--fs-body': '12px',
    '--fs-section': '14px',
    '--fs-node': '18px',
    '--fs-ident': '24px',
  }
  for (const [token, size] of Object.entries(scale)) {
    assert.match(CSS, new RegExp(`${token}\\s*:\\s*${size}`), `${token} must be ${size}`)
  }
})

test('the coordinate grid is drawn at 32px (§4.3)', () => {
  assert.match(CSS, /background-size:\s*32px\s+32px/)
})

test('every border-radius declaration is zero, and nothing is blurred', () => {
  const radii = [...CSS.matchAll(/border-radius:\s*([^;]+)/g)].map((m) => m[1].trim())
  assert.ok(radii.length > 0, 'expected the universal reset to declare border-radius: 0')
  for (const r of radii) assert.equal(r, '0', `non-zero border-radius: ${r}`)
  assert.doesNotMatch(CSS, /backdrop-filter|filter:\s*blur/)
})

test('the vault-door easing and duration match §5.1', () => {
  assert.match(CSS, /--ease-vault:\s*cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/)
  assert.match(CSS, /--dur-vault:\s*380ms/)
})

test('reduced motion is respected', () => {
  assert.match(CSS, /@media \(prefers-reduced-motion: reduce\)/)
})

/* ---------- Task 3: telemetry bar and 1Hz escapement ---------- */

test('formatUTC renders HH:MM:SSZ with zero padding', () => {
  assert.equal(formatUTC(new Date(Date.UTC(2026, 9, 3, 4, 5, 6))), '04:05:06Z')
  assert.equal(formatUTC(new Date(Date.UTC(2026, 9, 3, 0, 0, 0))), '00:00:00Z')
  assert.equal(formatUTC(new Date(Date.UTC(2026, 9, 3, 23, 59, 59))), '23:59:59Z')
})

test('formatLocal uses local getters, not UTC ones', () => {
  const d = new Date(2026, 9, 3, 4, 5, 6) // local-time constructor
  assert.equal(formatLocal(d), '04:05:06')
})

test('the telemetry bar carries every §8/01 sub-element', () => {
  for (const id of ['utc', 'local', 'dom-count', 'viewport', 'led', 'audio-toggle', 'optic-toggle']) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`)
  }
  assert.match(html, /NODE\/\/SYS-0x89/)
})

test('the telemetry markup and the main region do not share an id', () => {
  assert.match(html, /id="viewport-root"/)
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
  assert.deepEqual(dupes, [], `duplicate ids: ${dupes.join(', ')}`)
})

/* ---------- Task 4: channel selector and keyboard dispatch ---------- */

test('keystrokes inside a text field are never intercepted', () => {
  for (const tag of ['INPUT', 'TEXTAREA', 'SELECT']) {
    assert.equal(shouldIgnoreKey({ tagName: tag, isContentEditable: false }), true, tag)
  }
  assert.equal(shouldIgnoreKey({ tagName: 'DIV', isContentEditable: true }), true, 'contenteditable')
  assert.equal(shouldIgnoreKey({ tagName: 'BODY', isContentEditable: false }), false)
  assert.equal(shouldIgnoreKey(null), false)
})

test('every mapped key resolves to a channel', () => {
  assert.equal(channelForKey('1'), 'registry')
  assert.equal(channelForKey('2'), 'schematics')
  assert.equal(channelForKey('3'), 'transmissions')
  assert.equal(channelForKey('4'), 'comm')
  assert.equal(channelForKey('9'), null)
  assert.equal(channelForKey('m'), null, 'M toggles the optic, it is not a channel')
})

test('escape cascades: modal, then blur, then filters — never more than one step', () => {
  assert.equal(nextEscapeAction({ modalOpen: true, inputFocused: true, filterActive: true }), 'modal')
  assert.equal(nextEscapeAction({ modalOpen: false, inputFocused: true, filterActive: true }), 'blur')
  assert.equal(nextEscapeAction({ modalOpen: false, inputFocused: false, filterActive: true }), 'clear-filter')
  assert.equal(nextEscapeAction({ modalOpen: false, inputFocused: false, filterActive: false }), null)
})

test('all four channels are present in the markup', () => {
  assert.match(html, /id="channel-bar"/)
  for (const c of ['registry', 'schematics', 'transmissions', 'comm']) {
    assert.match(html, new RegExp(`id="channel-${c}"`), `missing #channel-${c}`)
  }
})

/* ---------- Task 5: registry content ---------- */

/* Derived from the markup, never retyped here: a node added to index.html is
   covered by every test below without editing this file. */
const slugs = () => [...html.matchAll(/data-slug="([^"]+)"/g)].map((m) => m[1])
const paths = () => [...html.matchAll(/data-path="([^"]+)"/g)].map((m) => m[1])
const nodeBlock = (slug) =>
  html.match(new RegExp(`<article class="node" id="node-${slug}"[\\s\\S]*?</article>`))?.[0] ?? ''

test('every node carries the markup app.js reads it back from', () => {
  assert.ok(slugs().length > 0, 'expected at least one project node')
  for (const slug of slugs()) {
    const block = nodeBlock(slug)
    assert.ok(block, `${slug}: no <article class="node" id="node-${slug}">`)
    assert.match(block, /data-path="\/[^"]+"/, `${slug}: no data-path`)
    assert.match(block, /data-subsystem="[^"]+"/, `${slug}: no data-subsystem`)
    assert.match(block, /class="tag tag--status"/, `${slug}: no status tag`)
    // readNode() takes title, tagline, status, prose, highlights, metrics and
    // the schema box off these elements — a node missing one loses it from the
    // inspector, the copied spec and the machine rendering alike.
    for (const part of [
      'node__title', 'node__tagline', 'node__desc',
      'node__highlights', 'metrics', 'schema',
    ]) {
      assert.ok(block.includes(part), `${slug}: missing .${part}`)
    }
  }
})

test('the tree, the inspector and the JSON-LD cover the same nodes', () => {
  const tree = [...html.matchAll(/data-node="([^"]+)"/g)].map((m) => m[1])
  assert.deepEqual([...tree].sort(), [...slugs()].sort(), 'the tree and the inspector disagree')
  assert.equal(paths().length, slugs().length, 'a node is missing its path')
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
  assert.equal(ld.hasOfferCatalog.itemListElement.length, slugs().length,
    'every node in the registry needs an OfferCatalog entry')
})

test('no placeholder stands in for an unmeasured metric', () => {
  assert.ok(html.includes('—'), 'em dash for unmeasured metrics')
  assert.doesNotMatch(html, /\bTBD\b|\bn\/a\b/i, 'no placeholder metric values')
})

test('the registry filter affordances exist', () => {
  assert.match(html, /id="registry-filter"/)
  assert.match(html, /id="registry-tags"/)
  assert.match(html, /id="registry-tree"/)
  assert.match(html, /id="registry-inspector"/)
  for (const tag of ['network', 'security', 'fullstack']) {
    assert.match(html, new RegExp(`data-tag="${tag}"`), `missing tag ${tag}`)
  }
})

/* ---------- Task 6: registry filter ---------- */

const NODE = {
  path: '/network/consensus/dtvn',
  title: 'DTVN — Distributed Ticket Validation Network',
  tech: ['Go', 'libp2p', 'PBFT'],
  subsystem: 'network',
}

test('an empty or whitespace query matches everything', () => {
  assert.equal(nodeMatchesQuery(NODE, ''), true)
  assert.equal(nodeMatchesQuery(NODE, '   '), true)
  assert.equal(nodeMatchesQuery(NODE, '\t\n'), true)
  assert.equal(nodeMatchesQuery(NODE, undefined), true)
  assert.equal(nodeMatchesQuery(NODE, null), true)
})

test('regex metacharacters are matched literally and never throw', () => {
  for (const q of ['(', ')', '[', ']', '*', '+', '?', '\\', '^', '$', '.', '|', '{', '}']) {
    assert.doesNotThrow(() => nodeMatchesQuery(NODE, q), `query ${JSON.stringify(q)} threw`)
  }
  assert.equal(nodeMatchesQuery(NODE, '('), false)
  assert.equal(nodeMatchesQuery(NODE, ')'), false)
  assert.equal(nodeMatchesQuery(NODE, 'dtvn'), true)
})

test('matching is case-insensitive across path, title and tech', () => {
  assert.equal(nodeMatchesQuery(NODE, 'DTVN'), true)
  assert.equal(nodeMatchesQuery(NODE, 'dtvn'), true)
  assert.equal(nodeMatchesQuery(NODE, 'libp2p'), true)
  assert.equal(nodeMatchesQuery(NODE, 'LibP2P'), true)
  assert.equal(nodeMatchesQuery(NODE, '/network/'), true)
  assert.equal(nodeMatchesQuery(NODE, 'consensus'), true)
  assert.equal(nodeMatchesQuery(NODE, 'maskbook'), false)
})

test('a tag filters by subsystem, and an empty tag does not filter', () => {
  assert.equal(nodeMatchesQuery(NODE, '', 'network'), true)
  assert.equal(nodeMatchesQuery(NODE, '', 'security'), false)
  assert.equal(nodeMatchesQuery(NODE, '', ''), true)
  assert.equal(nodeMatchesQuery(NODE, 'dtvn', 'security'), false, 'tag wins over query')
})

test('the no-JS path leaves all four articles visible and stacked', () => {
  const s = CSS
  assert.match(s, /html:not\(\.js\)/, 'filter/tree must collapse without JS')
  assert.doesNotMatch(s, /^\.node\s*\{[^}]*display:\s*none/m, 'articles must not be hidden by default')
})

/* ---------- Task 7: inspector actions ---------- */

const FIXTURE = {
  slug: 'dtvn',
  path: '/network/consensus/dtvn',
  subsystem: 'network',
  category: 'consensus',
  title: 'DTVN — Distributed Ticket Validation Network',
  tagline: 'Byzantine fault-tolerant P2P ticket validation system built in Go',
  status: 'VERIFIED',
  revision: '',
  repo: 'https://github.com/Hetti219/DTVN',
  live: '',
  tech: ['Go', 'libp2p'],
  highlights: ['PBFT 3-phase consensus with view change recovery'],
  metrics: [
    { key: 'COMMITS', value: '330+' },
    { key: 'LINES', value: '—' },
  ],
}

test('the spec block carries every field a human can see', () => {
  const spec = nodeToSpec(FIXTURE)
  for (const needle of [
    'DTVN',
    '/network/consensus/dtvn',
    'network / consensus',
    'Go, libp2p',
    'VERIFIED',
    'COMMITS',
    '330+',
    'PBFT 3-phase',
    'https://github.com/Hetti219/DTVN',
  ]) {
    assert.ok(spec.includes(needle), `spec missing: ${needle}`)
  }
})

test('the spec renders unset revision and live link as an em dash, never "undefined"', () => {
  const spec = nodeToSpec(FIXTURE)
  assert.ok(spec.includes('revision:  —'), 'revision should render as an em dash')
  assert.doesNotMatch(spec, /undefined|null|NaN/)
})

test('raw JSON round-trips and preserves em dashes', () => {
  const parsed = JSON.parse(nodeToJson(FIXTURE))
  assert.equal(parsed.slug, 'dtvn')
  assert.equal(parsed.metrics[1].value, '—')
  assert.deepEqual(parsed.tech, ['Go', 'libp2p'])
})

test('every node exposes both copy actions', () => {
  const copySpecs = [...html.matchAll(/data-action="copy-spec"/g)].length
  const rawJsons = [...html.matchAll(/data-action="raw-json"/g)].length
  assert.equal(copySpecs, slugs().length, 'one copy-spec per node')
  assert.equal(rawJsons, slugs().length, 'one raw-json per node')
})

/* ---------- Task 8: schematics and transmissions ---------- */

test('all six runlevels are labelled and carry at least one item', () => {
  const block = html.match(/<dl class="runlevels">[\s\S]*?<\/dl>/)?.[0] ?? ''
  const labels = [...block.matchAll(/<dt>([^<]+)<\/dt>/g)].map((m) => m[1])
  assert.equal(labels.length, 6, `expected six runlevels, found ${labels.length}`)
  for (const l of labels) assert.match(l, /^R\d \/\//, `${l} is not a runlevel label`)
  const items = [...block.matchAll(/<dd>([^<]+)<\/dd>/g)]
  assert.ok(items.length >= labels.length, 'every runlevel needs at least one item')
})

/* ---------- Task 9: dispatch form ---------- */

test('special characters in subject and body survive encoding', () => {
  const url = buildMailto({
    to: 'a@b.com',
    identity: 'n',
    priority: 'P3',
    subject: 'Q3 review & budget #2',
    payload: 'Line one\nLine two',
  })
  const parsed = new URL(url)
  assert.equal(parsed.searchParams.get('subject'), 'Q3 review & budget #2')
  assert.ok(parsed.searchParams.get('body').includes('Line one\nLine two'))
})

test('non-ASCII payloads round-trip', () => {
  const url = buildMailto({ to: 'a@b.com', identity: 'n', priority: 'P3', subject: 'ünïcode', payload: '日本語テスト' })
  const parsed = new URL(url)
  assert.equal(parsed.searchParams.get('subject'), 'ünïcode')
  assert.ok(parsed.searchParams.get('body').includes('日本語テスト'))
})

test('the body carries the sender identity and priority', () => {
  const body = new URL(
    buildMailto({
      to: 'a@b.com',
      identity: 'ACME Corp',
      priority: 'URGENT // P1',
      subject: 's',
      payload: 'p',
    }),
  ).searchParams.get('body')
  assert.ok(body.includes('ACME Corp'))
  assert.ok(body.includes('URGENT // P1'))
  assert.ok(body.includes('p'))
})

test('an empty payload still produces a valid, addressable URL', () => {
  const url = buildMailto({ to: 'a@b.com', identity: '', priority: 'ROUTINE // P3', subject: '', payload: '' })
  assert.ok(url.startsWith('mailto:'))
  assert.doesNotThrow(() => new URL(url))
  assert.equal(new URL(url).searchParams.get('subject'), '(no subject)')
})

test('the default recipient is the real address, not a placeholder', () => {
  assert.equal(DISPATCH_TO, 'sathikahettiarachchi219@gmail.com')
  assert.ok(buildMailto({}).startsWith(`mailto:${DISPATCH_TO}?`))
})

test('the dispatch form carries every §8/04 field', () => {
  for (const id of ['dispatch-form', 'd-identity', 'd-priority', 'd-subject', 'd-payload', 'd-count']) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`)
  }
  for (const p of ['ROUTINE // P3', 'EVALUATION // P2', 'URGENT // P1']) {
    assert.ok(html.includes(p), `missing priority ${p}`)
  }
})

test('all four contact channels are in the HTML as real links', () => {
  for (const href of [
    'mailto:sathikahettiarachchi219@gmail.com',
    'https://github.com/Hetti219',
    'https://www.linkedin.com/in/sathika-hettiarachchi-516112303',
    'https://discord.com/invite/nrhgUBNd',
  ]) {
    assert.ok(html.includes(href), `missing contact link ${href}`)
  }
})

/* ---------- Task 10: machine mode, llms.txt drawer, JSON-LD ---------- */

const MODEL = {
  identity: { name: 'Sathika Hettiarachchi', role: 'Network Engineer × Software Developer' },
  nodes: [{
    slug: 'dtvn', path: '/network/consensus/dtvn', title: 'DTVN', status: 'VERIFIED',
    tagline: 'Byzantine fault-tolerant P2P ticket validation system built in Go',
    tech: ['Go', 'libp2p'], highlights: ['PBFT 3-phase consensus with view change recovery'],
    metrics: [{ key: 'COMMITS', value: '330+' }],
  }],
  runlevels: [{ level: 'R3 // PROVEN', items: ['Go', 'C'] }],
  log: [{ stamp: '2022 — 2026', title: 'BSc (Hons) Computer Networks', org: 'University Education', desc: 'Specialization in network security.' }],
  channels: [{ label: 'Email', value: 'a@b.com', href: 'mailto:a@b.com' }],
}

test('machine mode emits every datum a human can see', () => {
  const md = toMarkdown(MODEL)
  for (const needle of [
    'Sathika Hettiarachchi', 'Network Engineer × Software Developer',
    '/network/consensus/dtvn', 'DTVN', 'VERIFIED',
    'Byzantine fault-tolerant P2P ticket validation system built in Go',
    'Go, libp2p', 'PBFT 3-phase consensus with view change recovery',
    'COMMITS: 330+',
    'R3 // PROVEN', 'BSc (Hons) Computer Networks', 'University Education',
    'a@b.com',
  ]) {
    assert.ok(md.includes(needle), `machine output missing: ${needle}`)
  }
})

test('machine output is markdown, not HTML', () => {
  const md = toMarkdown(MODEL)
  assert.doesNotMatch(md, /<[a-z][^>]*>/i)
})

test('an empty inventory does not emit a dangling heading', () => {
  const md = toMarkdown({ identity: { name: 'X', role: 'Y' }, nodes: [], runlevels: [], log: [], channels: [] })
  assert.doesNotMatch(md, /##\s*$/)
  assert.ok(md.includes('X'))
})

// llms.txt is hand-maintained, so it drifts the moment a node is added to
// index.html without it. This is the check that catches that.
test('llms.txt lists every node in the registry', () => {
  const txt = readFileSync('llms.txt', 'utf8')
  for (const p of paths()) assert.ok(txt.includes(p), `llms.txt missing ${p}`)
  for (const s of slugs()) assert.ok(txt.includes(s), `llms.txt missing ${s}`)
})

test('the JSON-LD block is valid and carries the real identity', () => {
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  assert.ok(raw, 'no JSON-LD block found')
  const data = JSON.parse(raw[1])
  assert.equal(data['@type'], 'Person')
  assert.equal(data.name, 'Sathika Hettiarachchi')
})

/* ---------- Task 11: audio, footer, legacy redirect, 404, robots ---------- */

test('audio is off by default', () => {
  // A site that makes noise before you ask is a hostile first impression, and
  // an eagerly constructed AudioContext earns a browser warning.
  assert.match(readFileSync('app.js', 'utf8'), /let audioOn = false/)
})

test('the footer carries every §4.1 marker', () => {
  for (const marker of ['GitHub Pages', 'STATIC', 'WCAG', 'llms.txt', 'LATENCY']) {
    assert.ok(html.includes(marker), `footer missing: ${marker}`)
  }
  assert.match(html, /id="llms-open"/)
})

test('the legacy hash redirect maps old routes', () => {
  assert.match(html, /location\.hash/)
  for (const legacy of ['#/projects', '#/about', '#/contact']) {
    assert.ok(html.includes(legacy), `legacy route missing: ${legacy}`)
  }
})

test('404 and robots exist and robots permits crawling', () => {
  assert.ok(readFileSync('robots.txt', 'utf8').includes('User-agent: *'))
  assert.ok(readFileSync('404.html', 'utf8').includes('404'))
})

/* ---------- Task 12: budget, no-images, no-JS rendering ---------- */

test('the shipped bundle is under the 45KB gzipped budget (§9)', () => {
  const total = ['index.html', 'styles.css', 'app.js']
    .map((f) => gzipSync(readFileSync(f)).length)
    .reduce((a, b) => a + b, 0)
  assert.ok(total < 45 * 1024, `bundle is ${(total / 1024).toFixed(1)}KB gzipped`)
})

test('no images ship (§9)', () => {
  assert.doesNotMatch(html, /<img\b/i)
})

test('the page works without app.js', () => {
  // Every node's prose is in the markup (asserted above); the rest of the
  // document — skills, history, contact — has to be too.
  assert.ok(html.includes('Distributed Systems (PBFT, Gossip Protocols, Vector Clocks)'))
  assert.ok(html.includes('BSc (Hons) Computer Networks'))
  assert.ok(html.includes('sathikahettiarachchi219@gmail.com'))
})

test('an unmeasurable latency renders as an em dash, never a false 0ms', () => {
  // Sample the load time with performance.now() inside the load listener:
  // the navigation entry's own `duration` reads 0 until loadEventEnd is
  // written, so an entry-based read reports a confident, false 0ms.
  assert.equal(formatLatency(0), '—')
  assert.equal(formatLatency(undefined), '—')
  assert.equal(formatLatency(NaN), '—')
  assert.equal(formatLatency(12.6), '13ms')
  assert.equal(formatLatency(240), '240ms')
  assert.equal(formatLatency(0.4), '—', 'sub-millisecond rounds to 0, which would read as a false zero')
})

test('the no-JS contract hides every inert control, not just the explorer', () => {
  // Without JS the copy buttons do nothing when clicked. The plan's own rule
  // for the filter and tree is "hide what does nothing"; a dead button that
  // looks live is the same defect, so it gets the same rule.
  const sheet = CSS
  const rule = sheet.match(/html:not\(\.js\)[^{]*\{[^}]*\}/g) || []
  const hidden = rule.join('\n')
  for (const sel of ['.filter', '.tree', '[data-action]']) {
    assert.ok(hidden.includes(sel), `no-JS contract does not hide ${sel}`)
  }
})

/* ---------- WCAG 2.2 AA contrast: the footer claims it, so it is checked ---------- */

function ch(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
}
function luminance(hex) {
  const [r, g, b] = ch(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

test('every effective text/background pair clears WCAG 2.2 AA at small-text contrast', () => {
  // Effective pairs, hover and selected states included — a per-rule scan
  // cannot see these, because a hover block often declares only one side of
  // the pair and inherits the other from the cascade.
  const pairs = [
    ['body / base', '#E2E5EC', '#07090E'],
    ['muted / base', '#8490A6', '#07090E'],
    ['muted / surface', '#8490A6', '#0D1117'],
    ['muted / elevated', '#8490A6', '#131924'],
    ['cobalt-pulse / base', '#3B82F6', '#07090E'],
    ['bone / selected tab', '#E2E5EC', '#101A2E'],
    ['dispatch submit label / cobalt-pulse', '#07090E', '#3B82F6'],
    // The hover state is background: transparent, so the page ground shows
    // through beneath cobalt-pulse text. Asserted below, not assumed.
    ['dispatch submit label on hover', '#3B82F6', '#07090E'],
    ['selection text', '#FFFFFF', '#2563EB'],
  ]
  assert.match(CSS, /\.dispatch button:hover\s*\{[^}]*background:\s*transparent/,
    'the hover pair below is only true while the hover state stays transparent')

  for (const [name, fg, bg] of pairs) {
    const r = contrast(fg, bg)
    assert.ok(r >= 4.5, `${name}: ${r.toFixed(2)}:1 is below the 4.5:1 AA floor for small text`)
  }
})

test('the focus ring clears the 3:1 non-text threshold against every surface it sits on', () => {
  for (const bg of ['#07090E', '#0D1117', '#131924']) {
    const r = contrast('#2563EB', bg)
    assert.ok(r >= 3, `focus ring on ${bg}: ${r.toFixed(2)}:1 is below the 3:1 non-text floor`)
  }
})

/* ================= Final review fix pass ================= */

test('without JS the page is navigable, not merely readable', () => {
  // The rewrite's promise is a complete document without scripting. Channels
  // 02-04 are `hidden` in the markup, so with JS off their content — skills,
  // experience, contact — was unreachable behind inert tabs.
  assert.match(CSS, /html:not\(\.js\)[^{]*\[hidden\][^{]*\{[^}]*display:\s*block/,
    'the no-JS rule must reveal the hidden channel sections')
  assert.match(CSS, /html:not\(\.js\)\s+\.channels\s*\{[^}]*display:\s*none/,
    'the tab bar does nothing without JS and must not invite a dead click')

  const form = html.match(/<form[^>]*id="dispatch-form"[^>]*>/)
  assert.ok(form, 'dispatch form missing')
  assert.match(form[0], /action="mailto:/, 'without JS the form must still reach a mail client')
  assert.match(form[0], /method="post"/)
  assert.match(form[0], /enctype="text\/plain"/)
})

test('the single-key shortcuts can be turned off (WCAG 2.1.4)', () => {
  // Single-character shortcuts must offer turn-off, remap or focus-scoping.
  // The design mandates single strokes, so the site ships a turn-off.
  assert.equal(shortcutsActive({ shortcutsOn: true, target: { tagName: 'BODY' } }), true)
  assert.equal(shortcutsActive({ shortcutsOn: false, target: { tagName: 'BODY' } }), false)
  assert.equal(shortcutsActive({ shortcutsOn: true, target: { tagName: 'INPUT' } }), false)
  assert.equal(shortcutsActive({ shortcutsOn: false, target: { tagName: 'INPUT' } }), false)
  assert.equal(shortcutsActive({ shortcutsOn: true, target: { isContentEditable: true } }), false)

  assert.match(html, /<button[^>]*id="keys-toggle"[^>]*aria-pressed="true"/,
    'the shortcut off switch must exist and start pressed (shortcuts live)')
  assert.match(html, /id="keys-toggle"[^>]*>\s*KEYS ON/, 'and must say what it does')
})

test('a deep link to an unknown node does not blank the inspector', () => {
  const known = ['dtvn', 'maskbook']
  assert.equal(resolveNodeSlug('dtvn', known), 'dtvn')
  assert.equal(resolveNodeSlug('nope', known), null)
  assert.equal(resolveNodeSlug(undefined, known), null)
  assert.equal(resolveNodeSlug('', known), null)
  assert.equal(resolveNodeSlug('dtvn', []), null)
})

test('the llms.txt trigger is announced as a dialog opener', () => {
  const btn = html.match(/<button[^>]*id="llms-open"[^>]*>/)
  assert.ok(btn, '#llms-open missing')
  assert.match(btn[0], /aria-haspopup="dialog"/)
  assert.match(btn[0], /aria-expanded="false"/)
  assert.match(html, /<div class="modal" id="llms-modal"[^>]*hidden/)
})

test('machine mode emits the project prose and the schema block the GUI shows', () => {
  const md = toMarkdown({
    identity: { name: 'X', role: 'Y' },
    nodes: [{
      ...MODEL.nodes[0],
      desc: 'Event ticketing has a double-spend problem.',
      schema: 'node:      dtvn\nfault:     tolerates f < n/3 Byzantine',
    }],
    runlevels: [], log: [], channels: [],
  })
  assert.ok(md.includes('Event ticketing has a double-spend problem.'), 'prose missing from machine output')
  assert.ok(md.includes('tolerates f < n/3 Byzantine'), 'schema extras missing from machine output')
})

test('machine mode does not hide the control that leaves it', () => {
  // The OPTIC toggle lives in the chrono bar. Hiding the whole bar with
  // `html.optic-machine .chrono` stranded the visitor in machine mode, with
  // an undiscoverable `m` keypress or a reload as the only way back — and `m`
  // is itself disabled when KEYS is off. Only the readouts may be hidden.
  assert.doesNotMatch(CSS, /html\.optic-machine \.chrono[\s,{]/,
    'the chrono bar carries the optic toggle and must survive machine mode')
  assert.match(CSS, /html\.optic-machine \.chrono__seg:not\(\.chrono__seg--end\)/,
    'the telemetry readouts should still be hidden')
})

test('the js class is set before first paint, not by the deferred module', () => {
  // Otherwise a cold cache paints the all-articles no-JS layout and then
  // collapses it, which is a large layout shift on a site built to avoid one.
  assert.match(html, /<script>document\.documentElement\.classList\.add\('js'\)<\/script>/,
    'the js class must be set by an inline head script, ahead of the deferred module')
})

test('every element app.js looks up by id exists in the shipped markup', () => {
  const js = readFileSync('app.js', 'utf8')
  const markup = html + readFileSync('404.html', 'utf8')
  const ids = new Set([...js.matchAll(/\$\(['"]([a-zA-Z0-9-]+)['"]\)/g)].map((m) => m[1]))
  assert.ok(ids.size >= 10, `expected the id lookups, found ${ids.size}`)
  for (const id of ids) {
    assert.ok(markup.includes(`id="${id}"`), `app.js looks up #${id}, which no shipped page defines`)
  }
})
