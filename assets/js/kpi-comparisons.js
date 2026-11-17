function getKpiComparisons(delta) {
  const previous = getKpiSourceData(delta).map(record => record.previous);
  const thresholds = [10, 4, 100, 10, 3];
  const allYears = document.getElementById('year').value === 'all';
  const year = allYears ? null : Number(document.getElementById('year').value.match(/\d{4}/)[0]);
  const firstSemester = document.getElementById('sem').selectedIndex === 0;
  const start = firstSemester ? year - 1 : year;
  const period = allYears ? 'Previous semester matched to each of the three academic years' : `AY ${start}–${start + 1} · ${firstSemester ? '2nd' : '1st'} Semester`;
  return previous.map((rawPrevious, index) => {
    if (rawPrevious === null) return { suppressed: true, onTrack: null, improving: null, change: 'Small-group data withheld', previousValue: 'Suppressed', period };
    const digits = index === 1 ? 2 : 1;
    const current = parseFloat(document.getElementById(`k${index + 1}`).textContent);
    const prior = Number(rawPrevious.toFixed(digits));
    const difference = Number((current - prior).toFixed(digits));
    const lowerIsBetter = index === 0 || index === 3;
    const onTrack = lowerIsBetter ? current <= thresholds[index] : current >= thresholds[index];
    const improving = difference === 0 ? null : lowerIsBetter ? difference < 0 : difference > 0;
    const unit = index === 1 ? 'points' : 'pp';
    const arrow = difference > 0 ? '↑' : difference < 0 ? '↓' : '↔';
    const change = `${arrow} ${Math.abs(difference).toFixed(digits)} ${unit} vs previous semester`;
    const previousValue = prior.toFixed(digits) + (index === 1 ? '/5' : '%');
    return { onTrack, improving, change, previousValue, period, difference, unit };
  });
}

function updateKpiComparisons(delta) {
  window.kpiComparisons = getKpiComparisons(delta);
  window.kpiComparisons.forEach((metric, index) => {
    const status = document.getElementById(`kpiStatus${index}`);
    status.textContent = '';
    status.dataset.onTrack = String(metric.onTrack);
    status.closest('.kpi').dataset.suppressed = String(Boolean(metric.suppressed));
    const target = status.closest('.kpi').querySelector('.kpi-target-pill');
    target.dataset.onTrack = String(metric.onTrack);
    target.querySelector('.kpi-target-symbol').textContent = metric.suppressed ? '—' : metric.onTrack ? '✓' : '×';
    target.setAttribute('aria-label', `${target.querySelector('span').textContent}. ${metric.suppressed ? 'Small-group data withheld' : metric.onTrack ? 'Meets target' : 'Does not meet target'}.`);
    const change = document.getElementById(`kpiChange${index}`);
    change.textContent = metric.change;
    change.dataset.improving = String(metric.improving);
    change.dataset.comparison = `Previous: ${metric.previousValue} (${metric.period}). ${metric.unit === 'pp' ? 'pp means percentage points, not relative percent change.' : 'Change is measured in rating points on the five-point scale.'} Same BSIT year-level, specialization, and section selection; sample semester data.`;
  });
}
