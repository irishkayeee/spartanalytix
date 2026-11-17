const bsitSections = [
  { id: 'BA-1', specialization: 'BA', label: 'BA · Section 1' },
  { id: 'BA-2', specialization: 'BA', label: 'BA · Section 2' },
  { id: 'BA-3', specialization: 'BA', label: 'BA · Section 3' },
  { id: 'NT-1', specialization: 'NT', label: 'NT · Section 1' },
  { id: 'NT-2', specialization: 'NT', label: 'NT · Section 2' },
];

function getSelectedDemoCohorts(yearOverride) {
  const year = yearOverride || document.getElementById('yearLevel').value;
  const specialization = document.getElementById('specialization').value;
  const section = document.getElementById('section').value;
  return Array.from({ length: 4 }, (_, index) => index + 1).flatMap(level =>
    bsitSections.map((item, index) => ({ ...item, year: level, index: (level - 1) * 5 + index }))
  ).filter(item => (year === 'all' || item.year === Number(year))
    && (specialization === 'all' || item.specialization === specialization)
    && (section === 'all' || item.id === section));
}

// Distribute integer demo totals across 20 year/section cohorts. Any filtered
// subset adds back to the same overall source count without rounding drift.
function getScopedDemoCount(total, yearOverride) {
  return getSelectedDemoCohorts(yearOverride).reduce((sum, cohort) =>
    sum + Math.floor(total * (cohort.index + 1) / 20) - Math.floor(total * cohort.index / 20), 0);
}

function getScopedPeriodCount(total, yearOverride) {
  const year = document.getElementById('year');
  const semester = document.getElementById('sem').selectedIndex;
  const selections = year.value === 'all' ? [semester, semester + 1, semester + 2] : [year.selectedIndex + semester];
  return selections.reduce((sum, selection) => sum + getScopedDemoCount(typeof total === 'function' ? total(selection) : total, yearOverride), 0);
}

function getPortalFilterSummary() {
  return ['year', 'sem', 'yearLevel', 'specialization', 'section'].map(id => {
    const select = document.getElementById(id);
    return select.options[select.selectedIndex].textContent;
  }).join(' · ');
}

function getScopedPassRate(rate) {
  return getScopedDemoCount(Math.round(rate * 10)) / getScopedDemoCount(1000) * 100;
}

function getScopedSeteRatings(delta) {
  return [4400, 4200, 4300, 4500].map(total => getScopedPeriodCount(selection => total - selection * 14) / getScopedPeriodCount(1000));
}

function getScopedStanding() {
  const selected = document.getElementById('yearLevel').value;
  const levels = selected === 'all' ? [1, 2, 3, 4] : [Number(selected)];
  const rates = [85, 80, 78, 90];
  const good = levels.map(year => {
    const cohorts = getSelectedDemoCohorts(String(year));
    const totalGood = Math.round(250 * rates[year - 1] / 100);
    const count = cohorts.reduce((sum, cohort) => {
      const sectionIndex = cohort.index % 5;
      return sum + Math.floor(totalGood * (sectionIndex + 1) / 5) - Math.floor(totalGood * sectionIndex / 5);
    }, 0);
    return count / (cohorts.length * 50) * 100;
  });
  return { labels: levels.map(year => ['1st Year', '2nd Year', '3rd Year', '4th Year'][year - 1]), good, support: good.map(value => 100 - value) };
}

document.getElementById('specialization').addEventListener('change', () => {
  const section = document.getElementById('section');
  const previous = section.value;
  const track = document.getElementById('specialization').value;
  section.replaceChildren(new Option('All Sections', 'all'));
  bsitSections.filter(item => track === 'all' || item.specialization === track)
    .forEach(item => section.add(new Option(item.label, item.id)));
  if (Array.from(section.options).some(option => option.value === previous)) section.value = previous;
});

// Section-specific sample participation, shared by charts, KPIs and records.
function getCohortParticipationCount(cohort, period, previous = false) {
  const rates = { 'BA-1': 92, 'BA-2': 76, 'BA-3': 86, 'NT-1': 68, 'NT-2': 90 };
  const eligible = getCohortEvaluatorCount(cohort);
  const rate = Math.max(0, Math.min(100, rates[cohort.id] - period * 2 - (cohort.year - 1) + (previous ? -4 : 0)));
  return Math.round(eligible * rate / 100);
}
function getScopedParticipationCount(previous = false, sectionId = null) {
  const year = document.getElementById('year');
  const sem = document.getElementById('sem').selectedIndex;
  const periods = year.value === 'all' ? [sem, sem + 1, sem + 2] : [year.selectedIndex + sem];
  return periods.reduce((sum, period) => sum + getSelectedDemoCohorts().filter(cohort => !sectionId || cohort.id === sectionId).reduce((count, cohort) => count + getCohortParticipationCount(cohort, period, previous), 0), 0);
}

// Each section has 40 eligible evaluators per semester across four year levels.
function getCohortEvaluatorCount(cohort) {
  return Math.floor(40 * cohort.year / 4) - Math.floor(40 * (cohort.year - 1) / 4);
}
function getScopedEvaluatorCount(sectionId = null) {
  const year = document.getElementById('year');
  const periods = year.value === 'all' ? 3 : 1;
  return periods * getSelectedDemoCohorts().filter(cohort => !sectionId || cohort.id === sectionId).reduce((sum, cohort) => sum + getCohortEvaluatorCount(cohort), 0);
}

// Recorded sample section snapshots, independent of dashboard cohort filters.
function getSeteSectionSnapshot(period, sectionId) {
  const match = /^(20\d{2})-([12])$/.exec(period);
  const sectionIndex = bsitSections.findIndex(section => section.id === sectionId);
  if (!match || sectionIndex < 0) return null;
  const latestYear = Number(document.getElementById('year').options[0].textContent.match(/\d{4}/)[0]);
  const year = Number(match[1]), semester = Number(match[2]) - 1;
  if (year < latestYear - 2 || year > latestYear) return null;
  const selection = latestYear - year + semester;
  const cohorts = [1, 2, 3, 4].map(level => ({ id: sectionId, year: level, index: (level - 1) * 5 + sectionIndex }));
  const eligible = cohorts.reduce((sum, cohort) => sum + getCohortEvaluatorCount(cohort), 0);
  const respondents = cohorts.reduce((sum, cohort) => sum + getCohortParticipationCount(cohort, selection), 0);
  const priorCompleted = cohorts.reduce((sum, cohort) => sum + getCohortParticipationCount(cohort, selection, true), 0);
  return { eligible, respondents, currentRate: respondents / eligible * 100, previousCompletionRate: priorCompleted / eligible * 100 };
}
