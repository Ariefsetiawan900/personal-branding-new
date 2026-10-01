import type { TimelineEntry } from './types';

export const experience = [
  {
    date: '2022 - Present',
    title: 'FrontEnd Developer',
    organization: 'Gokomodo',
    separator: ' ',
    paragraphs: [
      '-Developing & maintain Gokomodo web application features from the Frontend side.',
      '-Resolved bugs fixing in Gokomodo web application',
    ],
  },
  {
    date: '2021',
    title: 'FrontEnd Developer',
    organization: 'PT. Nastha Global Utama',
    separator: ' ',
    paragraphs: [
      '-Maintain the Indonesian National Single Window (INSW) web application of the Ministry of Finance of the Republic of Indonesia.',
      '-Developing INSW web application features from the Frontend side.',
      '-Resolved bugs fixing in INSW web application',
    ],
  },
  {
    date: '2020',
    title: 'Freelance',
    organization: 'As Reactjs Developer',
    separator: ' ',
    paragraphs: [
      'Develop and build a web application from scratch to deploy/Online',
    ],
  },
] as const satisfies readonly TimelineEntry[];
