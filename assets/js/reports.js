(() => {
  const csvButton = document.getElementById('downloadCsv');
  const printButton = document.getElementById('printReport');
  if (!csvButton || !printButton) return;
  const status = document.getElementById('reportExportStatus');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const reportValue = value => value && typeof value === 'object' ? value.course + ' / ' + value.section + ': ' + (value.rate === null ? 'No data' : value.rate.toFixed(1) + '%') + ' (' + value.failed + '/' + value.enrolled + ')' : value;
  const csvCell = value => {
    value = reportValue(value);
    let text = String(value ?? '');
    if (typeof value !== 'number' && /^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const chartImage = chart => {
    const canvas = document.createElement('canvas');
    canvas.width = 900; canvas.height = 360;
    canvas.style.position = 'fixed'; canvas.style.left = '-10000px';
    document.body.append(canvas);
    let snapshot;
    try {
      snapshot = new Chart(canvas, { type: chart.config.type,
        data: JSON.parse(JSON.stringify(chart.data)),
        options: { responsive: false, animation: false, maintainAspectRatio: false,
          indexAxis: chart.options.indexAxis,
          scales: JSON.parse(JSON.stringify(chart.config.options.scales || {})),
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } } },
        },
      });
      return snapshot.toBase64Image();
    } finally { snapshot?.destroy(); canvas.remove(); }
  };
  const collect = () => {
    const definitions = JSON.parse(document.getElementById('kpiDefinitions').textContent);
    const includeRecords = document.getElementById('includeReportRecords').checked;
    return {
      generated: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }) + ' PHT',
      scope: getPortalFilterSummary(), includeRecords,
      indicators: definitions.map(([label, , target], index) => ({
        label, target, value: document.getElementById(`k${index + 1}`).textContent,
        comparison: window.kpiComparisons[index], source: window.kpiSourceData[index],
        details: includeRecords ? getKpiDrilldown(index) : null,
      })),
      alerts: Array.from(document.querySelectorAll('#alertPanel .academic-alert-item')).map(item => ({ title: item.querySelector('b').textContent, description: Array.from(item.querySelectorAll('p'), paragraph => paragraph.textContent).join(' ') })),
      charts: ['seteChart', 'passChart', 'standingChart'].filter(id => document.getElementById(id)).map(id => {
        const canvas = document.getElementById(id), chart = Chart.getChart(canvas);
        return { title: canvas.closest('.panel').querySelector('h3').firstChild.textContent.trim(),
          labels: chart.data.datasets[0]?.heatmap ? chart.data.datasets[0].data.map(cell => cell.course + ' / ' + cell.section) : Array.from(chart.data.labels), datasets: chart.data.datasets.map(series => ({ label: series.label, data: Array.from(series.data) })),
          image: chartImage(chart),
        };
      }),
    };
  };
  const download = (content, type, name) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a'); link.href = url; link.download = name;
    document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  csvButton.addEventListener('click', () => {
    csvButton.disabled = true;
    try {
      const report = collect();
      const rows = [['SPARTANalytix Academic Analytics Report'], ['Generated', report.generated], ['Filters', report.scope], ['Data notice', 'Sample records only. Not official university records. SETE ratings remain anonymous.'], []];
      rows.push(['KPI', 'Current value', 'Target', 'Target status', 'Previous value', 'Previous period', 'Change']);
      report.indicators.forEach(item => rows.push([item.label, item.value, item.target, item.source.suppressed ? 'Withheld' : item.comparison.onTrack ? 'Meets target' : 'Needs review', item.comparison.previousValue, item.comparison.period, item.comparison.change]));
      report.indicators.forEach(item => {
        rows.push([], [item.label + ' - Source calculation'], ['Measure', 'Value'], ...item.source.rows, ['Calculation', item.source.calculation], ['Previous calculation', item.source.previousCalculation]);
        if (item.details && !item.details.suppressed) {
          rows.push([], ['Period, year level, specialization, and section breakdown'], item.details.headers, ...item.details.groups);
          rows.push([], ['Supporting records'], [item.details.note], item.details.recordHeaders, ...item.details.records);
        }
      });
      report.charts.forEach(chart => {
        rows.push([], [chart.title], ['Category', ...chart.datasets.map(series => series.label)]);
        chart.labels.forEach((label, index) => rows.push([label, ...chart.datasets.map(series => series.data[index] ?? 'Withheld')]));
      });
      rows.push([], ['Academic alerts'], ['Flag', 'Recommended review']);
      report.alerts.forEach(alert => rows.push([alert.title, alert.description]));
      const stamp = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
      download('\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n'), 'text/csv;charset=utf-8', `SPARTANalytix-report-${stamp}.csv`);
      status.textContent = 'CSV report downloaded for the current filters.';
    } catch {
      status.textContent = 'Unable to create the report. Refresh the dashboard and try again.';
    } finally { csvButton.disabled = false; }
  });
  const htmlTable = (headers, rows) => `<div class="table-wrap"><table><thead><tr>${headers.map(value => `<th>${escape(value)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(value => `<td>${escape(reportValue(value))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  printButton.addEventListener('click', () => {
    let reportWindow;
    try {
      const report = collect();
      reportWindow = window.open('', '_blank');
      if (!reportWindow) { status.textContent = 'Allow pop-ups for this site to open the print-ready report.'; return; }
      const summary = htmlTable(['Indicator', 'Current', 'Target', 'Status', 'Previous', 'Change'], report.indicators.map(item => [item.label, item.value, item.target, item.source.suppressed ? 'Withheld' : item.comparison.onTrack ? 'Meets target' : 'Needs review', item.comparison.previousValue, item.comparison.change]));
      const sources = report.indicators.map(item => `<section><h2>${escape(item.label)}</h2>${htmlTable(['Source measure', 'Value'], item.source.rows)}<p><b>Calculation:</b> ${escape(item.source.calculation)}</p><p><b>Previous period:</b> ${escape(item.comparison.period)}</p><p><b>Previous calculation:</b> ${escape(item.source.previousCalculation)}</p>${item.details && !item.details.suppressed ? `<h3>Breakdown by period and section</h3>${htmlTable(item.details.headers, item.details.groups)}<h3>Supporting records</h3><p>${escape(item.details.note)}</p>${htmlTable(item.details.recordHeaders, item.details.records)}` : ''}</section>`).join('');
      const charts = report.charts.map(chart => `<section class="chart-section"><h2>${escape(chart.title)}</h2><img class="report-chart" src="${chart.image}" alt="${escape(chart.title)}">${htmlTable(['Category', ...chart.datasets.map(series => series.label)], chart.labels.map((label, index) => [label, ...chart.datasets.map(series => series.data[index] ?? 'Withheld')]))}</section>`).join('');
      reportWindow.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SPARTANalytix Report</title><style>
        *{box-sizing:border-box}body{font:12px/1.6 Arial,sans-serif;color:#26364D;background:#fff;margin:0;padding:32px;max-width:1200px;margin:auto}h1{font-size:25px;margin-bottom:4px}h2{font-size:17px;margin-top:28px}h3{font-size:14px}header{border-bottom:2px solid #7D2638;padding-bottom:18px}.notice{background:#f7f4ef;padding:12px;border-radius:8px}table{border-collapse:collapse;width:100%;margin:12px 0;font-size:11px}td,th{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#f6f6f6}.table-wrap{overflow:auto}.report-chart{width:100%;max-height:380px;object-fit:contain}.print-controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:24px}.print-controls button{padding:10px 18px;background:#7D2638;color:white;border:0;border-radius:7px;cursor:pointer}.chart-section{break-inside:avoid}footer{margin-top:30px;border-top:1px solid #ddd;padding-top:12px;color:#657084}@media print{@page{size:landscape;margin:12mm}body{padding:0;max-width:none;font-size:10px}.print-controls{display:none}table{font-size:9px}thead{display:table-header-group}tr{break-inside:avoid}.table-wrap{overflow:visible}.report-chart{max-height:280px}a{color:inherit}}
      </style></head><body><div class="print-controls"><button id="printDocument" type="button">Print / Save PDF</button><span>Choose “Save as PDF” in your browser’s print dialog.</span></div><header><h1>SPARTANalytix Academic Analytics Report</h1><p><b>Generated:</b> ${escape(report.generated)}<br><b>Filters:</b> ${escape(report.scope)}</p></header><p class="notice">Sample data only. Student names, enrollment records, faculty labels, and results are not official university records. SETE ratings remain anonymous. ${report.includeRecords ? 'Supporting records are included.' : 'Supporting records are excluded.'}</p><h2>KPI summary</h2>${summary}${sources}<h2>Academic alerts</h2>${report.alerts.map(alert => `<p><b>${escape(alert.title)}:</b> ${escape(alert.description)}</p>`).join('')}${charts}<footer>&copy; ${new Date().getFullYear()} SPARTANalytix. Generated from the current dashboard selection.</footer></body></html>`);
      reportWindow.document.close();
      reportWindow.document.getElementById('printDocument').addEventListener('click', () => reportWindow.print());
      reportWindow.opener = null;
      const images = Array.from(reportWindow.document.images);
      Promise.all(images.map(image => image.decode().catch(() => {}))).then(() => { if (!reportWindow.closed) { reportWindow.focus(); reportWindow.print(); } });
      status.textContent = 'Print-ready report opened. Choose Save as PDF in the print dialog.';
    } catch {
      reportWindow?.close();
      status.textContent = 'Unable to open the report. Refresh the dashboard and try again.';
    }
  });
})();
