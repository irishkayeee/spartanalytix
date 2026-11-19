// Sample drill-down records derived from the same integer totals as the KPIs.
// Evaluation items deliberately have no student identity or participation key.
function getKpiDrilldown(index) {
  const source = window.kpiSourceData[index];
  const empty = { groups: [], records: [], suppressed: true };
  if (source.suppressed) return empty;
  const semesterIndex = document.getElementById('sem').selectedIndex;
  const years = document.getElementById('year').value === 'all' ? [0, 1, 2] : [document.getElementById('year').selectedIndex];
  const allocate = (total, cohort) => Math.floor(total * (cohort.index + 1) / 20) - Math.floor(total * cohort.index / 20);
  const groups = years.flatMap(yearIndex => getSelectedDemoCohorts().map(cohort => {
    const selection = yearIndex + semesterIndex;
    const ay = 2026 - yearIndex;
    const period = `AY ${ay}–${ay + 1} · ${semesterIndex === 0 ? '1st' : '2nd'} Semester`;
    const count = total => allocate(total, cohort);
    const assessed = count(1000);
    const risk = count(86 + Math.round(selection * 1.4));
    const priorRisk = count(94 + Math.round(selection * 1.4));
    const responses = getCohortParticipationCount(cohort, selection);
    const priorResponses = getCohortParticipationCount(cohort, selection, true);
    const failures = count(78 + Math.round(selection * 2.1));
    const priorFailures = count(89 + Math.round(selection * 2.1));
    const scores = count(4320 - selection * 14);
    const teaching = scores;
    const previousTeaching = count(4180 - selection * 14);
    const relevant = index === 0 ? [risk, priorRisk] : index === 2 ? [responses, priorResponses] : index === 3 ? [failures, priorFailures] : [];
    const suppressed = isReportSuppressed(assessed) || relevant.some(value => isReportSuppressed(assessed, value));
    return { cohort, yearIndex, selection, ay, period, assessed, risk, responses, failures, scores, teaching, previousTeaching, suppressed };
  }));
  // Withhold a second row if one hidden subgroup could be recovered from totals.
  if (groups.filter(group => group.suppressed).length === 1 && groups.length > 1) {
    groups.find(group => !group.suppressed).suppressed = true;
  }
  const trackName = code => code === 'BA' ? 'Business Analytics' : 'Network Technology';
  const level = year => ['1st Year', '2nd Year', '3rd Year', '4th Year'][year - 1];
  const getStudent = (group, number) => ({
    id: `BSIT-${group.ay}-Y${group.cohort.year}-${group.cohort.id}-${String(number + 1).padStart(3, '0')}`,
    name: `Sample student ${String(group.cohort.index * 50 + number + 1).padStart(4, '0')}`,
  });
  const context = group => [group.period, level(group.cohort.year), trackName(group.cohort.specialization), group.cohort.label];
  const records = [];
  const breakdown = groups.map(group => {
    const base = context(group);
    if (group.suppressed) return [...base, 'Withheld', 'Withheld', 'Suppressed'];
    const total = group.assessed;
    if (index === 0) {
      for (let i = 0; i < group.risk; i++) {
        const student = getStudent(group, i);
        records.push([student.id, student.name, ...base, 'Risk flag R-01', 'Adviser review pending']);
      }
      return [...base, group.risk, total, (group.risk / total * 100).toFixed(1) + '%'];
    }
    if (index === 1) {
      const baseScore = Math.floor(group.scores / total);
      const higherScores = group.scores % total;
      for (let i = 0; i < total; i++) records.push([
        `ANON-${group.ay}-S${semesterIndex + 1}-G${group.cohort.index + 1}-E${String(i + 1).padStart(3, '0')}`,
        ...base, `Faculty ${group.cohort.index % 5 + 1}`, 'Overall evaluation item', i < higherScores ? baseScore + 1 : baseScore,
      ]);
      return [...base, group.scores, total, (group.scores / total).toFixed(2) + '/5'];
    }
    if (index === 2) {
      const total = getCohortEvaluatorCount(group.cohort);
      for (let i = 0; i < total; i++) {
        const student = getStudent(group, i);
        records.push([student.id, student.name, ...base, i < group.responses ? 'Completed' : 'Pending']);
      }
      return [...base, group.responses, total, (group.responses / total * 100).toFixed(1) + '%'];
    }
    if (index === 3) {
      for (let i = 0; i < group.failures; i++) {
        const student = getStudent(group, (i + 13) % total);
        records.push([student.id, student.name, ...base, portalCourses[0].label, 'Failed', 'Academic support review']);
      }
      return [...base, group.failures, total, (group.failures / total * 100).toFixed(1) + '%'];
    }
    const currentMean = group.teaching / total;
    const previousMean = group.previousTeaching / total;
    const rate = (currentMean - previousMean) / previousMean * 100;
    records.push([...base, 'Overall SETE', 'Aggregate sample', group.teaching, total, currentMean.toFixed(3), group.previousTeaching, total, previousMean.toFixed(3), (rate >= 0 ? '+' : '') + rate.toFixed(1) + '%']);
    return [...base, currentMean.toFixed(3), previousMean.toFixed(3), (rate >= 0 ? '+' : '') + rate.toFixed(1) + '%'];
  });
  const groupMeasures = [['Flagged students', 'Students assessed', 'Risk rate'], ['Valid score total', 'Rated items', 'Mean rating'], ['Completed SETE', 'Eligible evaluators', 'Response rate'], ['Failed students', 'Course enrollments', 'Failure rate'], ['Current overall mean', 'Previous overall mean', 'Improvement']];
  const contextHeaders = ['Academic period', 'Year level', 'Specialization', 'Section'];
  const recordHeaders = [
    ['Student ID', 'Student reference', ...contextHeaders, 'Risk criterion', 'Advising status'],
    ['Anonymous item ID', ...contextHeaders, 'Faculty', 'Item scope', 'Rating (1–5)'],
    ['Student ID', 'Student reference', ...contextHeaders, 'Participation status'],
    ['Student ID', 'Student reference', ...contextHeaders, 'Course', 'Outcome', 'Follow-up'],
    [...contextHeaders, 'Evaluation scope', 'Faculty', 'Current scores', 'Current items', 'Current mean', 'Previous scores', 'Previous items', 'Previous mean', 'Improvement'],
  ];
  return {
    groups: breakdown, headers: [...contextHeaders, ...groupMeasures[index]],
    records, recordHeaders: recordHeaders[index], suppressed: false,
    withheldGroups: groups.filter(group => group.suppressed).length,
    titles: ['Flagged students', 'Anonymous evaluation items', 'Evaluation participation records', 'Students with failed core-course outcomes', 'Overall rating improvement by section'],
    note: index === 1 ? 'Anonymous item identifiers have no link to student names or participation records. Overall evaluation items support the Average SETE KPI.'
      : index === 2 ? 'Participation status only. Evaluation ratings remain anonymous and are not linked to this roster.'
      : index === 4 ? 'Overall SETE mean improvement uses the same aggregate scores as the Average SETE KPI. All score sets are illustrative.'
      : index === 3 ? `Subject: ${portalCourses[0].label}, verified from the BatStateU Lipa BSIT AY 2023–2024 curriculum. Student enrollments, references, and outcomes are sample examples, not official class records.`
      : 'Student references, IDs, and flags are sample examples. R-01 is a sample flag, not an approved institutional risk policy.',
  };
}

(() => {
  const table = (element, headers, rows) => {
    element.replaceChildren();
    const head = document.createElement('thead'), header = document.createElement('tr');
    headers.forEach(label => { const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = label; header.append(cell); });
    head.append(header);
    const body = document.createElement('tbody');
    rows.forEach(values => {
      const row = document.createElement('tr');
      values.forEach(value => { const cell = document.createElement('td'); cell.textContent = typeof value === 'number' ? value.toLocaleString('en-PH') : value; row.append(cell); });
      body.append(row);
    });
    element.append(head, body);
  };
  let drilldown, page = 0, matching = [], visibleGroupRows = [], groupPage = 0;
  const size = 10;
  const update = () => {
    const start = page * size;
    table(document.getElementById('kpiRecordTable'), drilldown.recordHeaders, matching.slice(start, start + size));
    document.getElementById('kpiRecordCount').textContent = matching.length ? `${start + 1}–${Math.min(start + size, matching.length)} of ${matching.length} reportable records` : 'No reportable records match your search.';
    document.getElementById('kpiRecordPrev').disabled = page === 0;
    document.getElementById('kpiRecordNext').disabled = start + size >= matching.length;
  };
  const updateGroups = () => {
    table(document.getElementById('kpiGroupTable'), drilldown.headers, visibleGroupRows.slice(groupPage * size, (groupPage + 1) * size));
    document.getElementById('kpiGroupCount').textContent = `${groupPage * size + 1}–${Math.min((groupPage + 1) * size, visibleGroupRows.length)} of ${visibleGroupRows.length} period/year/section groups`;
    document.getElementById('kpiGroupPrev').disabled = groupPage === 0;
    document.getElementById('kpiGroupNext').disabled = (groupPage + 1) * size >= visibleGroupRows.length;
  };
  window.renderKpiDrilldown = index => {
    drilldown = getKpiDrilldown(index);
    const section = document.getElementById('kpiDrilldown');
    section.hidden = drilldown.suppressed;
    if (drilldown.suppressed) {
      document.getElementById('kpiGroupTable').replaceChildren();
      document.getElementById('kpiRecordTable').replaceChildren();
      matching = []; return;
    }
    visibleGroupRows = drilldown.groups; groupPage = 0; updateGroups();
    document.getElementById('kpiDrilldownTitle').textContent = drilldown.titles[index];
    document.getElementById('kpiDrilldownNote').textContent = drilldown.note;
    document.getElementById('kpiWithheldNotice').textContent = drilldown.withheldGroups ? `${drilldown.withheldGroups} subgroup rows and their individual records are withheld under the minimum-group-size rule. Displayed student lists may therefore be smaller than the overall KPI count.` : 'All selected subgroup rows are reportable.';
    document.getElementById('kpiRecordSearch').value = ''; page = 0; matching = drilldown.records; update();
  };
  document.getElementById('kpiRecordSearch').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    matching = drilldown.records.filter(row => row.some(value => String(value).toLowerCase().includes(query)));
    page = 0; update();
  });
  document.getElementById('kpiRecordPrev').addEventListener('click', () => { if (page > 0) { page--; update(); } });
  document.getElementById('kpiRecordNext').addEventListener('click', () => { if ((page + 1) * size < matching.length) { page++; update(); } });
  document.getElementById('kpiGroupPrev').addEventListener('click', () => { if (groupPage > 0) { groupPage--; updateGroups(); } });
  document.getElementById('kpiGroupNext').addEventListener('click', () => { if ((groupPage + 1) * size < visibleGroupRows.length) { groupPage++; updateGroups(); } });
})();
