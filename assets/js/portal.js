const colors = { blue: '#14283F', navy: '#0C1B2A' };
function activityBlue(value, min = 0, max = 100) {
  const weight = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const light = [220, 227, 234], dark = [12, 27, 42];
  return 'rgb(' + light.map((channel, index) => Math.round(channel + (dark[index] - channel) * weight)).join(',') + ')';
}
let charts = [];
Chart.Interaction.modes.heatmapCell = (chart, event) => {
  if (!chart.isPointInArea(event)) return [];
  const { x, y } = chart.scales;
  const section = x.getLabelForValue(x.getValueForPixel(event.x));
  const course = y.getLabelForValue(y.getValueForPixel(event.y));
  const index = chart.data.datasets[0].data.findIndex(cell => cell.x === section && cell.y === course);
  return index < 0 ? [] : [{ element: chart.getDatasetMeta(0).data[index], datasetIndex: 0, index }];
};
// Draw a full grid with values, so the heatmap remains readable without color.
Chart.register({ id: 'courseHeatmap', beforeLayout(chart) {
  if (!chart.data.datasets[0]?.heatmap) return;
  chart.options.scales.y.ticks.callback = function(value) {
    const label = this.getLabelForValue(value);
    return chart.width < 620 ? portalCourses.find(course => course.label === label)?.code || label : label;
  };
}, afterDatasetsDraw(chart) {
  if (!chart.data.datasets[0]?.heatmap) return;
  const { ctx, scales: { x, y } } = chart;
  const cells = chart.data.datasets[0].data;
  const width = (x.right - x.left) / x.getLabels().length;
  const height = (y.bottom - y.top) / y.getLabels().length;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold ' + (width < 45 ? 10 : 12) + 'px Arial';
  cells.forEach(cell => {
    const px = x.getPixelForValue(cell.x), py = y.getPixelForValue(cell.y);
    ctx.fillStyle = cell.rate === null ? '#F1F5F9' : activityBlue(cell.rate, 0, 15);
    ctx.fillRect(px - width / 2 + 2, py - height / 2 + 2, width - 4, height - 4);
    ctx.fillStyle = cell.rate >= 8 ? '#fff' : '#14283F';
    ctx.fillText(cell.rate === null ? 'No data' : cell.rate.toFixed(1) + '%', px, py);
  }); ctx.restore();
} });
// Keep semester labels readable in dashboards, expanded charts, and exports.
Chart.register({ id: 'readableSemesterLabels', beforeLayout(chart) {
  if (chart.config.type !== 'line' || !chart.data.labels?.some(label => String(label).includes('Semester |'))) return;
  chart.options.scales.x.ticks.callback = function(value) {
    const parts = this.getLabelForValue(value).split(' | ');
    if (chart.width < 480) return [parts[0].replace('Semester', 'Sem'), (parts[1] || '').replace('AY ', '').replace(/(20\d{2})-(20)(\d{2})/, '$1-$3').replace('3 academic years (pooled)', '3 years pooled')];
    return parts;
  };
  chart.options.scales.x.ticks.maxRotation = 0;
  chart.options.scales.x.ticks.font = { size: chart.width < 480 ? 10 : 11 };
} });
// Shared canvas styling also appears in enlarged charts and report images.
Chart.register({ id: 'responseTarget', beforeLayout(chart) {
  if (chart.data.datasets[0]?.responseTarget == null) return;
  chart.options.layout.padding.top = Math.max(36, chart.options.layout.padding.top || 0);
  chart.options.layout.padding.right = Math.max(12, chart.options.layout.padding.right || 0);
}, afterDraw(chart) {
  const target = chart.data.datasets[0]?.responseTarget;
  if (target == null) return;
  const { ctx, chartArea, scales: { x } } = chart;
  const pixel = x.getPixelForValue(target);
  ctx.save();
  ctx.strokeStyle = '#C88B27'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(pixel, chartArea.top); ctx.lineTo(pixel, chartArea.bottom); ctx.stroke();
  ctx.setLineDash([]); ctx.font = 'bold 11px Arial';
  const label = target + '% TARGET', badgeWidth = ctx.measureText(label).width + 28;
  const badgeX = Math.min(pixel - badgeWidth / 2, chart.width - badgeWidth - 2);
  const badgeY = chartArea.top - 34;
  ctx.fillStyle = '#FFF8EA'; ctx.beginPath(); ctx.roundRect(badgeX, badgeY, badgeWidth, 24, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7D2638'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, badgeX + badgeWidth / 2 + 5, badgeY + 12);
  ctx.strokeStyle = '#B8791B'; ctx.beginPath(); ctx.arc(badgeX + 12, badgeY + 12, 5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(badgeX + 10, badgeY + 14); ctx.lineTo(badgeX + 16, badgeY + 8); ctx.stroke();
  ctx.fillStyle = '#C88B27'; ctx.beginPath(); ctx.moveTo(pixel - 5, chartArea.top - 9); ctx.lineTo(pixel + 5, chartArea.top - 9); ctx.lineTo(pixel, chartArea.top - 3); ctx.fill();
  ctx.font = 'bold 11px Arial'; ctx.fillStyle = '#222';
  chart.getDatasetMeta(0).data.forEach((bar, i) => {
    const value = chart.data.datasets[0].data[i]; if (value == null || !chart.isDatasetVisible(0)) return;
    const text = value.toFixed(1) + '%';
    const inside = bar.x + ctx.measureText(text).width + 10 > chartArea.right;
    ctx.textAlign = inside ? 'right' : 'left'; ctx.fillStyle = inside ? '#fff' : '#222';
    ctx.fillText(text, bar.x + (inside ? -6 : 6), bar.y);
  });
  ctx.restore();
} });
function setupAnalyticsLayout(panelId) {
  const panel = document.getElementById(panelId);
  panel.classList.add('analytics-split');
  if (panel.querySelector('.response-layout')) return;
  const layout = document.createElement('div'); layout.className = 'response-layout';
  const card = document.createElement('div'); card.className = 'response-chart-card';
  const sidebar = document.createElement('div'); sidebar.className = 'response-sidebar';
  const legend = panel.querySelector('.heatmap-legend');
  if (legend) card.append(legend);
  card.append(panel.querySelector('.chart')); layout.append(card, sidebar); panel.append(layout);
}
function inspectChart(id, entries) {
  const panel = document.getElementById(id).closest('.panel');
  let area = panel.querySelector('.chart-details');
  if (!area) {
    area = document.createElement('div'); area.className = 'chart-details';
    const label = document.createElement('label'); label.textContent = 'Inspect data: ';
    const select = document.createElement('select'); select.id = id + 'Inspector'; label.htmlFor = select.id;
    const output = document.createElement('p'); output.setAttribute('aria-live', 'polite');
    area.append(label, select, output); (panel.querySelector('.response-sidebar') || panel).append(area);
  }
  const select = area.querySelector('select'), output = area.querySelector('p');
  select.replaceChildren(...entries.map((entry, i) => new Option(entry.label, String(i))));
  const update = () => { output.textContent = entries[Number(select.value)]?.detail || 'No reportable data for this selection.'; };
  select.onchange = update; update();
  return index => { select.value = String(index); select.dispatchEvent(new Event('change')); };
}
function makeChart(id, type, labels, datasets, scales, extra = {}) {
  charts.push(new Chart(document.getElementById(id), { type, data: { labels, datasets }, options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
    scales, ...extra,
  } }));
}
function render() {
  charts.forEach(chart => chart.destroy()); charts = [];
  const selection = (document.getElementById('year').value === 'all' ? 1 : document.getElementById('year').selectedIndex) + document.getElementById('sem').selectedIndex;
  renderKpiValues(selection * .35); updateKpiComparisons(selection * .35);
  const analytics = getAnalyticsCharts();
  const participation = analytics.participation;
  const yearLevel = document.getElementById('yearLevel');
  document.getElementById('heatmapPeriod').textContent =
    analytics.periods[2].label + ' | ' + yearLevel.options[yearLevel.selectedIndex].textContent;
  setupAnalyticsLayout('setePanel');
  setupAnalyticsLayout('passPanel');
  setupAnalyticsLayout('standingPanel');
  const inspectSete = inspectChart('seteChart', participation.map(item => ({ label: getSectionDisplayLabel(item.section), detail: getSectionDisplayLabel(item.section) + ': ' + (item.rate === null ? 'no reportable rate.' : item.rate.toFixed(1) + '%. ' + (item.eligible - item.respondents) + ' of ' + item.eligible + ' students have not yet evaluated. ' + item.respondents + ' have completed their evaluation. Target: 100%.') })));
  makeChart('seteChart', 'bar', participation.map(item => getSectionDisplayLabel(item.section)), [
    { label: 'SETE Response Rate (%)', responseTarget: 100, data: participation.map(item => item.rate), backgroundColor: participation.map(item => item.rate === null ? '#F1F5F9' : 'rgb(' + [125, 38, 56].map((channel, i) => Math.round([219, 197, 201][i] + (channel - [219, 197, 201][i]) * Math.max(0, Math.min(1, (item.rate - 60) / 30)))).join(',') + ')') },
  ], { x: { beginAtZero: true, max: 100, title: { display: true, text: 'Response rate (%)' } }, y: { title: { display: true, text: 'Section' } } }, {
    indexAxis: 'y', onClick: (event, points) => { if (points.length) inspectSete(points[0].index); },
    onHover: (event, points) => { if (event.native?.target) event.native.target.style.cursor = points.length ? 'pointer' : 'default'; },
  });
  const cells = analytics.heatmap;
  const inspectCourse = inspectChart('passChart', cells.map(cell => ({ label: cell.course + ' / ' + getSectionDisplayLabel(cell.section), detail: cell.course + ' / ' + getSectionDisplayLabel(cell.section) + ': ' + (cell.rate === null ? 'no reportable rate.' : cell.rate.toFixed(1) + '%. ' + (cell.rate > 10 ? 'Warning: above the 10% threshold. Review course delivery and arrange targeted support.' : 'Within the 10% threshold. Continue monitoring.')) })));
  makeChart('passChart', 'bubble', analytics.sections.map(section => getSectionDisplayLabel(section.id)), [{
    label: 'Course-section failure rate (%)', heatmap: true, pointStyle: 'rect',
    data: cells.map(cell => ({ ...cell, x: getSectionDisplayLabel(cell.section), y: cell.course, r: 18 })), backgroundColor: 'transparent', borderWidth: 0,
  }], {
    x: { type: 'category', labels: analytics.sections.map(section => getSectionDisplayLabel(section.id)), offset: true, grid: { display: false }, title: { display: true, text: 'Section' } },
    y: { type: 'category', labels: analytics.courses.labels, offset: true, grid: { display: false }, title: { display: true, text: 'Course' } },
  }, {
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'heatmapCell',
        displayColors: false,
        callbacks: {
          title: ([{ raw }]) => raw.course,
          label: ({ raw }) => [
            'Section: ' + raw.x,
            raw.rate === null ? 'No reportable data' : `Failure rate: ${raw.rate.toFixed(1)}% (${raw.failed} of ${raw.enrolled})`,
          ],
        },
      },
    },
    onHover: (event, points, chart) => {
      const area = chart.chartArea;
      if (event.native?.target) event.native.target.style.cursor = event.x >= area.left && event.x <= area.right && event.y >= area.top && event.y <= area.bottom ? 'pointer' : 'default';
    },
    onClick: (event, points, chart) => {
      const x = chart.scales.x.getValueForPixel(event.x), y = chart.scales.y.getValueForPixel(event.y);
      if (event.x < chart.chartArea.left || event.x > chart.chartArea.right || event.y < chart.chartArea.top || event.y > chart.chartArea.bottom) return;
      const index = cells.findIndex(cell => cell.section === analytics.sections[x]?.id && cell.course === analytics.courses.labels[y]);
      if (index >= 0) inspectCourse(index);
    },
  });
  const periodLabels = analytics.periodLabels;
  const unit = document.getElementById('year').value === 'all' ? 'student-semester records' : 'students';
  const viewedOn = new Date().toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'short', day: 'numeric' });
  const inspectRisk = inspectChart('standingChart', analytics.riskTrend.map((point, i) => ({ label: periodLabels[i], detail: periodLabels[i] + '. Scheduled dates: ' + analytics.periods[i].range + '. ' + (point.rate === null ? 'No reportable rate.' : 'At academic risk: ' + point.rate.toFixed(1) + '%. Target: at most 10%.') + ' Viewed on ' + viewedOn + '.' })));
  makeChart('standingChart', 'line', periodLabels, [
    { label: 'Academic risk (%)', data: analytics.riskTrend.map(point => point.rate), borderColor: '#7D2638', backgroundColor: '#7D263818', pointBackgroundColor: '#7D2638', pointRadius: 4, pointHoverRadius: 6, fill: true, tension: .2 },
    { label: 'Threshold (10%)', data: [10, 10, 10], borderColor: '#C88B27', borderDash: [6, 4], pointRadius: 0 },
  ], { y: { beginAtZero: true, suggestedMax: 15, title: { display: true, text: 'At-risk share (%)' } } }, {
    onClick: (event, points) => { if (points.length) inspectRisk(points[0].index); },
  });
  renderAcademicAlerts(window.kpiSourceData, analytics);
  renderKeyInsights(analytics);
}
document.querySelectorAll('.filters select').forEach(select => select.addEventListener('change', render));
function clock() {
  document.getElementById('clock').textContent = new Date().toLocaleString('en-PH', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' }) + ' PHT';
}
clock(); setInterval(clock, 60000); render();
