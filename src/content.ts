export interface Project {
  name: string
  tagline: string
  hard: string
  stack: string[]
  links: { github?: string; live?: string }
  featured?: boolean
}

export interface Role {
  company: string
  role: string
  start: string
  end: string
  bullets: string[]
  stack: string[]
  url?: string
}

export const site = {
  name: 'Ethan Tran',
  title: 'TODO: Software engineer · CS @ School · ’27',
  hook: 'TODO: One sentence on what you build and why it matters.',
  email: 'TODO@example.com',
  github: 'https://github.com/etctran',
  linkedin: 'TODO: https://www.linkedin.com/in/your-handle',
  resumeUrl: '/resume.pdf',
}

export const projects: Project[] = [
  {
    name: 'FormIQ',
    tagline: 'Exercise form analysis from video.',
    hard:
      'A C++ engine runs MediaPipe pose models through LiteRT to pull 33 keypoints per frame at 30 fps, exposed to Python in-process via pybind11. OpenCV’s model loader couldn’t load the real detector (unsupported DENSIFY op), so I swapped in the LiteRT interpreter and kept OpenCV only for video. The FastAPI backend turns keypoints into rep boundaries with a four-phase state machine and scores each rep against declarative fault rules for eight exercises — under three seconds per video.',
    stack: ['C++', 'LiteRT', 'OpenCV', 'pybind11', 'FastAPI', 'SQLite', 'React', 'TypeScript', 'Docker'],
    links: { github: 'https://github.com/etctran/FormIQ' },
    featured: true,
  },
  {
    name: 'TODO: Project two',
    tagline: 'TODO: One line on what it does.',
    hard: 'TODO: Two or three lines on what was hard and how you solved it.',
    stack: ['TODO'],
    links: { github: 'https://github.com/etctran' },
  },
  {
    name: 'TODO: Project three',
    tagline: 'TODO: One line on what it does.',
    hard: 'TODO: Two or three lines on what was hard and how you solved it.',
    stack: ['TODO'],
    links: { github: 'https://github.com/etctran' },
  },
]

export const experience: Role[] = [
  {
    company: 'TODO: Company',
    role: 'TODO: Software Engineering Intern',
    start: '2026',
    end: 'Present',
    bullets: ['TODO: Impact bullet with a number.', 'TODO: Second impact bullet.'],
    stack: ['TODO'],
    url: 'https://example.com',
  },
  {
    company: 'TODO: Earlier company',
    role: 'TODO: Role',
    start: '2025',
    end: '2025',
    bullets: ['TODO: Impact bullet with a number.'],
    stack: ['TODO'],
  },
]

export const about: { timeline: string[]; paragraphs: string[]; photo?: string } = {
  timeline: [
    'TODO: 2005 — Born somewhere; the thing you were obsessed with as a kid.',
    'TODO: 2021 — First real program; what it did.',
    'TODO: 2023 — Started CS at School; the course or project that hooked you.',
    'TODO: 2026 — Now: what you’re building and what you want next.',
  ],
  paragraphs: [
    'TODO: Two or three sentences on what you like working on and how you work.',
    'TODO: One or two sentences on life outside code (lifting, music, food, wherever you’re from).',
  ],
}
