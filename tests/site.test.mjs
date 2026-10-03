import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

test('the React/Vite stack is gone', () => {
  for (const p of ['src', 'public', 'package.json', 'vite.config.js', 'eslint.config.js']) {
    assert.equal(existsSync(p), false, `${p} should have been deleted`)
  }
})

test('the static skeleton exists', () => {
  for (const p of ['index.html', 'styles.css', 'app.js', 'favicon.svg', '.nojekyll']) {
    assert.ok(existsSync(p), `${p} should exist`)
  }
})

/* ---------- Task 2: design tokens, typography, motion ---------- */

const css = () => readFileSync('styles.css', 'utf8')

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
    assert.match(css(), new RegExp(`${token}\\s*:\\s*${hex}`, 'i'), `${token} must be ${hex}`)
  }
})

test('the type scale uses the six §3.2 sizes and nothing else', () => {
  const scale = {
    '--fs-overline': '10px',
    '--fs-timestamp': '11px',
    '--fs-body': '12px',
    '--fs-section': '14px',
    '--fs-node': '18px',
    '--fs-ident': '24px',
  }
  for (const [token, size] of Object.entries(scale)) {
    assert.match(css(), new RegExp(`${token}\\s*:\\s*${size}`), `${token} must be ${size}`)
  }
})

test('the coordinate grid uses the 32px value from the spec CSS, not the 24px prose', () => {
  assert.match(css(), /background-size:\s*32px\s+32px/)
  assert.doesNotMatch(css(), /background-size:\s*24px/)
})

test('every border-radius declaration is zero, and nothing is blurred', () => {
  const radii = [...css().matchAll(/border-radius:\s*([^;]+)/g)].map((m) => m[1].trim())
  assert.ok(radii.length > 0, 'expected the universal reset to declare border-radius: 0')
  for (const r of radii) assert.equal(r, '0', `non-zero border-radius: ${r}`)
  assert.doesNotMatch(css(), /backdrop-filter|filter:\s*blur/)
})

test('the vault-door easing and duration match §5.1', () => {
  assert.match(css(), /--ease-vault:\s*cubic-bezier\(0\.16,\s*1,\s*0\.3,\s*1\)/)
  assert.match(css(), /--dur-vault:\s*380ms/)
})

test('reduced motion is respected', () => {
  assert.match(css(), /@media \(prefers-reduced-motion: reduce\)/)
})

/* ---------- Task 3: telemetry bar and 1Hz escapement ---------- */

import { formatUTC, formatLocal, channelForKey } from '../app.js'

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
  const html = readFileSync('index.html', 'utf8')
  for (const id of ['utc', 'local', 'dom-count', 'viewport', 'led', 'audio-toggle', 'optic-toggle']) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`)
  }
  assert.match(html, /NODE\/\/SYS-0x89/)
})

test('the telemetry markup and the main region do not share an id', () => {
  const html = readFileSync('index.html', 'utf8')
  assert.match(html, /id="viewport-root"/)
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
  assert.deepEqual(dupes, [], `duplicate ids: ${dupes.join(', ')}`)
})

/* ---------- Task 4: channel selector and keyboard dispatch ---------- */

import { shouldIgnoreKey, nextEscapeAction } from '../app.js'

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
  const html = readFileSync('index.html', 'utf8')
  assert.match(html, /id="channel-bar"/)
  for (const c of ['registry', 'schematics', 'transmissions', 'comm']) {
    assert.match(html, new RegExp(`id="channel-${c}"`), `missing #channel-${c}`)
  }
})

test('channel 04 is not labelled encrypted — mailto encrypts nothing', () => {
  const html = readFileSync('index.html', 'utf8')
  assert.match(html, /04 COMM \/\/ DISPATCH/)
  assert.doesNotMatch(html, /[Ee]ncrypted/)
})

/* ---------- Task 5: registry content ---------- */

const PROJECTS = [
  { slug: 'dtvn', path: '/network/consensus/dtvn', subsystem: 'network', status: 'VERIFIED' },
  { slug: 'tcp-syn-flood-detector', path: '/security/kernel/tcp-syn-flood-detector', subsystem: 'security', status: 'VERIFIED' },
  { slug: 'exif-toolkit', path: '/security/mobile/exif-toolkit', subsystem: 'security', status: 'OPERATIONAL' },
  { slug: 'maskbook', path: '/fullstack/web/maskbook', subsystem: 'fullstack', status: 'OPERATIONAL' },
]

test('every project node is present in the raw HTML with its full path', () => {
  const html = readFileSync('index.html', 'utf8')
  for (const p of PROJECTS) {
    assert.match(html, new RegExp(`data-slug="${p.slug}"`), `${p.slug} missing`)
    assert.match(html, new RegExp(`data-path="${p.path}"`), `${p.path} missing`)
    assert.match(html, new RegExp(`data-status="${p.status}"`), `${p.slug} status missing`)
  }
})

test('every project tagline and highlight is verbatim in the HTML', () => {
  const html = readFileSync('index.html', 'utf8')
  const content = {
    dtvn: {
      tagline: 'Byzantine fault-tolerant P2P ticket validation system built in Go',
      highlights: [
        'PBFT 3-phase consensus with view change recovery',
        'Gossip protocol with Bloom filter deduplication and anti-entropy sync',
        'libp2p networking with Kademlia DHT peer discovery',
        'Vector clocks for causality tracking and conflict resolution',
        'Web dashboard with D3.js network topology visualization',
        'Byzantine fault tolerance simulator with network partition testing',
        '~12,800 lines of Go with ~8,300 lines of tests',
      ],
    },
    'tcp-syn-flood-detector': {
      tagline: 'High-performance userspace daemon for real-time DDoS detection and mitigation',
      highlights: [
        '65,000+ PPS throughput with ~45ms detection latency',
        'Dual capture: NFQUEUE (primary) and raw socket + BPF (fallback)',
        'Sliding window rate limiting with /proc/net/tcp SYN_RECV validation',
        '13 test suites including AFL++ fuzzing',
        'Security-hardened: CAP_NET_ADMIN + CAP_NET_RAW only, no full root',
        'CodeQL security scanning and CI/CD pipeline',
      ],
    },
    'exif-toolkit': {
      tagline: 'Mobile forensics tool for image metadata manipulation',
      highlights: [
        'View, edit, and strip EXIF metadata',
        'Firebase cloud integration',
        'Cross-platform mobile support',
        'Digital forensics and privacy use cases',
      ],
    },
    maskbook: {
      tagline: 'Full-stack social platform with authentication and real-time features',
      highlights: [
        'User authentication and session management',
        'Real-time social interactions',
        'MySQL database design',
        'Responsive frontend',
      ],
    },
  }
  for (const [slug, c] of Object.entries(content)) {
    assert.ok(html.includes(c.tagline), `${slug}: tagline not in raw HTML`)
    for (const h of c.highlights) {
      assert.ok(html.includes(h), `${slug}: highlight not in raw HTML: ${h}`)
    }
  }
})

test('every project description is in the HTML, not fetched', () => {
  const html = readFileSync('index.html', 'utf8')
  const fragments = [
    'Event ticketing has a double-spend problem',
    'A C11 daemon that detects and mitigates TCP SYN flood attacks',
    'A Flutter/Firebase mobile application for viewing, editing, and stripping EXIF metadata',
    'A complete social media platform built with PHP and MySQL',
  ]
  for (const f of fragments) assert.ok(html.includes(f), `description missing: ${f}`)
})

test('the metric grid reports real values and an em dash where unmeasured', () => {
  const html = readFileSync('index.html', 'utf8')
  assert.ok(html.includes('330+'), 'DTVN commits')
  assert.ok(html.includes('~12,800'), 'DTVN lines')
  assert.ok(html.includes('~8,300 lines'), 'DTVN tests')
  assert.ok(html.includes('101+'), 'SYN detector commits')
  assert.ok(html.includes('13 suites'), 'SYN detector test suites')
  assert.ok(html.includes('65,000+'), 'SYN detector throughput')
  assert.ok(html.includes('~45ms'), 'SYN detector latency')
  assert.ok(html.includes('—'), 'em dash for unmeasured metrics')
  assert.doesNotMatch(html, /\bTBD\b|\bn\/a\b/i, 'no placeholder metric values')
})

test('the doctrine block carries a region derived without geolocation', () => {
  const html = readFileSync('index.html', 'utf8')
  assert.match(html, /id="region"/)
  assert.doesNotMatch(html, /geolocation/i)
})

test('the registry filter affordances exist', () => {
  const html = readFileSync('index.html', 'utf8')
  assert.match(html, /id="registry-filter"/)
  assert.match(html, /id="registry-tags"/)
  assert.match(html, /id="registry-tree"/)
  assert.match(html, /id="registry-inspector"/)
  for (const tag of ['network', 'security', 'fullstack']) {
    assert.match(html, new RegExp(`data-tag="${tag}"`), `missing tag ${tag}`)
  }
})
