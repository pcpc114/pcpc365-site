(() => {
  const header = document.querySelector('[data-header]');
  const tabs = [...document.querySelectorAll('[role="tab"][data-region]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"][data-panel]')];
  const currentRegion = document.querySelector('[data-current-region]');
  const regionData = {
    seoul: { label: 'SEOUL' },
    gyeonggi: { label: 'GYEONGGI' },
    incheon: { label: 'INCHEON' }
  };

  function activateRegion(region, updateHash = true) {
    const selected = regionData[region];
    if (!selected) return;

    tabs.forEach((tab) => {
      const active = tab.dataset.region === region;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== region;
    });
    if (currentRegion) currentRegion.textContent = selected.label;
    if (updateHash) history.replaceState(null, '', `#region-${region}`);
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

  const regionFromHash = location.hash.replace('#region-', '');
  if (regionData[regionFromHash]) activateRegion(regionFromHash, false);

  window.addEventListener('hashchange', () => {
    const region = location.hash.replace('#region-', '');
    if (regionData[region]) activateRegion(region, false);
  });

  let headerFrame = 0;
  let headerIsScrolled = null;

  function updateHeader() {
    headerFrame = 0;
    const shouldStick = window.scrollY > 28;
    if (!header || shouldStick === headerIsScrolled) return;
    header.classList.toggle('is-scrolled', shouldStick);
    headerIsScrolled = shouldStick;
  }

  function requestHeaderUpdate() {
    if (headerFrame) return;
    headerFrame = window.requestAnimationFrame(updateHeader);
  }

  updateHeader();
  window.addEventListener('scroll', requestHeaderUpdate, { passive: true });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
