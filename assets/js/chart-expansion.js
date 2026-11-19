(() => {
  const element = document.getElementById('chartModal');
  if (!element || !window.bootstrap || !window.Chart) return;
  const modal = new bootstrap.Modal(element);
  let source, expanded, opener, sourceInspector;
  const inspection = document.getElementById('expandedInspection');
  const inspector = document.getElementById('expandedInspector');
  const detail = document.getElementById('expandedInspectionDetail');
  const syncInspection = () => {
    if (!sourceInspector) return;
    inspector.value = sourceInspector.value;
    detail.textContent = sourceInspector.closest('.chart-details').querySelector('p').textContent;
  };
  inspector.addEventListener('change', () => {
    if (!sourceInspector) return;
    sourceInspector.value = inspector.value;
    sourceInspector.dispatchEvent(new Event('change'));
    syncInspection();
  });
  document.querySelectorAll('.panel .chart canvas').forEach(canvas => {
    const heading = canvas.closest('.panel').querySelector('h3');
    const title = heading.firstChild.textContent.trim();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chart-expand-button';
    button.setAttribute('aria-label', `Expand ${title}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/></svg>';
    heading.append(button);
    button.addEventListener('click', () => {
      source = Chart.getChart(canvas);
      if (!source) return;
      opener = button;
      sourceInspector = canvas.closest('.panel').querySelector('.chart-details select');
      inspection.hidden = !sourceInspector;
      if (sourceInspector) {
        inspector.replaceChildren(...Array.from(sourceInspector.options, option => new Option(option.textContent, option.value)));
        sourceInspector.addEventListener('change', syncInspection);
        syncInspection();
      }
      document.getElementById('chartModalTitle').textContent = title;
      document.getElementById('expandedChart').setAttribute('aria-label', title);
      document.getElementById('chartModalContext').textContent = getPortalFilterSummary();
      modal.show();
    });
  });
  element.addEventListener('shown.bs.modal', () => {
    const data = JSON.parse(JSON.stringify(source.data));
    data.datasets.forEach((dataset, index) => { dataset.hidden = !source.isDatasetVisible(index); });
    expanded = new Chart(document.getElementById('expandedChart'), {
      type: source.config.type, data,
      options: {
        responsive: true, maintainAspectRatio: false,
        indexAxis: source.options.indexAxis,
        onClick: (event, points, chart) => {
          source.config.options.onClick?.(event, points, chart);
          syncInspection();
        },
        onHover: source.config.options.onHover,
        scales: JSON.parse(JSON.stringify(source.config.options.scales || {})),
        plugins: { ...source.config.options.plugins },
      },
    });
  });
  element.addEventListener('hidden.bs.modal', () => {
    sourceInspector?.removeEventListener('change', syncInspection);
    sourceInspector = null;
    expanded?.destroy(); expanded = null; source = null;
    opener?.focus({ preventScroll: true });
  });
})();
