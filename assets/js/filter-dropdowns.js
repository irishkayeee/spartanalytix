(() => {
  if (!window.bootstrap) return;
  const labels = { year: 'Academic year', sem: 'Semester', yearLevel: 'Year level', specialization: 'Specialization', section: 'Section', seteChartInspector: 'Inspect section', passChartInspector: 'Inspect course and section', standingChartInspector: 'Inspect semester', modelPredictionPeriod: 'Prediction semester', modelSection: 'Section' };
  document.querySelectorAll('.filters select, .analytics-split .chart-details select, #modelPredictionPeriod, #modelSection').forEach(select => {
    const wrapper = document.createElement('div');
    wrapper.className = 'filter-dropdown dropdown';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = `${select.id}Dropdown`;
    trigger.className = 'filter-select-trigger';
    trigger.dataset.bsToggle = 'dropdown';
    trigger.dataset.selectId = select.id;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-controls', `${select.id}Options`);
    const value = document.createElement('span');
    const arrow = document.createElement('span');
    arrow.className = 'filter-chevron'; arrow.setAttribute('aria-hidden', 'true');
    trigger.append(value, arrow);
    const menu = document.createElement('div');
    menu.id = `${select.id}Options`;
    menu.className = 'dropdown-menu filter-options';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', (labels[select.id] || 'Inspect data'));
    wrapper.addEventListener('shown.bs.dropdown', () => {
      menu.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
    });
    const refresh = () => {
      const selected = select.options[select.selectedIndex];
      value.textContent = selected?.textContent || 'Select an option';
      trigger.setAttribute('aria-label', `${labels[select.id]}: ${value.textContent}`);
      trigger.disabled = select.disabled;
      menu.replaceChildren();
      Array.from(select.options).forEach(option => {
        const item = document.createElement('button');
        item.type = 'button'; item.className = 'dropdown-item filter-option';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(option.selected));
        item.disabled = option.disabled;
        const text = document.createElement('span'); text.textContent = option.textContent;
        const mark = document.createElement('span'); mark.className = 'filter-option-check';
        mark.textContent = option.selected ? '\u2713' : ''; mark.setAttribute('aria-hidden', 'true');
        item.append(text, mark);
        item.addEventListener('click', () => {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          bootstrap.Dropdown.getOrCreateInstance(trigger).hide();
          trigger.focus();
        });
        menu.append(item);
      });
    };
    select.parentNode.insertBefore(wrapper, select);
    wrapper.append(select, trigger, menu);
    select.classList.add('enhanced-filter-select');
    select.tabIndex = -1; select.setAttribute('aria-hidden', 'true');
    select.addEventListener('change', refresh);
    // Specialization changes rebuild the native section options.
    new MutationObserver(refresh).observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'selected'] });
    menu.addEventListener('keydown', event => {
      if (event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const items = Array.from(menu.querySelectorAll('.filter-option:not(:disabled)'));
      (event.key === 'Home' ? items[0] : items.at(-1))?.focus();
    });
    refresh();
  });
})();
