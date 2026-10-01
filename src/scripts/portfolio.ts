export function initPortfolio(): void {
  const popup = document.querySelector<HTMLElement>('.portofolio-popup');
  const inner = popup?.querySelector<HTMLElement>('.pp-inner');
  const closeButton = popup?.querySelector<HTMLButtonElement>('.pp-close');
  const image = popup?.querySelector<HTMLImageElement>('.pp-thumbnail img');
  const title = popup?.querySelector<HTMLElement>('#pp-title');
  const body = popup?.querySelector<HTMLElement>('.pp-body');
  const main = document.querySelector<HTMLElement>('.main');
  if (!popup || !inner || !closeButton || !image || !title || !body || !main)
    return;

  let returnFocus: HTMLElement | null = null;

  const close = () => {
    if (!popup.classList.contains('open')) return;
    popup.classList.remove('open');
    popup.setAttribute('aria-hidden', 'true');
    main.classList.remove('fade-out');
    main.inert = false;
    document.body.classList.remove('hide-scrolling');
    const focusTarget = returnFocus;
    returnFocus = null;
    requestAnimationFrame(() => {
      if (!popup.classList.contains('open')) {
        focusTarget?.focus({ preventScroll: true });
      }
    });
  };

  const open = (button: HTMLButtonElement) => {
    const projectId = button.dataset.projectId;
    const card = button.closest<HTMLElement>('.portofolio-item');
    const template = projectId
      ? document.getElementById(`project-${projectId}`)
      : null;
    const cardImage = card?.querySelector<HTMLImageElement>(
      '.portofolio-item-thumbnail img',
    );
    const cardTitle = card?.querySelector<HTMLElement>(
      '.portofolio-item-title',
    );
    if (!(template instanceof HTMLTemplateElement) || !cardImage || !cardTitle)
      return;

    returnFocus = button;
    // The card may display a small srcset variant; the modal needs full detail.
    image.src = cardImage.src;
    image.alt = cardImage.alt;
    title.textContent = cardTitle.textContent;
    body.replaceChildren(template.content.cloneNode(true));
    popup.classList.add('open');
    popup.setAttribute('aria-hidden', 'false');
    popup.scrollTo(0, 0);
    main.classList.add('fade-out');
    main.inert = true;
    document.body.classList.add('hide-scrolling');
    // The popup becomes visible immediately, but its content finishes entering
    // after 500 ms. Chromium can ignore focus while it is mid-transition.
    const focusDelay = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 0
      : 550;
    window.setTimeout(() => {
      if (popup.classList.contains('open')) {
        closeButton.focus({ preventScroll: true });
      }
    }, focusDelay);
  };

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('.view-project-btn');
    if (button) open(button);
  });
  closeButton.addEventListener('click', close);
  inner.addEventListener('click', (event) => {
    if (event.target === inner) close();
  });
  document.addEventListener('keydown', (event) => {
    if (!popup.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [
      closeButton,
      ...popup.querySelectorAll<HTMLAnchorElement>('.pp-body a[href]'),
    ];
    const current = focusable.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    event.preventDefault();
    if (current < 0) {
      (event.shiftKey ? focusable.at(-1) : closeButton)?.focus();
      return;
    }
    const next = event.shiftKey
      ? (current - 1 + focusable.length) % focusable.length
      : (current + 1) % focusable.length;
    focusable[next]?.focus();
  });
}
