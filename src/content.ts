// All site copy. Anything with `standin: true` is a placeholder Ethan replaces
// from his résumé; it renders in a dashed box until then.

export interface Fact {
  label: string
  value: string
  standin?: boolean
}

export interface Project {
  name: string
  line: string
  stack: string[]
  year: string
  url?: string
  standin?: boolean
}

export interface Role {
  company: string
  role: string
  start: string
  end: string
  bullets: string[]
  url?: string
  standin?: boolean
}

export interface Standable {
  text: string
  standin?: boolean
}

export interface TimelineItem extends Standable {
  year: string
}

export const site = {
  name: 'Ethan Tran',
  lead: 'Software engineer. I build backend services, computer-vision tools and the web apps that sit on top of them, in C++, Python and TypeScript.',
  email: 'hello@ethanctran.dev',
  github: 'https://github.com/etctran',
  linkedin: 'https://www.linkedin.com/',
  resumeUrl: '/resume.pdf',
  facts: [
    { label: 'Studying', value: 'Degree · School · Class of ’27', standin: true },
    { label: 'Based in', value: 'City, State', standin: true },
    { label: 'Looking for', value: 'Summer 2027 software engineering internship', standin: true },
    { label: 'Works in', value: 'C++, Python, TypeScript, React, FastAPI, Docker' },
  ] as Fact[],
}

export const projects: Project[] = [
  {
    name: 'FormIQ',
    line: 'Scores exercise form from a phone video: finds each rep and flags faults across eight lifts.',
    stack: ['C++', 'Python', 'FastAPI', 'React'],
    year: '2026',
    url: 'https://github.com/etctran/FormIQ',
  },
  { name: 'Project name', line: 'One line on what it does and who it’s for.', stack: ['Stack', 'Stack', 'Stack'], year: 'Year', standin: true },
  { name: 'Project name', line: 'One line on what it does and who it’s for.', stack: ['Stack', 'Stack', 'Stack'], year: 'Year', standin: true },
  { name: 'Project name', line: 'One line on what it does and who it’s for.', stack: ['Stack', 'Stack', 'Stack'], year: 'Year', standin: true },
]

export const experience: Role[] = [
  {
    company: 'Company',
    role: 'Role',
    start: '2026',
    end: 'now',
    bullets: ['What you shipped and the result, with a number.', 'A second line on scope or impact.'],
    standin: true,
  },
  {
    company: 'Company',
    role: 'Role',
    start: '2025',
    end: '2025',
    bullets: ['What you shipped and the result, with a number.'],
    standin: true,
  },
]

export const about: { paragraphs: Standable[]; timeline: TimelineItem[] } = {
  paragraphs: [
    { text: 'Two or three sentences in your own voice: what you like to build and how you work.', standin: true },
    { text: 'One or two on life outside code.', standin: true },
  ],
  timeline: [
    { year: 'Year', text: 'Where it started.', standin: true },
    { year: 'Year', text: 'First program worth keeping.', standin: true },
    { year: 'Year', text: 'School and what you study.', standin: true },
    { year: '2026', text: 'What you’re working on now.', standin: true },
  ],
}
