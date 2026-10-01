import {
  isKnownHash,
  resolveSectionId,
  sectionIds,
  type SectionId,
} from './sections';

const TRANSITION_MS = 500;

export function initNavigation(): boolean {
  const header = document.querySelector<HTMLElement>('.header');
  const toggler = document.querySelector<HTMLButtonElement>('.nav-toggler');
  const nav = document.querySelector<HTMLElement>('#primary-navigation');
  const overlay = document.querySelector<HTMLElement>('.overlay');
  const popup = document.querySelector<HTMLElement>('.portofolio-popup');
  const sections = new Map<SectionId, HTMLElement>();
  for (const id of sectionIds) {
    const section = document.getElementById(id);
    if (!section) return false;
    sections.set(id, section);
  }
  if (!header || !toggler || !nav || !overlay || !popup) return false;

  let transitionTimer: number | undefined;
  let activeId: SectionId = 'home';

  const lockScroll = () => {
    document.body.classList.toggle(
      'hide-scrolling',
      header.classList.contains('active') ||
        overlay.classList.contains('active') ||
        popup.classList.contains('open'),
    );
  };

  const updateInert = () => {
    for (const [id, section] of sections) {
      section.inert = header.classList.contains('active') || id !== activeId;
      section.setAttribute('aria-hidden', String(id !== activeId));
    }
  };

  const closeMenu = (restoreFocus = false) => {
    if (!header.classList.contains('active')) return;
    if (nav.contains(document.activeElement))
      toggler.focus({ preventScroll: true });
    header.classList.remove('active');
    toggler.setAttribute('aria-expanded', 'false');
    toggler.setAttribute('aria-label', 'Open navigation');
    nav.setAttribute('aria-hidden', 'true');
    nav.removeAttribute('role');
    nav.removeAttribute('aria-modal');
    sections.get(activeId)?.classList.remove('fade-out');
    updateInert();
    lockScroll();
    if (restoreFocus) {
      requestAnimationFrame(() => toggler.focus({ preventScroll: true }));
    }
  };

  const openMenu = () => {
    if (popup.classList.contains('open')) return;
    if (transitionTimer !== undefined) {
      clearTimeout(transitionTimer);
      transitionTimer = undefined;
      overlay.classList.remove('active');
      toggler.classList.remove('hide');
    }
    header.classList.add('active');
    toggler.setAttribute('aria-expanded', 'true');
    toggler.setAttribute('aria-label', 'Close navigation');
    nav.setAttribute('aria-hidden', 'false');
    nav.setAttribute('role', 'dialog');
    nav.setAttribute('aria-modal', 'true');
    sections.get(activeId)?.classList.add('fade-out');
    updateInert();
    lockScroll();
    window.setTimeout(() => {
      if (header.classList.contains('active')) {
        nav.querySelector<HTMLAnchorElement>('a.nav-item')?.focus();
      }
    }, 50);
  };

  const finishTransition = (id: SectionId, focus: boolean) => {
    for (const [sectionId, section] of sections) {
      section.classList.toggle('active', sectionId === id);
      section.classList.remove('fade-out');
    }
    activeId = id;
    overlay.classList.remove('active');
    toggler.classList.remove('hide');
    transitionTimer = undefined;
    updateInert();
    lockScroll();
    window.scrollTo(0, 0);
    if (focus) sections.get(id)?.focus({ preventScroll: true });
  };

  const showSection = (id: SectionId, animate: boolean, focus: boolean) => {
    if (transitionTimer !== undefined) {
      clearTimeout(transitionTimer);
      transitionTimer = undefined;
      overlay.classList.remove('active');
      toggler.classList.remove('hide');
    }
    if (header.classList.contains('active')) closeMenu();
    if (id === activeId) {
      finishTransition(id, focus);
      return;
    }
    if (
      !animate ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      finishTransition(id, focus);
      return;
    }
    sections.get(activeId)?.classList.add('fade-out');
    overlay.classList.add('active');
    toggler.classList.add('hide');
    lockScroll();
    transitionTimer = window.setTimeout(
      () => finishTransition(id, focus),
      TRANSITION_MS,
    );
  };

  const syncLocation = () => {
    if (location.hash && !isKnownHash(location.hash)) {
      history.replaceState(
        null,
        '',
        `${location.pathname}${location.search}#home`,
      );
    }
    showSection(resolveSectionId(location.hash), false, false);
  };

  toggler.addEventListener('click', () => {
    if (header.classList.contains('active')) closeMenu(true);
    else openMenu();
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>(
      'a.link-item[href^="#"]',
    );
    if (!link) return;
    const hash = link.hash;
    if (!isKnownHash(hash)) return;
    event.preventDefault();
    if (location.hash !== hash) history.pushState(null, '', hash);
    showSection(resolveSectionId(hash), true, true);
  });

  document.addEventListener('keydown', (event) => {
    if (
      !header.classList.contains('active') ||
      popup.classList.contains('open')
    )
      return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [
      toggler,
      ...nav.querySelectorAll<HTMLAnchorElement>('a[href]'),
    ];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    // Safari may skip links on Tab depending on its keyboard preference. Cycle
    // explicitly so focus cannot leave the open navigation on any browser.
    event.preventDefault();
    if (index < 0) {
      (event.shiftKey ? items.at(-1) : items[0])?.focus();
      return;
    }
    const next = event.shiftKey
      ? (index - 1 + items.length) % items.length
      : (index + 1) % items.length;
    items[next]?.focus();
  });

  window.addEventListener('hashchange', syncLocation);
  window.addEventListener('popstate', syncLocation);
  syncLocation();
  return true;
}
