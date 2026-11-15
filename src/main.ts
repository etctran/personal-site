import './styles/tokens.css'
import './styles/site.css'
import './styles/scroll.css'
import { site, projects, experience, about } from './content'
import { renderFacts, renderProjects, renderExperience, renderAbout, renderContact } from './render'
import { initName } from './name'
import { initInk } from './ink'
import { initField } from './field'

function fill(selector: string, html: string): void {
  const el = document.querySelector<HTMLElement>(selector)
  if (el) el.innerHTML = html
}

function initCopy(): void {
  const btn = document.querySelector<HTMLButtonElement>('#copy')
  const label = btn?.querySelector<HTMLElement>('.copy__label')
  const addr = document.querySelector<HTMLElement>('#email')
  if (!btn || !label || !addr) return
  let timer = 0
  const copied = (): void => {
    btn.classList.add('is-copied')
    btn.setAttribute('aria-label', 'Email copied')
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      btn.classList.remove('is-copied')
      btn.removeAttribute('aria-label')
    }, 1600)
  }
  const select = (): void => {
    const range = document.createRange()
    range.selectNodeContents(addr)
    const sel = getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    label.textContent = 'Selected — press ⌘C'
    clearTimeout(timer)
    timer = window.setTimeout(() => (label.textContent = 'Copy email'), 2400)
  }
  btn.addEventListener('click', () => {
    if (!navigator.clipboard) return select()
    navigator.clipboard.writeText(addr.textContent ?? '').then(copied, select)
  })
}

// content first, so the field can measure where each section starts
const lead = document.querySelector<HTMLElement>('#lead')
if (lead) lead.textContent = site.lead
fill('#facts', renderFacts(site.facts))
fill('#about .section-content', renderAbout(about))
fill('#experience .section-content', renderExperience(experience))
fill('#projects .section-content', renderProjects(projects))
fill('#contact .section-content', renderContact(site))
initCopy()

const name = document.querySelector<HTMLElement>('#name')
if (name) initName(name)
const statement = document.querySelector<HTMLElement>('[data-ink]')
if (statement) initInk(statement)

const canvas = document.querySelector<HTMLCanvasElement>('#field')
if (canvas) {
  const field = initField(canvas)
  // hovering (or focusing) a project floods the field with that project's colour
  for (const row of document.querySelectorAll<HTMLElement>('[data-hue]')) {
    const hue = Number(row.dataset.hue)
    row.addEventListener('pointerenter', () => field.tint(hue))
    row.addEventListener('pointerleave', () => field.tint(null))
    row.addEventListener('focus', () => field.tint(hue))
    row.addEventListener('blur', () => field.tint(null))
  }
}
