(() => {
  if (!window.bootstrap) return;
  const hints = [
    ['.top strong', 'Batangas State University', 'The university associated with this academic analytics portal.'],
    ['#clock', 'Philippine time', 'The current date, day, and time in the Asia/Manila time zone. Updates every minute.'],
    ['.utility > span', 'Your account', 'You are using the Program Chair account. All dashboard figures are illustrative.'],
    ['.logout-button', 'Log out', 'Open the confirmation dialog to securely end your current session.'],
    ['.official-logo', 'SPARTANalytix', 'Your academic analytics dashboard for reviewing teaching and student performance indicators.'],
    ['.logo-tagline', 'Our purpose', 'Use academic insights to support informed review, advising, and program improvement.'],
    ['#includeReportRecords', 'Supporting records', 'Include all reportable section breakdowns and supporting records in the export, beyond the visible pagination. SETE evaluation records remain anonymous.'],
    ['#welcomeBannerTitle', 'Welcome', 'Start with the overview, narrow your selection with filters, then review charts and alerts.'],
    ['.welcome-banner-badge', 'Sample data', 'This account displays sample figures rather than official student or faculty records.'],
    ['#startQuickTour', 'Quick tour', 'Start or repeat the guided walkthrough. Use Next, Back, Skip tour, or Escape.'],
    ['#pageTitle', 'Current section', 'Review teaching and student performance indicators together in this overview.'],
    ['.heading > div > p', 'Review workflow', 'Compare indicators with their targets, explore trends, and identify areas that may need support.'],
    ['#year', 'Academic year', 'Select one academic year or All Academic Years to combine the three years of sample records. Combined counts represent student-semester records, not unique students across years.'],
    ['#sem', 'Semester', 'Choose the first or second semester to change the current selection.'],
    ['#program', 'Program scope', 'This portal covers BSIT within CICS only. Use the academic year and semester filters to review its sample data.'],
    ['#yearLevel', 'Year level', 'Review all BSIT year levels or select 1st, 2nd, 3rd, or 4th year. KPI source counts and charts follow your selection.'],
    ['#specialization', 'Specialization', 'BSIT has three Business Analytics sections and two Network Technology sections. Choose a specialization to narrow the section choices.'],
    ['#section', 'Section', 'Select one of the three Business Analytics sections or two Network Technology sections. Section numbers are placeholders for your official class names.'],
    ['#sectionTitle', 'Analytics and trends', 'The panels below reflect your selected filters. Hover over chart data for exact values.'],
    ['.chart-expand-button', 'Expand chart', 'Open a larger, interactive version of this chart using the current filters and series visibility.'],
    ['.kpi-track-status', 'Target status', 'On track means this sample value meets the proposed target. Needs review means it falls outside the target. This is separate from whether the value improved over the previous semester.'],
    ['#alertPanel .pills span', 'Suggested review area', 'A sample issue or support action to discuss with authorized academic staff.'],
    ['#alertPanel > p', 'Human review required', 'Alerts support professional judgment and must not trigger automatic disciplinary decisions.'],
    ['.notice', 'Data notice', 'All values shown here are demonstration data, not official Batangas State University records.'],
    ['.footer', 'Copyright', 'SPARTANalytix copyright notice. The year updates automatically.'],
    ['#logoutDescription', 'Confirm sign-out', 'Cancel to remain signed in, or choose Log out to end your session.'],
    ['#logoutModal [data-bs-dismiss="modal"]', 'Stay signed in', 'Close this dialog without ending your session.'],
    ['#confirmLogout', 'Confirm logout', 'End your session after the loading screen. You will return to the login page.'],
  ];
  const instances = [];
  const attach = (element, text, label) => {
    if (element.matches('select.enhanced-filter-select')) {
      element = element.closest('.filter-dropdown').querySelector('.filter-select-trigger');
    }
    if (!element.matches('button, input, select, a, [tabindex]')) element.tabIndex = 0;
    if (element.matches('select')) element.setAttribute('aria-label', label);
    const tip = new bootstrap.Tooltip(element, {
      title: text, placement: 'auto', container: 'body', trigger: 'hover focus',
      delay: { show: 350, hide: 100 }, customClass: 'portal-tooltip',
    });
    element.addEventListener('show.bs.tooltip', event => {
      if (element.getAttribute('aria-expanded') === 'true' || document.querySelector('.welcome-popover, #welcomeModal.show, #kpiModal.show, #chartModal.show') || !document.getElementById('pageLoading')?.hidden) event.preventDefault();
    });
    element.addEventListener('show.bs.dropdown', () => tip.hide());
    if (element.classList.contains('tip-trigger')) {
      element.addEventListener('click', event => { event.stopPropagation(); tip.show(); });
    }
    instances.push(tip);
  };
  hints.forEach(([selector, label, text]) => document.querySelectorAll(selector).forEach(element => attach(element, text, label)));
  document.querySelectorAll('.tip-trigger[data-tip]').forEach(element => attach(element, element.dataset.tip, element.getAttribute('aria-label')));
  document.querySelectorAll('.kpi-change').forEach(element => attach(element, () => element.dataset.comparison, 'Previous semester comparison'));
  document.querySelectorAll('.kpi').forEach(card => {
    const explanation = card.querySelector('[data-tip]')?.dataset.tip;
    if (explanation) attach(card.querySelector('strong'), explanation, 'Indicator value');
    attach(card.querySelector('em'), 'Compare the indicator value above with this target to identify areas that need review.', 'Target');
  });
  const hideAll = () => instances.forEach(instance => instance.hide());
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hideAll(); });
  document.addEventListener('click', event => {
    if (!event.target.closest('.tip-trigger')) hideAll();
  });
  document.querySelectorAll('select').forEach(element => element.addEventListener('change', hideAll));
  document.getElementById('logoutModal')?.addEventListener('show.bs.modal', hideAll);
  document.getElementById('kpiModal')?.addEventListener('show.bs.modal', hideAll);
  document.getElementById('chartModal')?.addEventListener('show.bs.modal', hideAll);
})();
