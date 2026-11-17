const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function dashboard() {
  const fields = {
    year: { value: 'AY 2026-2027', selectedIndex: 0, options: [{ textContent: 'AY 2026-2027' }] },
    sem: { selectedIndex: 0 }, yearLevel: { value: 'all' },
    specialization: { value: 'all', addEventListener() {} },
    section: { value: 'all', addEventListener() {} },
  };
  const context = vm.createContext({ document: { getElementById: id => fields[id] }, window: {} });
  for (const file of ['cohort-filters', 'course-catalog', 'analytics', 'kpi-data']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js', file + '.js'), 'utf8'), context);
  }
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/js/kpi-drilldown.js'), 'utf8').split('\n(() => {')[0], context);
  return { fields, context, read: expression => vm.runInContext(expression, context) };
}

test('520 valid filter combinations reconcile charts, KPIs and supporting records', () => {
  const { fields, context, read } = dashboard();
  let checked = 0;
  for (const year of [0, 1, 2, 3]) for (const sem of [0, 1]) for (const level of ['all', '1', '2', '3', '4']) {
    for (const specialization of ['all', 'BA', 'NT']) for (const section of ['all', 'BA-1', 'BA-2', 'BA-3', 'NT-1', 'NT-2']) {
      if (section !== 'all' && specialization !== 'all' && !section.startsWith(specialization)) continue;
      Object.assign(fields.year, { selectedIndex: year, value: year === 3 ? 'all' : `AY ${2026 - year}-${2027 - year}` });
      fields.sem.selectedIndex = sem; fields.yearLevel.value = level;
      fields.specialization.value = specialization; fields.section.value = section;
      const analytics = read('getAnalyticsCharts()');
      context.window.kpiSourceData = read('getKpiSourceData(0)');
      const kpis = context.window.kpiSourceData, detail = read('getKpiDrilldown(2)');
      const eligible = analytics.participation.reduce((sum, row) => sum + row.eligible, 0);
      const responses = analytics.participation.reduce((sum, row) => sum + row.respondents, 0);
      assert.ok(Math.abs(responses / eligible * 100 - kpis[2].current) < 1e-9);
      assert.equal(detail.records.length, eligible);
      assert.equal(detail.records.filter(row => row.at(-1) === 'Completed').length, responses);
      assert.ok(Math.abs(analytics.riskTrend[2].rate - kpis[0].current) < 1e-9);
      assert.ok(Math.abs(analytics.riskTrend[1].rate - kpis[0].previous) < 1e-9);
      analytics.courses.labels.forEach((course, i) => {
        const cells = analytics.heatmap.filter(cell => cell.course === course);
        assert.equal(cells.reduce((sum, cell) => sum + cell.failed, 0), analytics.courses.currentCounts[i]);
        assert.equal(cells.reduce((sum, cell) => sum + cell.enrolled, 0), analytics.courses.total);
      });
      checked++;
    }
  }
  assert.equal(checked, 520);
});

test('default participation is 40 per section and semester labels cross academic years correctly', () => {
  const { read } = dashboard();
  const analytics = read('getAnalyticsCharts()');
  assert.equal(analytics.participation.length, 5);
  assert.ok(analytics.participation.every(row => row.eligible === 40));
  assert.equal(analytics.periods[1].range, 'AY 2025-2026: Jan 1 - May 31, 2026');
  assert.equal(analytics.periods[2].label, '1st Semester | AY 2026-2027');
  assert.equal(read("getSeteSectionSnapshot('2026-1', 'BA-1').currentRate"), analytics.participation[0].rate);
  assert.equal(read("getSeteSectionSnapshot('2027-1', 'BA-1')"), null);
});

test('evaluation items are anonymous and other records use sample student references', () => {
  const { context, read } = dashboard();
  context.window.kpiSourceData = read('getKpiSourceData(0)');
  const participation = read('getKpiDrilldown(2)'), ratings = read('getKpiDrilldown(1)');
  assert.ok(participation.records.every(row => row[1].startsWith('Sample student ')));
  assert.ok(ratings.records.every(row => row[0].startsWith('ANON-')));
  assert.ok(!ratings.recordHeaders.includes('Student ID'));
  assert.ok(!ratings.recordHeaders.includes('Student reference'));
});
