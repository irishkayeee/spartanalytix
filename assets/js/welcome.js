(() => {
  const autoStart = document.currentScript?.dataset.autostart === 'true';
  const launch = document.getElementById('startQuickTour');
  if (!launch || !window.bootstrap) return;
  let steps = [];
  const buildSteps = () => {
    const shared = [
    ['#pageTitle', 'Academic Performance Overview', 'Review key indicators, SETE response rates by section, course-section failure hotspots, academic-risk trends, alerts, and report exports together in one view.'],
    ['.filters', 'Choose what to review', 'This BSIT · CICS portal covers 1st to 4th year, with three Business Analytics sections and two Network Technology sections. Filter by academic year, semester, year level, specialization, and section. KPI source records and charts update together using demo data.'],
    ['#kpis', 'Check your five key indicators', 'Compare each value with its target. The arrow shows the change from the previous semester: pp means percentage points. Hover over a change for the previous period and value, or click a card for the source data, calculation, and target status.'],
    ];
    const panels = [
      ['#setePanel', 'SETE participation by section', 'Compare section response rates with the 100% target. Click a bar or use Inspect data for respondent counts and eligible evaluators. Prioritize reminders for sections below target.'],
      ['#passPanel', 'Find course-section hotspots', 'Read each cell percentage. Red cells exceed the 10% failure threshold. Click a cell or choose Inspect data for the failed and enrolled counts and a support recommendation.'],
      ['#standingPanel', 'Monitor academic risk', 'Track the at-risk share across three relative semesters against a 10% threshold. Click a point or use Inspect data for counts. All Academic Years pools matching relative semesters; this trend cannot establish intervention effects.'],
      ['#alertPanel', 'Prioritize support', 'Review the suggested areas for attention, then consider advising or further review. These sample alerts support human judgment and do not make automatic decisions.'],
    ].filter(([selector]) => {
      const panel = document.querySelector(selector);
      return panel && !panel.classList.contains('hidden');
    });
    return [...shared, ...panels, ['#startQuickTour', 'Explore at your own pace', 'Hover over controls or focus them with the keyboard for help. Click question marks for explanations. Restart this overview guide anytime using Quick tour.']];
  };
  let index = 0, popover, highlighted, active = false;
  const clear = () => {
    popover?.dispose();
    popover = null;
    highlighted?.classList.remove('tour-highlight');
  };
  const finish = () => { clear(); active = false; launch.focus({ preventScroll: true }); };
  const button = (label, className, action) => {
    const item = document.createElement('button');
    item.type = 'button'; item.className = className; item.textContent = label;
    item.addEventListener('click', action);
    return item;
  };
  const show = () => {
    clear();
    const [selector, title, text] = steps[index];
    const target = document.querySelector(selector);
    if (!target) { finish(); return; }
    highlighted = target;
    target.classList.add('tour-highlight');
    target.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' });
    const content = document.createElement('div');
    const progress = document.createElement('p');
    progress.className = 'tour-progress'; progress.textContent = `Step ${index + 1} of ${steps.length}`;
    const description = document.createElement('p');
    description.className = 'mb-3'; description.textContent = text;
    const controls = document.createElement('div'); controls.className = 'tour-controls';
    controls.append(button('Skip tour', 'tour-skip', finish));
    if (index > 0) controls.append(button('Back', 'tour-back', () => { index--; show(); }));
    const next = button(index === steps.length - 1 ? 'Finish' : 'Next', 'welcome-dismiss', () => {
      if (index === steps.length - 1) finish(); else { index++; show(); }
    });
    controls.append(next); content.append(progress, description, controls);
    popover = new bootstrap.Popover(target, { title, content, html: true, trigger: 'manual', placement: 'bottom', fallbackPlacements: ['top', 'right', 'left'], container: 'body', customClass: 'welcome-popover' });
    popover.show(); next.focus({ preventScroll: true });
  };
  const start = () => { active = true; index = 0; steps = buildSteps(); show(); };
  launch.addEventListener('click', start);
  document.addEventListener('keydown', event => { if (active && event.key === 'Escape') { event.preventDefault(); finish(); } });
  document.querySelector('.logout-form')?.addEventListener('submit', () => { if (active) finish(); });
  const welcomeElement = document.getElementById('welcomeModal');
  if (welcomeElement) {
    const welcomeModal = new bootstrap.Modal(welcomeElement);
    let welcomeTimer;
    welcomeElement.addEventListener('shown.bs.modal', () => {
      welcomeTimer = window.setTimeout(() => welcomeModal.hide(), 3000);
    });
    welcomeElement.addEventListener('hide.bs.modal', () => window.clearTimeout(welcomeTimer));
    document.getElementById('welcomeStartTour').addEventListener('click', () => {
      welcomeElement.addEventListener('hidden.bs.modal', start, { once: true });
      welcomeModal.hide();
    });
    welcomeElement.addEventListener('hidden.bs.modal', () => launch.focus({ preventScroll: true }));
    if (autoStart) welcomeModal.show();
  }
})();
