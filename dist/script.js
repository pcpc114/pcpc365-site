(() => {
  const tabs = [...document.querySelectorAll('[role="tab"][data-region]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"][data-panel]')];
  const number = document.querySelector('[data-region-number]');
  const header = document.querySelector('[data-header]');
  const regionOrder = { seoul: '01', gyeonggi: '02', incheon: '03' };

  function activateRegion(region, updateHash = true) {
    if (!regionOrder[region]) return;
    tabs.forEach((tab) => {
      const selected = tab.dataset.region === region;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.panel === region;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    if (number) number.textContent = regionOrder[region];
    if (updateHash) history.replaceState(null, '', '#region-' + region);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateRegion(tab.dataset.region));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      activateRegion(tabs[next].dataset.region);
    });
  });

  const targetRegion = location.hash.replace('#region-', '');
  if (regionOrder[targetRegion]) activateRegion(targetRegion, false);
  window.addEventListener('hashchange', () => {
    const region = location.hash.replace('#region-', '');
    if (regionOrder[region]) activateRegion(region, false);
  });

  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
