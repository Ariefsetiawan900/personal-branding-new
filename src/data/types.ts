import type { ImageMetadata } from 'astro';

export interface TimelineEntry {
  readonly date: string;
  readonly title: string;
  readonly organization: string;
  readonly separator: string;
  readonly paragraphs: readonly string[];
}

export interface Project {
  readonly id: string;
  readonly title: string;
  readonly image: ImageMetadata;
  readonly imageAlt: string;
  readonly description: string;
  readonly created: string;
  readonly technologies: string;
  readonly role: string;
  readonly sourceUrl: string;
  readonly liveUrl: string;
  readonly liveLabel: string;
}

export interface SocialLink {
  readonly name: string;
  readonly url: string;
  readonly iconClass: string;
}
