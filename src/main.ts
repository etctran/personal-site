import './styles/tokens.css'
import './styles/site.css'
import { site, projects, experience, about } from './content'
import { renderHeroCopy, renderProjects, renderExperience, renderAbout, renderContact } from './render'

function fill(selector: string, html: string): void {
  const el = document.querySelector<HTMLElement>(selector)
  if (el) el.innerHTML = html
}

export function mount(): void {
  fill('#hero-copy', renderHeroCopy(site))
  fill('#projects .section-content', renderProjects(projects))
  fill('#experience .section-content', renderExperience(experience))
  fill('#about .section-content', renderAbout(about))
  fill('#contact .section-content', renderContact(site))
}

mount()
