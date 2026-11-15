// All site copy. An item with `standin: true` renders as a dashed placeholder box;
// nothing uses it right now.

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
  /** Hue (0-360) the particle field floods with while this row is hovered. */
  hue?: number
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

export const site = {
  name: 'Ethan Tran',
  lead: 'Computer science student at UNC Chapel Hill, interested in AI, backend and infrastructure. Most recently a software engineer intern at IBM.',
  email: 'hello@ethanctran.dev',
  github: 'https://github.com/etctran',
  linkedin: 'https://www.linkedin.com/in/ethanctran',
  facts: [
    { label: 'Studying', value: 'B.S. Computer Science, UNC Chapel Hill · May 2028' },
    { label: 'Based in', value: 'Chapel Hill, NC' },
    { label: 'Works in', value: 'Python, C++, TypeScript, Swift, React, FastAPI, Kubernetes' },
  ] as Fact[],
}

export const projects: Project[] = [
  {
    name: 'ClutchWatch',
    line: 'Real-time NBA pipeline on Google Cloud that watches every live game and posts to Discord when one gets close late. Replays a full 686,008-event season at 1,000 events a second with none lost.',
    stack: ['Python', 'Pub/Sub', 'Cloud Run', 'Redis', 'BigQuery', 'Terraform'],
    year: '2026',
    url: 'https://github.com/etctran/ClutchWatch',
    hue: 218,
  },
  {
    name: 'FormIQ',
    line: 'Scores exercise form from a phone video: finds each rep and flags faults across eight lifts.',
    stack: ['C++', 'Python', 'FastAPI', 'React'],
    year: '2026',
    url: 'https://github.com/etctran/FormIQ',
    hue: 135,
  },
  {
    name: 'GraphSense',
    line: 'First place of 40+ teams at VT Hacks 13. Upload a dataset and three Gemini agents profile it, recommend charts and lay them out on a shared infinite canvas.',
    stack: ['Next.js', 'TypeScript', 'FastAPI', 'Gemini'],
    year: '2025',
    url: 'https://github.com/calebyhan/graphsense',
    hue: 50,
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
      'Lead 10 office hours a week and grade exams for 900+ students in Intro to Programming (Python).',
    ],
  },
]

// Set `photo` to a file in public/ (for example '/me.jpg') to replace the monogram in About.
export const about: { paragraphs: Standable[]; photo?: string } = {
  paragraphs: [
    {
      text: 'I’m a computer science student at UNC Chapel Hill, graduating in May 2028. I like building software people lean on every day. Outside of code, I’m into basketball, video games and anime.',
    },
  ],
}
