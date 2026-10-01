import melinjo from '../assets/melinjo.png';
import staycation from '../assets/staycation.png';
import type { Project } from './types';

export type { Project } from './types';

export const projects = [
  {
    id: 'staycation',
    title: 'Staycation 2020',
    image: staycation,
    imageAlt: 'Staycation 2020 website preview',
    description:
      'Staycation2020 is a useful Web application for online rental of hotels, houses, apartments. Has a booking feature to make transactions such as uploading images and filling out forms. This web app is built with MERN (MongoDb, Expressjs, Reactjs, Nodejs)',
    created: '2020',
    technologies: 'Reactjs Nodejs Expressjs Mongodb',
    role: 'Fullstack',
    sourceUrl: 'https://github.com/Ariefsetiawan900/staycation',
    liveUrl: 'https://staycation2020.netlify.app/',
    liveLabel: 'staycation2020.netlify.app',
  },
  {
    id: 'melinjo',
    title: 'Melinjo.net',
    image: melinjo,
    imageAlt: 'Melinjo.net website preview',
    description:
      'Melinjo.Net is a useful e-commerce application for buying and selling fruits and vegetables online, main features, directly connected with sellers, price filters, search, star rating, and wishlist,This web app is built with MERN (MongoDb, Expressjs, Reactjs, Nodejs)',
    created: ' April 2021',
    technologies: 'Reactjs Nodejs Expressjs Mongodb',
    role: 'Fullstack ',
    sourceUrl: 'https://github.com/Ariefsetiawan900/melinjo.net-client',
    liveUrl: 'https://melinjo-43b57.web.app/',
    liveLabel: 'Melinjo (click me)',
  },
] as const satisfies readonly Project[];
