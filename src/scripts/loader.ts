export function initLoader(): void {
  const loader = document.querySelector<HTMLElement>('.page-loader');
  if (!loader) return;
  document.documentElement.classList.add('loading');
  let dismissed = false;
  const finish = () => {
    if (dismissed) return;
    dismissed = true;
    loader.classList.add('fade-out');
    window.setTimeout(() => {
      loader.hidden = true;
      document.documentElement.classList.remove('loading');
    }, 600);
  };
  // A slow external font must not keep the entry overlay visible forever.
  window.setTimeout(finish, 3000);
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
}
