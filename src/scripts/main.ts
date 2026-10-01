import { initNavigation } from './navigation';
import { initTabs } from './tabs';
import { initPortfolio } from './portfolio';
import { initLoader } from './loader';

if (initNavigation()) {
  document.documentElement.classList.add('enhanced');
  initTabs();
  initPortfolio();
  initLoader();
}
