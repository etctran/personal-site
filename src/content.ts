// All site copy. Anything with `standin: true` is a placeholder Ethan replaces;
// it renders in a dashed box until then.

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
  lead: 'Software engineer and computer science student at UNC Chapel Hill. I build AI-backed backend systems, mobile apps and computer-vision tools, most recently at IBM.',
  email: 'hello@ethanctran.dev',
  github: 'https://github.com/etctran',
  linkedin: 'https://www.linkedin.com/in/ethanctran',
  resumeUrl: '/resume.pdf',
  facts: [
    { label: 'Studying', value: 'B.S. Computer Science, UNC Chapel Hill · May 2028' },
    { label: 'Based in', value: 'Chapel Hill, NC' },
    { label: 'Looking for', value: 'Summer 2027 software engineering internship', standin: true },
    { label: 'Hackathons', value: 'Two wins, including 1st of 40+ teams at VT Hacks 13' },
    { label: 'Works in', value: 'Python, C++, TypeScript, Swift, React, FastAPI, Kubernetes' },
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
  {
    name: 'GraphSense',
    line: 'First place at VT Hacks 13. Three Gemini agents profile a dataset and recommend the best of ten chart types for it.',
    stack: ['React', 'TypeScript', 'Python', 'Gemini API'],
    year: '2026',
  },
  {
    name: 'TA scheduler',
    line: 'Office-hours shifts, swaps and a shared schedule for 70+ UNC CS TAs, replacing a paid service.',
    stack: ['Next.js', 'PostgreSQL', 'Supabase'],
    year: '2025',
  },
]

export const experience: Role[] = [
  {
    company: 'IBM',
    role: 'Software Engineer Intern',
    start: 'May 2026',
    end: 'Aug 2026',
    bullets: [
      'Built a self-healing AI ops platform in LangGraph and Python that cut incident response from up to 2 hours to under 5 minutes for 20+ engineers.',
      'Auto-resolved 60% of incidents with an LLM and RAG investigation engine, fed by a Kafka pipeline held at 99.99% uptime at 10,000 events a second.',
      'Deployed it on Kubernetes and OpenShift across AWS, Azure, GCP and IBM Cloud.',
    ],
  },
  {
    company: 'Carolina Cupboard',
    role: 'iOS Engineer Intern',
    start: 'Jan 2026',
    end: 'May 2026',
    bullets: [
      'Shipped a SwiftUI inventory app that replaced a spreadsheet for UNC’s student food pantry, used by 50+ volunteers tracking $1M+ in product a year.',
      'Built expiration-aware checkout with barcode scanning, live search and secure sign-in.',
    ],
  },
  {
    company: 'CancerLINC',
    role: 'Software Engineer Intern',
    start: 'Sep 2025',
    end: 'May 2026',
    bullets: [
      'Built the Flutter chat app and FastAPI RAG pipeline behind a chatbot grounded in CancerLINC’s medical documents, reaching 800+ patients.',
      'Cut sign-in from 3 minutes to 1 with Google sign-in through Firebase.',
    ],
  },
  {
    company: 'UNC Department of Computer Science',
    role: 'Undergraduate Teaching Assistant',
    start: 'Aug 2025',
    end: 'Present',
    bullets: [
      'Built the office-hours scheduler the course’s 70+ TAs use for shifts and swaps, in Next.js, PostgreSQL and Supabase.',
      'Lead 10 office hours a week and grade exams for 900+ students in Intro to Programming (Python).',
    ],
  },
]

export const about: { paragraphs: Standable[]; timeline: TimelineItem[] } = {
  paragraphs: [
    {
      text: 'I’m a computer science student at UNC Chapel Hill, graduating in May 2028. I like building software people lean on every day: an inventory app for the campus food pantry, a scheduler for my fellow TAs, an incident-response platform at IBM.',
    },
    { text: 'One or two sentences on life outside code.', standin: true },
  ],
  timeline: [
    { year: '2024', text: 'Started computer science at UNC Chapel Hill.' },
    { year: '2025', text: 'Began teaching Intro to Programming as a TA.' },
    { year: '2026', text: 'Software engineer intern at IBM.' },
    { year: '2028', text: 'Graduating with a B.S. in Computer Science.' },
  ],
}
