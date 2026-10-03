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

/* ------------------------------- browser only ---------------------------- */

if (typeof document !== 'undefined') {
  const $ = (id) => document.getElementById(id)

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

  /* Forward declarations. Task 10 REPLACES these three bodies in place —
     appending a second declaration would compile and silently shadow. */
  function isModalOpen() {
    return false
  }
  function closeModal() {}
  function toggleOptic() {}

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
}
