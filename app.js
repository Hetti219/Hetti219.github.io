/* ==========================================================================
   System Operator Portfolio — progressive enhancement layer.

   Contract: every word of content is already in index.html before this file
   runs. Everything here shows, hides, filters or reformats that content. It
   never fetches or constructs it. That is what keeps the page crawlable.

   The pure helpers at the top are exported so `tests/site.test.mjs` can
   exercise them under Node. Everything that touches the DOM sits behind the
   `typeof document` guard below, so importing this file outside a browser is
   side-effect free.
   ========================================================================== */

const pad2 = (n) => String(n).padStart(2, '0')

/** §5.2 — 24-hour ISO clock, no sub-millisecond flicker. */
export function formatUTC(d) {
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}Z`
}

export function formatLocal(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

/** §6.2 — single-stroke channel dispatch. */
export function channelForKey(key) {
  return { 1: 'registry', 2: 'schematics', 3: 'transmissions', 4: 'comm' }[key] ?? null
}

/**
 * §6.2 — shortcuts are intercepted "when inputs are not focused". Typing `1`
 * into the dispatch subject must insert a `1`, not switch channels.
 */
export function shouldIgnoreKey(target) {
  if (!target) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * §6.2 — Escape resolves to exactly one step of the cascade:
 * dismiss modal → blur input → clear filters. Never two in one press.
 */
export function nextEscapeAction({ modalOpen, inputFocused, filterActive }) {
  if (modalOpen) return 'modal'
  if (inputFocused) return 'blur'
  if (filterActive) return 'clear-filter'
  return null
}

/**
 * §6.1 — instant filtering over path, title and stack.
 *
 * The query is NEVER compiled into a RegExp. A literal substring test is what
 * makes `(`, `[` and `\` safe to type: a visitor who types a parenthesis gets
 * an empty result, not a thrown SyntaxError and a blank panel.
 */
export function nodeMatchesQuery(node, query, tag = '') {
  if (tag && node.subsystem !== tag) return false
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return true
  const haystack = [node.path, node.title, ...(node.tech ?? [])].join(' ').toLowerCase()
  return haystack.includes(q)
}

/**
 * §8/03 "Copy Spec" — the node as a monospace spec sheet. Every field the
 * inspector shows to a human appears here, so copying yields the same data.
 * `—` stands in for unset values; `undefined` must never reach the clipboard.
 */
export function nodeToSpec(n) {
  const lines = [
    `node:      ${n.slug}`,
    `path:      ${n.path}`,
    `subsystem: ${n.subsystem} / ${n.category}`,
    `title:     ${n.title}`,
    `status:    ${n.status}`,
    `revision:  ${n.revision || '—'}`,
    `stack:     ${(n.tech ?? []).join(', ')}`,
  ]

  if (n.highlights?.length) {
    lines.push('', 'highlights:')
    for (const h of n.highlights) lines.push(`  - ${h}`)
  }

  if (n.metrics?.length) {
    lines.push('', 'metrics:')
    for (const m of n.metrics) lines.push(`  ${m.key}: ${m.value}`)
  }

  if (n.repo) lines.push('', `repo: ${n.repo}`)
  if (n.live) lines.push(`live: ${n.live}`)

  return lines.join('\n')
}

/** §8/03 "Raw JSON" — the same node as structured data. */
export function nodeToJson(n) {
  return JSON.stringify(n, null, 2)
}

/** §8/04 — the dispatch destination. Not a placeholder: this is the real inbox. */
export const DISPATCH_TO = 'sathikahettiarachchi219@gmail.com'

/**
 * §8/04 — compose a `mailto:` message from the dispatch form.
 *
 * `URLSearchParams` does the encoding. A hand-built query string truncates at
 * the first `&` in the subject — "Q3 review & budget" would arrive as
 * "Q3 review " and silently lose the rest.
 */
export function buildMailto({
  to = DISPATCH_TO,
  identity = '',
  priority = 'ROUTINE // P3',
  subject = '',
  payload = '',
} = {}) {
  const body = [`SENDER:   ${identity || '—'}`, `PRIORITY: ${priority}`, '', payload].join('\n')
  const params = new URLSearchParams({ subject: subject || '(no subject)', body })
  return `mailto:${to}?${params}`
}

/**
 * §7.1 "Dual-Optic Symmetry" — the machine rendering of the page.
 *
 * The model is read back off the DOM (`readModel`), not from a second
 * hand-authored copy, so this output cannot drift from what a human sees.
 */
export function toMarkdown(model) {
  const out = []
  const { identity = {}, nodes = [], runlevels = [], log = [], channels = [] } = model ?? {}

  out.push(`# ${identity.name ?? ''}`.trim())
  if (identity.role) out.push('', identity.role)

  if (nodes.length) {
    out.push('', '## Project Inventory', '')
    for (const n of nodes) {
      out.push(`### ${n.title}`, '')
      out.push(`- path: \`${n.path}\``)
      out.push(`- status: ${n.status}`)
      for (const [k, v] of [['revision', n.revision], ['repo', n.repo], ['live', n.live]]) {
        if (v) out.push(`- ${k}: ${v}`)
      }
      out.push(`- stack: ${(n.tech ?? []).join(', ')}`)
      if (n.tagline) out.push('', n.tagline)
      if (n.highlights?.length) {
        out.push('')
        for (const h of n.highlights) out.push(`- ${h}`)
      }
      if (n.metrics?.length) {
        out.push('')
        for (const m of n.metrics) out.push(`- ${m.key}: ${m.value}`)
      }
      out.push('')
    }
  }

  if (runlevels.length) {
    out.push('## Runlevels', '')
    for (const r of runlevels) out.push(`- **${r.level}** — ${r.items.join(', ')}`)
    out.push('')
  }

  if (log.length) {
    out.push('## Log', '')
    for (const e of log) {
      out.push(`- **${e.stamp}** ${e.title}${e.org ? ` — ${e.org}` : ''}`)
      if (e.desc) out.push(`  ${e.desc}`)
    }
    out.push('')
  }

  if (channels.length) {
    out.push('## Channels', '')
    for (const c of channels) out.push(`- ${c.label}: ${c.value}`)
    out.push('')
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

/* ------------------------------- browser only ---------------------------- */

if (typeof document !== 'undefined') {
  const $ = (id) => document.getElementById(id)

  /** §5.2 — discrete 1Hz escapement. One tick per second, no sweeping. */
  /* ------------------------ §5.3 acoustic feedback ----------------------- */

  // Off by default, and the AudioContext is never constructed until a user
  // gesture asks for it — an autoplaying context is both a browser warning
  // and a hostile first impression.
  let audioOn = false
  let audioCtx = null

  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      audioCtx = new Ctx()
    }
    if (audioCtx.state === 'suspended') audioCtx.resume()
    return audioCtx
  }

  /* §5.3 microswitch: sine 1200Hz → 120Hz over 7ms, high-pass 800Hz, gain 0.04 */
  function blip() {
    if (!audioOn) return
    const ctx = ensureAudio()
    if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 800
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, t)
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.007)
    gain.gain.setValueAtTime(0.04, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.007)
    osc.connect(hp).connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.008)
  }

  /* §5.3 chronometer tick: 1800Hz, 4ms, gain 0.015 */
  function tickSound() {
    if (!audioOn) return
    const ctx = ensureAudio()
    if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1800, t)
    gain.gain.setValueAtTime(0.015, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.004)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.005)
  }

  document.getElementById('audio-toggle')?.addEventListener('click', (e) => {
    audioOn = !audioOn
    e.currentTarget.setAttribute('aria-pressed', String(audioOn))
    e.currentTarget.textContent = audioOn ? 'AUDIO ON' : 'AUDIO OFF'
    if (audioOn) blip()
  })

  /** §5.2 — discrete 1Hz escapement. One tick per second, no sweeping. */
  function tick() {
    const now = new Date()
    const utc = $('utc')
    const local = $('local')
    const dom = $('dom-count')
    const led = $('led')

    if (utc) utc.textContent = formatUTC(now)
    if (local) local.textContent = formatLocal(now)
    if (dom) dom.textContent = String(document.getElementsByTagName('*').length)
    if (led) {
      led.style.opacity = '0.2'
      setTimeout(() => {
        led.style.opacity = '1'
      }, 120)
    }
    tickSound()
  }

  function resize() {
    const vp = $('viewport')
    if (vp) vp.textContent = `${window.innerWidth}×${window.innerHeight}`
  }

  /**
   * §4.1 "Physical Coordinates" — timezone/region only. No Geolocation
   * prompt: a portfolio has not earned a location permission dialog.
   * `resolvedOptions().timeZone` is undefined on some engines, hence the
   * fallback rather than a bare assignment.
   */
  function setRegion() {
    const el = $('region')
    if (!el) return
    let region = ''
    try {
      region = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
    } catch {
      region = ''
    }
    el.textContent = region ? region.replace(/_/g, ' ') : '—'
  }

  tick()
  setInterval(tick, 1000)
  resize()
  setRegion()
  addEventListener('resize', resize)

  /* ------------------------- §6.2 channel dispatch ----------------------- */

  document.documentElement.classList.add('js')

  const CHANNELS = ['registry', 'schematics', 'transmissions', 'comm']

  // Captured before setChannel rewrites the hash, so a `?node=` deep link
  // survives to be read later.
  const INITIAL_HASH = location.hash
  const INITIAL_CHANNEL = INITIAL_HASH.slice(1).split('?')[0]

  function setChannel(name) {
    if (!CHANNELS.includes(name)) return
    for (const c of CHANNELS) {
      const section = document.getElementById(`channel-${c}`)
      const tab = document.querySelector(`[data-channel="${c}"]`)
      if (section) section.hidden = c !== name
      if (tab) {
        const on = c === name
        tab.setAttribute('aria-selected', String(on))
        const glyph = tab.querySelector('.glyph')
        if (glyph) glyph.textContent = on ? '▸' : '·'
      }
    }
    history.replaceState(null, '', `#${name}`)
  }

  document.getElementById('channel-bar')?.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-channel]')
    if (tab) setChannel(tab.dataset.channel)
  })

  /* --------------------- §7.1 dual-optic machine mode -------------------- */

  /**
   * The machine model is read off the live DOM. Authored twice it would
   * drift; read once it cannot.
   */
  function readModel() {
    const name = document.querySelector('.doctrine__name')?.textContent.trim() ?? ''
    const role = document.querySelector('.doctrine__role')?.textContent.trim() ?? ''
    return {
      identity: { name, role },
      nodes: [...document.querySelectorAll('.node')].map(readNodeFull),
      runlevels: [...document.querySelectorAll('.runlevels > div')].map((d) => ({
        level: d.querySelector('dt').textContent.trim(),
        items: [...d.querySelectorAll('dd')].map((x) => x.textContent.trim()),
      })),
      log: [...document.querySelectorAll('.log__entry')].map((l) => ({
        stamp: l.querySelector('.log__stamp').textContent.trim(),
        title: l.querySelector('.log__title').textContent.trim(),
        org: l.querySelector('.log__org')?.textContent.trim() ?? '',
        desc: l.querySelector('.log__desc')?.textContent.trim() ?? '',
      })),
      channels: [...document.querySelectorAll('.channels-list > div')].map((c) => ({
        label: c.querySelector('dt').textContent.trim(),
        value: c.querySelector('dd').textContent.trim(),
        href: c.querySelector('a')?.getAttribute('href') ?? '',
      })),
    }
  }

  let machine = false

  /** §7.3 — OPTIC toggle. One keystroke from the rendered page to plain text. */
  function toggleOptic() {
    machine = !machine
    document.documentElement.classList.toggle('optic-machine', machine)
    const btn = document.getElementById('optic-toggle')
    if (btn) {
      btn.textContent = machine ? 'OPTIC: MACHINE' : 'OPTIC: GUI'
      btn.setAttribute('aria-pressed', String(machine))
    }
    let pane = document.getElementById('machine-pane')
    if (machine) {
      if (!pane) {
        pane = document.createElement('pre')
        pane.id = 'machine-pane'
        pane.className = 'machine'
        document.getElementById('viewport-root').append(pane)
      }
      pane.textContent = toMarkdown(readModel())
    } else if (pane) {
      pane.remove()
    }
  }

  document.getElementById('optic-toggle')?.addEventListener('click', () => {
    blip()
    toggleOptic()
  })

  /* ------------------------ §7.3 llms.txt drawer ------------------------- */

  function isModalOpen() {
    const m = document.getElementById('llms-modal')
    return Boolean(m && !m.hidden)
  }

  function closeModal() {
    const m = document.getElementById('llms-modal')
    if (m) m.hidden = true
  }

  document.getElementById('llms-open')?.addEventListener('click', async () => {
    const modal = document.getElementById('llms-modal')
    const body = document.getElementById('llms-body')
    if (!modal || !body) return
    if (body.dataset.loaded !== 'yes') {
      try {
        const res = await fetch('/llms.txt')
        body.textContent = await res.text()
        body.dataset.loaded = 'yes'
      } catch {
        // offline, file://, or the fetch was blocked — the modal still opens
        body.textContent = 'llms.txt unavailable offline.'
      }
    }
    modal.hidden = false
    document.getElementById('llms-close')?.focus()
  })

  document.getElementById('llms-close')?.addEventListener('click', closeModal)

  document.getElementById('llms-copy')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget
    const original = btn.textContent
    try {
      await navigator.clipboard.writeText(document.getElementById('llms-body').textContent)
      btn.textContent = 'COPIED'
    } catch {
      btn.textContent = 'COPY BLOCKED'
    }
    setTimeout(() => {
      btn.textContent = original
    }, 1200)
  })

  /* ------------------------- §6.1 registry filtering -------------------- */

  function readNode(el) {
    return {
      slug: el.dataset.slug,
      path: el.dataset.path,
      title: el.dataset.title,
      subsystem: el.dataset.subsystem,
      tech: (el.dataset.tech || '').split(',').filter(Boolean),
    }
  }

  let activeTag = ''
  let selectedSlug = null

  /** §8/03 — selecting a node updates the inspector without a reload. */
  function selectNode(slug) {
    selectedSlug = slug
    for (const article of document.querySelectorAll('.node')) {
      article.hidden = article.dataset.slug !== slug
    }
    for (const item of document.querySelectorAll('.tree__item')) {
      const on = item.dataset.node === slug
      item.setAttribute('aria-current', String(on))
      const glyph = item.querySelector('.glyph')
      if (glyph) glyph.textContent = on ? '▸' : '·'
    }
  }

  function applyFilter() {
    const input = document.getElementById('registry-filter')
    const query = input ? input.value : ''
    let firstVisible = null

    for (const item of document.querySelectorAll('.tree__item')) {
      const article = document.getElementById(`node-${item.dataset.node}`)
      if (!article) continue
      const hit = nodeMatchesQuery(readNode(article), query, activeTag)
      const li = item.closest('li')
      if (li) li.hidden = !hit
      if (hit && !firstVisible) firstVisible = item.dataset.node
    }

    // Keep the current selection if it survived the filter. When nothing
    // matches, leave the last inspector contents up rather than blanking it.
    const current = document.querySelector(`.tree__item[data-node="${selectedSlug}"]`)
    if (current && !current.closest('li').hidden) return
    if (firstVisible) selectNode(firstVisible)
  }

  function clearFilter() {
    const input = document.getElementById('registry-filter')
    if (input) input.value = ''
    activeTag = ''
    for (const b of document.querySelectorAll('#registry-tags button')) {
      b.setAttribute('aria-pressed', String(b.dataset.tag === ''))
    }
    applyFilter()
  }

  document.getElementById('registry-filter')?.addEventListener('input', applyFilter)

  document.getElementById('registry-tags')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tag]')
    if (!btn) return
    activeTag = btn.dataset.tag
    for (const b of document.querySelectorAll('#registry-tags button')) {
      b.setAttribute('aria-pressed', String(b === btn))
    }
    applyFilter()
  })

  document.getElementById('registry-tree')?.addEventListener('click', (e) => {
    const item = e.target.closest('.tree__item')
    if (item) selectNode(item.dataset.node)
  })

  /* §8/03 "Direct Action Group" — read the node back off the DOM, so the
     copied text can never drift from what is on screen. */
  function readNodeFull(el) {
    return {
      slug: el.dataset.slug,
      path: el.dataset.path,
      subsystem: el.dataset.subsystem,
      category: el.dataset.category,
      title: el.dataset.title,
      tagline: el.dataset.tagline,
      status: el.dataset.status,
      revision: el.dataset.revision,
      repo: el.dataset.repo,
      live: el.dataset.live,
      tech: (el.dataset.tech || '').split(',').filter(Boolean),
      highlights: [...el.querySelectorAll('.node__highlights li')].map((li) => li.textContent.trim()),
      metrics: [...el.querySelectorAll('.metrics > div')].map((d) => ({
        key: d.querySelector('dt').textContent.trim(),
        value: d.querySelector('dd').textContent.trim(),
      })),
    }
  }

  document.getElementById('registry-inspector')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]')
    if (!btn) return
    const article = btn.closest('.node')
    if (!article) return

    const node = readNodeFull(article)
    const text = btn.dataset.action === 'copy-spec' ? nodeToSpec(node) : nodeToJson(node)
    const original = btn.textContent

    try {
      await navigator.clipboard.writeText(text)
      btn.textContent = 'COPIED'
    } catch {
      // clipboard is unavailable over http:// and in some embedded browsers
      btn.textContent = 'COPY BLOCKED'
    }
    setTimeout(() => {
      btn.textContent = original
    }, 1200)
  })

  /* -------------------- §8/04 terminal dispatch form --------------------- */

  const payloadField = $('d-payload')
  const countField = $('d-count')
  if (payloadField && countField) {
    const updateCount = () => {
      countField.textContent = String(payloadField.value.length)
    }
    payloadField.addEventListener('input', updateCount)
    updateCount()
  }

  $('dispatch-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const form = e.currentTarget
    location.href = buildMailto({
      identity: form.identity.value,
      priority: form.priority.value,
      subject: form.subject.value,
      payload: form.payload.value,
    })
  })

  function filterIsActive() {
    const input = document.getElementById('registry-filter')
    return Boolean(input && input.value)
  }

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return

    if (shouldIgnoreKey(e.target)) {
      // Escape still walks the cascade from inside a field — but its first
      // live step is the blur, and one press advances it by one step only.
      if (e.key === 'Escape') {
        const action = nextEscapeAction({
          modalOpen: isModalOpen(),
          inputFocused: true,
          filterActive: filterIsActive(),
        })
        if (action === 'modal') closeModal()
        else if (action === 'blur') e.target.blur()
      }
      return
    }

    if (e.key === 'Escape') {
      const action = nextEscapeAction({
        modalOpen: isModalOpen(),
        inputFocused: false,
        filterActive: filterIsActive(),
      })
      if (action === 'modal') closeModal()
      else if (action === 'clear-filter') clearFilter()
      return
    }

    if (e.key === '/') {
      e.preventDefault()
      document.getElementById('registry-filter')?.focus()
      return
    }

    if (e.key === 'm' || e.key === 'M') {
      toggleOptic()
      return
    }

    const channel = channelForKey(e.key)
    if (channel) setChannel(channel)
  })

  setChannel(CHANNELS.includes(INITIAL_CHANNEL) ? INITIAL_CHANNEL : 'registry')
  applyFilter()

  /* ------------------------- §4.1 anchored footer ------------------------ */

  const navEntry = performance.getEntriesByType?.('navigation')?.[0]
  const latency = $('latency')
  if (latency && navEntry) latency.textContent = `${Math.round(navEntry.duration)}ms`

  // §6.1 deep link. Reads INITIAL_HASH, not location.hash — setChannel has
  // already rewritten the latter to the bare channel name.
  const deepNode = new URLSearchParams(INITIAL_HASH.split('?')[1] ?? '').get('node')
  if (deepNode) selectNode(deepNode)
}
