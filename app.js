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

  /* Forward declarations. Tasks 6 and 10 REPLACE these bodies in place —
     appending a second declaration would compile and silently shadow. */
  function applyFilter() {}
  function clearFilter() {}
  function selectNode() {}
  function isModalOpen() {
    return false
  }
  function closeModal() {}
  function toggleOptic() {}

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
}
