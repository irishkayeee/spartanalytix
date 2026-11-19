const minimumReportGroup = 1;
function isReportSuppressed(total, part) {
  return total < minimumReportGroup;
}

function getAnalyticsCharts() {
  const total = getScopedPeriodCount(1000);
  const periods = getAnalyticsPeriods();
  const selectedYears = periods[2].entries.map(entry => Number(entry.academicYear.slice(3, 7)));
  const semester = document.getElementById('sem').selectedIndex;
  const level = document.getElementById('yearLevel').value;
  const courses = portalCourses.filter(course => selectedYears.includes(course.academicYear)
    && (level === 'all' || course.yearLevel === Number(level)));
  const levels = level === 'all' ? [1, 2, 3, 4] : [Number(level)];
  const assessed = levels.map(year => getScopedPeriodCount(1000, String(year)));
  const atRisk = levels.map(year => getScopedPeriodCount(selection => 86 + Math.round(selection * 1.4), String(year)));
  const riskSuppressed = assessed.map((count, i) => isReportSuppressed(count, atRisk[i]));
  const cohorts = getSelectedDemoCohorts();
  const sections = bsitSections.filter(section => cohorts.some(cohort => cohort.id === section.id));
  const heatmap = courses.flatMap(course => {
    const period = 2026 - course.academicYear + semester;
    const failureCount = course.failureBase + Math.round(period * 2.1);
    return sections.map(section => {
      const sectionCohorts = cohorts.filter(cohort => cohort.id === section.id && cohort.year === course.yearLevel);
      const enrolled = sectionCohorts.length * 50;
      const failed = sectionCohorts.reduce((sum, cohort) =>
        sum + Math.floor(failureCount * (cohort.index + 1) / 20) - Math.floor(failureCount * cohort.index / 20), 0);
      return { course: course.label, section: section.id, failed, enrolled, rate: enrolled >= minimumReportGroup ? failed / enrolled * 100 : null };
    });
  });
  const courseEnrollment = sections.length * 50;
  const currentCounts = courses.map(course => heatmap.filter(cell => cell.course === course.label).reduce((sum, cell) => sum + cell.failed, 0));
  const riskTrend = [102, 94, 86].map(base => {
    const count = getScopedPeriodCount(period => base + Math.round(period * 1.4));
    return { count, total, rate: total >= minimumReportGroup ? count / total * 100 : null };
  });
  return {
    heatmap, sections, riskTrend,
    participation: sections.map(section => {
      const eligible = getScopedEvaluatorCount(section.id);
      const respondents = getScopedParticipationCount(false, section.id);
      const previous = getScopedParticipationCount(true, section.id);
      return { section: section.id, eligible, respondents, previous, rate: eligible >= minimumReportGroup ? respondents / eligible * 100 : null };
    }),
    periods,
    periodLabels: periods.map(period => period.label),
    courses: {
      labels: courses.map(course => course.label),
      current: currentCounts.map(count => courseEnrollment >= minimumReportGroup ? count / courseEnrollment * 100 : null),
      currentCounts,
      total: courseEnrollment,
    },
    risk: { labels: levels.map((year, i) => `${['1st', '2nd', '3rd', '4th'][year - 1]} Year${riskSuppressed[i] ? ' (suppressed)' : ''}`), atRisk: atRisk.map((count, i) => riskSuppressed[i] ? null : count), notAtRisk: assessed.map((count, i) => riskSuppressed[i] ? null : count - atRisk[i]), riskSuppressed },
  };
}

function renderAcademicAlerts(records, analytics) {
  const panel = document.getElementById('alertPanel');
  if (!panel.querySelector('.response-layout')) {
    panel.classList.add('analytics-split');
    const layout = document.createElement('div'); layout.className = 'response-layout';
    const card = document.createElement('div'); card.className = 'response-chart-card alert-list-card';
    const sidebar = document.createElement('div'); sidebar.className = 'response-sidebar';
    card.append(panel.querySelector('.alert'));
    const note = panel.querySelector(':scope > p');
    if (note) card.append(note);
    layout.append(card, sidebar); panel.append(layout);
    const summary = document.createElement('div'); summary.className = 'alert-summary';
    const heading = document.createElement('strong'); heading.textContent = 'Alert Summary';
    const period = document.createElement('p'); period.className = 'alert-summary-period';
    const counts = document.createElement('dl');
    summary.append(heading, period, counts); sidebar.append(summary);
  }
  const container = document.querySelector('#alertPanel .alert');
  container.replaceChildren();
  const title = document.createElement('strong');
  title.textContent = 'Review the current selection';
  container.append(title);
  const messages = [];
  const add = (heading, detail) => messages.push([heading, detail]);
  if (!records[0].suppressed && records[0].current > 10) add('Elevated academic risk', `${records[0].current.toFixed(1)}% exceeds the 10% target. Coordinate academic advising with authorized advisers.`);
  const lowSete = analytics.participation.filter(item => item.rate !== null && item.rate < 100);
  if (lowSete.length) {
    const pending = lowSete.reduce((sum, item) => sum + item.eligible - item.respondents, 0);
    add('Low SETE participation', lowSete.length + ' sections are below the 100% target, with ' + pending + ' pending evaluations in total. Send reminders and check evaluation access.');
  }
  analytics.courses.current.forEach((rate, index) => {
    if (rate !== null && rate > 10) add('Low core-course pass rate', `${analytics.courses.labels[index]}: ${(100 - rate).toFixed(1)}% pass rate; ${rate.toFixed(1)}% failure exceeds the 10% failure target. Review the course and provide support.`);
  });
  if (!records[1].suppressed && records[1].current < 4) add('SETE rating below target', 'Review overall evaluation feedback alongside peer observations and other teaching evidence.');
  if (!records[4].suppressed && records[4].current < 3) add('SETE improvement below target', records[4].current.toFixed(1) + '% overall rating improvement is below the +3% target. Review feedback with other evidence and discuss faculty development needs.');

  analytics.heatmap.filter(cell => cell.rate !== null && cell.rate > 10).forEach(cell => {
    add('Course-section failure warning', cell.course + ' / ' + cell.section + ': ' + cell.failed + ' of ' + cell.enrolled + ' enrollments failed (' + cell.rate.toFixed(1) + '%), above the 10% threshold. Review this section and arrange course support.');
  });
  if (!messages.length) {
    if (records.every(record => record.suppressed)) add('Insufficient reportable data', 'Broaden the filters. No assessment can be made from suppressed groups.');
    else add('No threshold breaches detected', 'No configured thresholds were breached among the reportable sample indicators. Suppressed values are not assessed.');
  }
  messages.forEach(([heading, detail]) => {
    const item = document.createElement('div'); item.className = 'academic-alert-item';
    const label = document.createElement('b'); label.textContent = heading;
    const text = document.createElement('p'); text.textContent = detail;
    item.append(label, text); container.append(item);
    if (heading === 'Low SETE participation' && lowSete.length) {
      const breakdown = document.createElement('p'); breakdown.className = 'low-sete-breakdown';
      breakdown.textContent = 'Still to evaluate: ' + lowSete.map(section => section.section + ' - ' + (section.eligible - section.respondents)).join('; ') + '.';
      item.append(breakdown);
    }
  });
  const activeCount = messages.filter(([heading]) => heading !== 'No threshold breaches detected' && heading !== 'Insufficient reportable data').length;
  panel.querySelector('.alert-summary-period').textContent = analytics.periods[2].label;
  const counts = panel.querySelector('.alert-summary dl'); counts.replaceChildren();
  const rows = [
    ['Review flags', activeCount],
    ['Sections below participation target', analytics.participation.filter(item => item.rate !== null && item.rate < 100).length],
    ['Course-section failure warnings', analytics.heatmap.filter(cell => cell.rate !== null && cell.rate > 10).length],
  ];
  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    const term = document.createElement('dt'); term.textContent = label;
    const count = document.createElement('dd'); count.textContent = value;
    row.append(term, count); counts.append(row);
  });
  const note = document.createElement('p'); note.className = 'privacy-report-note';
  note.textContent = 'Sample data only. All selected sample counts are displayed, including small groups. Alerts never make automatic disciplinary decisions.';
  container.append(note);
  renderAnalyticsWarning(analytics);
}

function renderKeyInsights(analytics) {
  const show = (id, text) => {
    const panel = document.getElementById(id);
    let box = panel.querySelector('.key-insights');
    if (!box) {
      box = document.createElement('div'); box.className = 'key-insights';
      const title = document.createElement('strong'); title.textContent = 'Key insights';
      box.append(title, document.createElement('p')); (panel.querySelector('.response-sidebar') || panel).append(box);
    }
    box.querySelector('p').textContent = text;
  };
  const reportable = analytics.participation.filter(item => item.rate !== null);
  const lowest = reportable.reduce((best, item) => !best || item.rate < best.rate ? item : best, null);
  show('setePanel', lowest ? lowest.section + ' has the lowest response rate (' + lowest.rate.toFixed(1) + '%). ' + reportable.filter(item => item.rate < 100).length + ' of ' + reportable.length + ' sections are below the 100% target. Prioritize reminders and evaluation access.' : 'No reportable participation data. Broaden the filters.');
  const cells = analytics.heatmap.filter(cell => cell.rate !== null);
  const highest = cells.reduce((best, cell) => !best || cell.rate > best.rate ? cell : best, null);
  show('passPanel', highest ? highest.course + ' / ' + highest.section + ' has the highest failure rate (' + highest.rate.toFixed(1) + '%). ' + cells.filter(cell => cell.rate > 10).length + ' course-section groups exceed the 10% threshold. Color and cell percentages identify where to prioritize support.' : 'No reportable enrollments. Broaden the filters.');
  const prior = analytics.riskTrend[1], current = analytics.riskTrend[2];
  const unit = document.getElementById('year').value === 'all' ? 'student-semester records' : 'students';
  show('standingPanel', current.rate !== null ? current.count + ' of ' + current.total + ' assessed ' + unit + ' are flagged at risk (' + current.rate.toFixed(1) + '%). Change from the previous semester: ' + (current.rate - prior.rate).toFixed(1) + ' percentage points. This trend alone does not establish an intervention effect.' : 'No reportable risk data. Broaden the filters.');
  const headings = Array.from(document.querySelectorAll('#alertPanel .academic-alert-item b'), el => el.textContent);
  show('alertPanel', headings.includes('Insufficient reportable data') ? 'Broaden the filters to assess this selection.' : headings.includes('No threshold breaches detected') ? 'No configured thresholds were breached in reportable indicators. Continue monitoring.' : headings.length + ' review flags require attention. Check course-section warnings and the recommendations above.');
}

function renderAnalyticsWarning(analytics) {
  let banner = document.getElementById('analyticsWarning');
  if (!banner) {
    banner = document.createElement('aside'); banner.id = 'analyticsWarning';
    banner.className = 'analytics-warning'; banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite'); banner.setAttribute('aria-atomic', 'true');
    document.getElementById('sectionTitle').before(banner);
  }
  const sections = analytics.participation.filter(item => item.rate !== null);
  const incomplete = sections.filter(item => item.rate < 100);
  const pending = incomplete.reduce((sum, item) => sum + item.eligible - item.respondents, 0);
  const failures = analytics.heatmap.filter(cell => cell.rate !== null && cell.rate > 10);
  const risk = analytics.riskTrend[2].rate;
  const warnings = [];
  const allYears = document.getElementById('year').value === 'all';
  if (incomplete.length) warnings.push(pending + (allYears ? ' pending evaluations' : ' students have not yet evaluated') + ' across ' + incomplete.length + ' section' + (incomplete.length === 1 ? '' : 's') + '. Target: 100% participation. Send reminders and check evaluation access.');
  if (failures.length) warnings.push(failures.length + ' course-section group' + (failures.length === 1 ? ' exceeds' : 's exceed') + ' the 10% failure threshold. Arrange targeted academic support.');
  if (risk !== null && risk > 10) warnings.push('Academic risk is ' + risk.toFixed(1) + '%, above the 10% threshold. Coordinate advising.');
  banner.dataset.state = warnings.length ? 'warning' : sections.length || risk !== null ? 'clear' : 'unavailable';
  const icon = document.createElement('span'); icon.className = 'analytics-warning-icon'; icon.setAttribute('aria-hidden', 'true');
  icon.textContent = warnings.length ? '\u26A0' : '\u2139';
  const content = document.createElement('div');
  const heading = document.createElement('strong');
  heading.textContent = warnings.length ? 'Attention required' : banner.dataset.state === 'clear' ? 'No participation, failure, or risk warnings' : 'Insufficient data for alerts';
  content.append(heading);
  const detail = document.createElement('p'); detail.textContent = warnings.length ? warnings.join(' ') : banner.dataset.state === 'clear' ? 'Current reportable values meet these thresholds. Continue monitoring.' : 'Broaden the filters to assess the selected cohort.';
  content.append(detail);
  const link = document.createElement('a'); link.href = '#alertPanel'; link.textContent = 'View alerts and recommendations';
  banner.replaceChildren(icon, content, link);
}

// Configured planning dates, rather than an official university calendar.
function getAnalyticsPeriods() {
  const year = document.getElementById('year');
  const secondSemester = document.getElementById('sem').selectedIndex;
  const years = year.value === 'all' ? [2024, 2025, 2026] : [2026 - year.selectedIndex];
  return [-2, -1, 0].map(offset => {
    const entries = years.map(startYear => {
      const slot = startYear * 2 + secondSemester + offset;
      const academicYear = Math.floor(slot / 2);
      const semester = slot % 2;
      return {
        semester: semester === 0 ? '1st Semester' : '2nd Semester',
        academicYear: 'AY ' + academicYear + '-' + (academicYear + 1),
        dates: semester === 0 ? 'Aug 1 - Dec 31, ' + academicYear : 'Jan 1 - May 31, ' + (academicYear + 1),
      };
    });
    return {
      label: entries[0].semester + ' | ' + (entries.length === 1 ? entries[0].academicYear : '3 academic years (pooled)'),
      range: entries.map(entry => entry.academicYear + ': ' + entry.dates).join('; '),
      entries,
    };
  });
}
