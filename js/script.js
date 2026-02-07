function smoothScrollToId(targetId) {
  const target = document.getElementById(targetId)
  if (!target) return false

  target.scrollIntoView({ behavior: 'smooth' })
  return true
}

function bindSmoothScrollTrigger(triggerId, targetId) {
  const trigger = document.getElementById(triggerId)
  if (!trigger) return

  trigger.addEventListener('click', (event) => {
    event.preventDefault()
    smoothScrollToId(targetId)
  })
}

function setupInPageSmoothScroll() {
  bindSmoothScrollTrigger('my-work-link', 'my-work-section')

  document.addEventListener('click', (event) => {
    const anchor = event.target?.closest?.('a')
    if (!anchor) return

    const href = anchor.getAttribute('href')
    if (!href || href === '#' || !href.startsWith('#')) return

    const targetId = href.slice(1)
    if (!targetId) return

    event.preventDefault()
    const didScroll = smoothScrollToId(targetId)
    if (!didScroll) return
  })
}

function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch (_) {
    // ignore
  }
}

function getSavedTheme() {
  try {
    return localStorage.getItem('theme')
  } catch (_) {
    return null
  }
}

function normaliseRoot(root) {
  if (!root) return './'
  return root.endsWith('/') ? root : `${root}/`
}

function getRoot() {
  return normaliseRoot(document.body?.dataset?.root ?? './')
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle')
  if (!toggle) return

  toggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'light'
    applyTheme(current === 'dark' ? 'light' : 'dark')
  })
}

async function injectHtmlPartial({ mountId, paths, transform, fallbackHtml, afterInject }) {
  const mount = document.getElementById(mountId)
  if (!mount) return

  try {
    let response = null
    for (const path of paths) {
      response = await fetch(path, { cache: 'no-cache' })
      if (response.ok) break
    }

    if (!response || !response.ok) {
      throw new Error(`Failed to load ${mountId}: ${response?.status || 'unknown'}`)
    }

    const html = await response.text()
    mount.innerHTML = transform ? transform(html) : html
  } catch (e) {
    if (fallbackHtml != null) {
      mount.innerHTML = fallbackHtml
    }
    console.warn(e)
  } finally {
    afterInject?.()
  }
}

async function injectNavbar() {
  const root = getRoot()
  const paths = [`${root}partials/navbar.include`, `${root}partials/navbar.html`]

  await injectHtmlPartial({
    mountId: 'navbar',
    paths,
    // Some dev servers inject scripts into `.html` responses; use the non-HTML snippet when possible.
    transform: (html) => html.replaceAll('{{ROOT}}', root),
    afterInject: setupThemeToggle,
  })
}

function applyFooterYear() {
  const mount = document.getElementById('footer')
  if (!mount) return

  const yearEl = mount.querySelector('[data-footer-year]')
  if (!yearEl) return

  yearEl.textContent = String(new Date().getFullYear())
}

async function injectFooter() {
  const root = getRoot()
  const paths = [`${root}partials/footer.include`, `${root}partials/footer.html`]

  await injectHtmlPartial({
    mountId: 'footer',
    paths,
    transform: (html) => html.replaceAll('{{ROOT}}', root),
    fallbackHtml: '<div class="footer-text">© <span data-footer-year></span> Guney Coban</div>',
    afterInject: applyFooterYear,
  })
}

// Ensure a deterministic default (light) unless user previously picked.
if (!document.documentElement.dataset.theme) {
  applyTheme(getSavedTheme() || 'light')
}

setupInPageSmoothScroll()
injectNavbar()
injectFooter()
