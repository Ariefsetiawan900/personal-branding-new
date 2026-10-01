export const sectionIds = ['home', 'about', 'portofolio', 'contact'] as const;

export type SectionId = (typeof sectionIds)[number];

export function resolveSectionId(hash: string): SectionId {
  const candidate = hash.startsWith('#') ? hash.slice(1) : hash;
  return sectionIds.find((id) => id === candidate) ?? 'home';
}

export function isKnownHash(hash: string): boolean {
  return sectionIds.some((id) => `#${id}` === hash);
}
