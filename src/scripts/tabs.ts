export function initTabs(): void {
  const tablist = document.querySelector<HTMLElement>(
    '.about-tabs[role="tablist"]',
  );
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  if (!tabs.length) return;

  const selectTab = (tab: HTMLButtonElement, focus: boolean) => {
    for (const candidate of tabs) {
      const selected = candidate === tab;
      const panelId = candidate.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      candidate.classList.toggle('active', selected);
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      panel?.classList.toggle('active', selected);
      panel?.setAttribute('aria-hidden', String(!selected));
      if (panel) panel.inert = !selected;
    }
    if (focus) tab.focus();
  };

  tablist.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const tab = event.target.closest<HTMLButtonElement>('[role="tab"]');
    if (tab && tabs.includes(tab)) selectTab(tab, false);
  });
  tablist.addEventListener('keydown', (event) => {
    const current = document.activeElement;
    const index = tabs.indexOf(current as HTMLButtonElement);
    if (index < 0) return;
    let nextIndex: number;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft')
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) selectTab(nextTab, true);
  });
  const initialTab =
    tabs.find((tab) => tab.classList.contains('active')) ?? tabs[0];
  if (initialTab) selectTab(initialTab, false);
}
