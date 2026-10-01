import type { TimelineEntry } from './types';

export const education = [
  {
    date: '2020',
    title: 'Fullstack Developer',
    organization: 'Arkademy Tech Education Platform',
    separator: ' - ',
    paragraphs: [
      'Guided to become a fullstack developer who can create restfull api using nodejs with the expressjs framework. Build web and mobile based applications using the javascript library with Reactjs for web and React Native for mobile using Redux state management',
    ],
  },
  {
    date: '2016 - 2019',
    title: 'Science',
    organization: 'SMAN 1 Sekaran',
    separator: ' - ',
    paragraphs: [],
  },
] as const satisfies readonly TimelineEntry[];
