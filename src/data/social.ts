import type { SocialLink } from './types';

export const social = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/aremorarief/',
    iconClass: 'fab fa-instagram',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/arief-setiawan-lmg',
    iconClass: 'fab fa-linkedin',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/Ariefsetiawan900',
    iconClass: 'fab fa-github',
  },
] as const satisfies readonly SocialLink[];
