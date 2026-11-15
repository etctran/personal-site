import './styles/tokens.css'
import './styles/site.css'
import { site, projects, experience, about } from './content'
import { renderFacts, renderProjects, renderExperience, renderAbout, renderContact } from './render'
import { initName } from './name'

function fill(selector: string, html: string): void {
  const el = document.querySelector<HTMLElement>(selector)
  if (el) el.innerHTML = html
}

function initCopy(): void {
  const btn = document.querySelector<HTMLButtonElement>('#copy')
  const addr = document.querySelector<HTMLElement>('#email')
  if (!btn || !addr) return
  const reset = (ms: number): void => {
    setTimeout(() => (btn.textContent = 'Copy email'), ms)
  }
  const select = (): void => {
    const range = document.createRange()
    range.selectNodeContents(addr)
    const sel = getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    btn.textContent = 'Selected — press ⌘C'
    reset(2400)
  }
  btn.addEventListener('click', () => {
    if (!navigator.clipboard) return select()
    navigator.clipboard.writeText(addr.textContent ?? '').then(() => {
      btn.textContent = 'Copied'
      reset(1600)
    }, select)
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
