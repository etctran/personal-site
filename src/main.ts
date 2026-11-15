import './styles/tokens.css'
import './styles/site.css'
import { site, projects, experience, about } from './content'
import { renderFacts, renderProjects, renderExperience, renderAbout, renderContact } from './render'
import { initName } from './name'
import { initInk } from './ink'
import { initTheme } from './theme'

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

const lead = document.querySelector<HTMLElement>('#lead')
if (lead) lead.textContent = site.lead
fill('#facts', renderFacts(site.facts))
fill('#projects .section-content', renderProjects(projects))
fill('#experience .section-content', renderExperience(experience))
fill('#about .section-content', renderAbout(about))
fill('#contact .section-content', renderContact(site))
initCopy()

const name = document.querySelector<HTMLElement>('#name')
if (name) initName(name)
const statement = document.querySelector<HTMLElement>('[data-ink]')
if (statement) initInk(statement)
const toggle = document.querySelector<HTMLButtonElement>('#theme')
if (toggle) initTheme(toggle)
