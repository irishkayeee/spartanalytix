(() => {
  const root = document.getElementById('predictionPanel');
  if (!root) return;
  const engine = window.SeteCompletionModel;
  const el = id => document.getElementById(id);
  const percent = value => value === null ? 'Undefined' : (value * 100).toFixed(1) + '%';
  let rows = [], evaluation = null, datasetSource = '', loadVersion = 0, training = false;
  const populatePredictionSemesters = (validationPeriod = null) => {
    const select = el('modelPredictionPeriod');
    const previous = select.value;
    const currentYear = Number(document.getElementById('year').options[0].textContent.match(/\d{4}/)[0]);
    let firstSlot = currentYear * 2;
    if (validationPeriod) {
      const [year, semester] = validationPeriod.split('-').map(Number);
      firstSlot = Math.max(firstSlot, year * 2 + semester);
    }
    const options = Array.from({ length: 6 }, (_, index) => {
      const slot = firstSlot + index;
      const year = Math.floor(slot / 2), semester = slot % 2 + 1;
      return new Option((semester === 1 ? '1st' : '2nd') + ' Semester | AY ' + year + '-' + (year + 1), year + '-' + semester);
    });
    select.replaceChildren(...options);
    if (options.some(option => option.value === previous)) select.value = previous;
    select.dispatchEvent(new Event('change'));
  };
  populatePredictionSemesters();
  let samplePage = 0;
  const renderSampleData = () => {
    const sample = datasetSource.startsWith('Synthetic') ? rows : [];
    const latest = [...new Set(sample.map(row => row.period))].sort().at(-1);
    const partition = el('modelSamplePartition').value;
    const filtered = sample.filter(row => partition === 'all' || (partition === 'validation' ? row.period === latest : row.period !== latest));
    const pages = Math.max(1, Math.ceil(filtered.length / 15));
    samplePage = Math.min(samplePage, pages - 1);
    const body = el('modelSampleRows'); body.replaceChildren();
    filtered.slice(samplePage * 15, (samplePage + 1) * 15).forEach(row => {
      const [year, semester] = row.period.split('-').map(Number);
      const tr = document.createElement('tr');
      const values = [row.id, (semester === 1 ? '1st' : '2nd') + ' sem, AY ' + year + '-' + (year + 1), row.x[0] + '%', row.x[1], row.x[2], row.x[3] + '%', row.y ? 'Missed deadline' : 'Completed', row.period === latest ? 'Validation' : 'Training'];
      values.forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); });
      body.append(tr);
    });
    el('modelSampleTotals').textContent = sample.length + ' records: ' + sample.filter(row => row.period !== latest).length + ' training / ' + sample.filter(row => row.period === latest).length + ' validation';
    el('modelSamplePage').textContent = filtered.length ? (samplePage * 15 + 1) + '-' + Math.min((samplePage + 1) * 15, filtered.length) + ' of ' + filtered.length : 'No sample records loaded';
    el('modelSamplePrevious').disabled = samplePage === 0;
    el('modelSampleNext').disabled = samplePage >= pages - 1;
  };
  el('modelSampleModal').addEventListener('show.bs.modal', renderSampleData);
  el('modelSamplePartition').addEventListener('change', () => { samplePage = 0; renderSampleData(); });
  el('modelSamplePrevious').addEventListener('click', () => { samplePage--; renderSampleData(); });
  el('modelSampleNext').addEventListener('click', () => { samplePage++; renderSampleData(); });
  const setTraining = busy => {
    training = busy;
    root.setAttribute('aria-busy', String(busy));
    const button = el('modelTrain');
    button.classList.toggle('is-loading', busy);
    button.setAttribute('aria-busy', String(busy));
    button.textContent = busy ? 'Training...' : 'Train and evaluate';
    button.setAttribute('aria-label', busy ? 'Training and evaluating' : 'Train and evaluate');
    button.disabled = busy || !rows.length;
    el('modelDataset').disabled = busy;
    el('modelExample').disabled = busy;
  };
  let statusFadeTimer, statusHideTimer;
  const resetStatusFade = () => {
    clearTimeout(statusFadeTimer); clearTimeout(statusHideTimer);
    el('modelStatus').classList.remove('is-fading');
  };
  const status = (text, error = false) => {
    resetStatusFade();
    el('modelStatus').hidden = false;
    el('modelStatus').textContent = text;
    el('modelStatus').dataset.state = error ? 'error' : 'info';
  };
  const clearModel = () => {
    resetStatusFade();
    evaluation = null;
    populatePredictionSemesters();
    ['modelMetrics', 'modelConfusion', 'modelCoefficients', 'modelResult', 'modelOverallInsights', 'modelEvaluationDetails'].forEach(id => { el(id).hidden = true; });
    el('modelEvaluationDetails').open = false;
    el('modelCoefficients').open = false;
    el('modelValidation').textContent = '';
    el('modelExportStatus').textContent = '';
    el('modelPredict').disabled = true; el('modelDownload').disabled = true;
  };
  const load = (csv, source) => {
    clearModel(); rows = []; el('modelTrain').disabled = true;
    el('modelViewSample').hidden = true;
    rows = engine.parseCSV(csv);
    if (rows.length > 2000) { rows = []; throw Error('Use at most 2,000 section-period records per browser training run.'); }
    datasetSource = source;
    samplePage = 0; el('modelSamplePartition').value = 'all';
    el('modelViewSample').hidden = !source.startsWith('Synthetic');
    
    status(rows.length + ' records ready' + (source.startsWith('Synthetic') ? ' ? Synthetic example data.' : ' ? Uploaded CSV.') );
    el('modelTrain').disabled = false;
  };
  el('modelDataset').addEventListener('change', async event => {
    const version = ++loadVersion, file = event.target.files[0];
    clearModel(); rows = []; el('modelTrain').disabled = true;
    el('modelViewSample').hidden = true;
    el('modelDataset').removeAttribute('aria-invalid');
    el('modelFileName').textContent = file ? file.name : 'No file selected';
    if (!file) { status('No dataset selected.'); return; }
    const rejectFile = message => {
      el('modelDataset').value = '';
      el('modelDataset').setAttribute('aria-invalid', 'true');
      el('modelFileName').textContent = 'Choose a valid CSV file';
      status(message, true);
    };
    const csvTypes = ['', 'text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel', 'application/octet-stream'];
    if (!/\.csv$/i.test(file.name) || !csvTypes.includes(file.type.toLowerCase())) {
      rejectFile('Only CSV files are accepted. Images, PDFs, and other file types cannot be used.'); return;
    }
    if (file.size > 2 * 1024 * 1024) { rejectFile('CSV must be 2 MB or smaller.'); return; }
    status('Reading and validating CSV...');
    try { const csv = await file.text(); if (version === loadVersion) load(csv, 'Uploaded historical records (not independently verified)'); }
    catch (error) { if (version === loadVersion) rejectFile(error.message); }
  });
  el('modelTemplate').addEventListener('click', () => {
    const csv = engine.headers.join(',') + '\r\n';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'sete-completion-template.csv';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  el('modelExample').addEventListener('click', () => {
    ++loadVersion; el('modelDataset').value = '';
    el('modelDataset').removeAttribute('aria-invalid');
    el('modelFileName').textContent = 'Example dataset selected';
    // Reproducible synthetic records for exercising the workflow, not evidence.
    let seed = 20261115;
    const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
    const data = [engine.headers.join(',')];
    ['2023-1', '2023-2', '2024-1', '2024-2', '2025-1', '2025-2'].forEach(period => {
      bsitSections.forEach(section => {
        const current = Math.floor(random() * 39) * 2.5;
        const days = 1 + Math.floor(random() * 21);
        const recent = Math.floor(random() * (Math.min(12, current * 0.4) + 1));
        const previous = 60 + Math.floor(random() * 17) * 2.5;
        const probability = 1 / (1 + Math.exp(-(-0.5 + (80 - current) * 0.065 - days * 0.1 - recent * 0.16 + (90 - previous) * 0.025)));
        data.push([section.id, period, current, days, recent, previous, Number(random() < probability)].join(','));
      });
    });
    try { load(data.join('\n'), 'Synthetic example data - not real section records'); }
    catch (error) { status(error.message, true); }
  });
  el('modelTrain').addEventListener('click', () => {
    if (training || !rows.length) return;
    clearModel(); setTraining(true);
    status('Training and evaluating...');
    const version = loadVersion;
    setTimeout(async () => {
      if (version !== loadVersion) { setTraining(false); return; }
      try {
        evaluation = await engine.fitAsync(rows);
        populatePredictionSemesters(evaluation.validationPeriod);
        el('modelRecall').textContent = percent(evaluation.recall);
        el('modelPrecision').textContent = percent(evaluation.precision);
        ['tp', 'fn', 'fp', 'tn'].forEach(key => { el('model' + key.toUpperCase()).textContent = evaluation.counts[key]; });
        const { tp, fn, fp } = evaluation.counts;
        el('modelInsightSummary').textContent = tp + ' of ' + (tp + fn) + ' missed deadlines identified; ' + fn + ' missed and ' + fp + ' false alarms.';
        el('modelInsightAction').textContent = 'Prioritize reminders to help avoid delays in viewing grades. ' + (datasetSource.startsWith('Synthetic') ? 'Based on synthetic example data only.' : 'Validate on more semesters before use.');
        const [testYear, testSemester] = evaluation.validationPeriod.split('-').map(Number);
        el('modelValidation').textContent = 'The model learned from ' + evaluation.trainCount + ' section records across ' + evaluation.trainingPeriods.length + ' earlier semesters. It was then tested on ' + evaluation.testCount + ' records from the ' + (testSemester === 1 ? '1st' : '2nd') + ' semester of AY ' + testYear + '-' + (testYear + 1) + '. These test records were not used for training. Each record represents one section in one semester.';
        const body = el('modelCoefficientRows'); body.replaceChildren();
        engine.names.forEach((name, i) => {
          const row = document.createElement('tr');
          const label = document.createElement('td'); label.textContent = name;
          const value = document.createElement('td'); value.textContent = Math.abs(evaluation.model.weights[i]) < 0.001 ? 'Little change in the predicted chance of missing the deadline' : evaluation.model.weights[i] < 0 ? 'Lower predicted chance of missing the deadline' : 'Higher predicted chance of missing the deadline';
          row.append(label, value); body.append(row);
        });
        ['modelMetrics', 'modelConfusion', 'modelCoefficients', 'modelOverallInsights', 'modelEvaluationDetails'].forEach(id => { el(id).hidden = false; });
        updateRecordedRates(); el('modelDownload').disabled = false;
        status(datasetSource.startsWith('Synthetic') ? 'Training complete. Results are based on synthetic example data.' : 'Training complete. Results require validation.');
        statusFadeTimer = setTimeout(() => {
          el('modelStatus').classList.add('is-fading');
          statusHideTimer = setTimeout(() => { el('modelStatus').hidden = true; }, 400);
        }, 8000);
      } catch (error) { clearModel(); status(error.message, true); }
      finally { setTraining(false); }
    }, 30);
  });
  function updateRecordedRates() {
    const period = el('modelPredictionPeriod').value;
    const section = el('modelSection').value;
    const record = getSeteSectionSnapshot(period, section);
    const form = el('modelScenario');
    form.elements.current_response_rate.value = record ? record.currentRate.toFixed(1) : '';
    form.elements.previous_completion_rate.value = record ? record.previousCompletionRate.toFixed(1) : '';
    el('modelRateSource').textContent = record ? 'Auto-filled from section records: ' + record.respondents + ' of ' + record.eligible + ' evaluations completed.' : 'No recorded rates for this semester. Choose a semester with available records.';
    el('modelPredict').disabled = !evaluation || !record;
    el('modelResult').hidden = true;
  }
  el('modelSection').addEventListener('change', updateRecordedRates);
  el('modelPredictionPeriod').addEventListener('change', updateRecordedRates);
  updateRecordedRates();
  ['days_remaining', 'new_responses_7d'].forEach(name => {
    el('modelScenario').elements[name].addEventListener('blur', event => {
      if (event.target.value.trim() === '') {
        event.target.value = '0';
        el('modelResult').hidden = true;
      }
    });
  });
  el('modelScenario').addEventListener('input', () => { el('modelResult').hidden = true; });
  el('modelScenario').addEventListener('submit', event => {
    event.preventDefault(); if (!evaluation) return;
    el('modelResult').hidden = true;
    try {
      const data = new FormData(event.target);
      const period = String(data.get('prediction_period'));
      if (!/^20\d{2}-[12]$/.test(period) || period <= evaluation.validationPeriod) throw Error('Prediction semester must follow the held-out validation semester.');
      const record = getSeteSectionSnapshot(period, String(data.get('section_id')));
      if (!record) throw Error('No recorded participation rates for this section and semester.');
      const x = engine.features.map(feature => feature === 'current_response_rate' ? record.currentRate : feature === 'previous_completion_rate' ? record.previousCompletionRate : Number(data.get(feature)));
      const probability = engine.probability(evaluation.model, x);
      el('modelProbability').textContent = percent(probability);
      const section = String(data.get('section_id'));
      const pending = Math.max(0, 40 - Math.round(x[0] * 40 / 100));
      el('modelInterpretation').textContent = section + ': ' + pending + ' evaluations remaining out of 40. Prediction semester: ' + period + '. ' + (datasetSource.startsWith('Synthetic') ? 'Illustrative estimate from synthetic participation histories; not a validated forecast for a real section.' : 'Experimental estimate from uploaded participation histories. Review data quality and calibration before operational use.');
      const action = document.createElement('p');
      action.textContent = x[0] === 100 ? 'Already complete: no additional responses are needed.' : x[1] === 0 ? 'Deadline reached below target. Follow up with pending evaluators and check access issues that may delay grade viewing.' : probability >= 0.5 ? 'Suggested action: prioritize a reminder for this section so pending evaluators can complete SETE before viewing grades.' : 'Suggested action: continue monitoring; remind pending evaluators before the deadline to avoid delays in viewing grades.';
      const oldAction = el('modelResult').querySelector('.model-next-action');
      oldAction?.remove(); action.className = 'model-next-action'; el('modelResult').append(action);
      el('modelResult').hidden = false;
    } catch (error) { status(error.message, true); }
  });
  el('modelDownload').addEventListener('click', () => {
    if (!evaluation) return;
    let report;
    try {
      report = window.open('', '_blank');
      if (!report) throw Error('Allow pop-ups to open the PDF report, then try again.');
      const doc = report.document;
      doc.open();
      doc.write('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SETE Reminder Prioritization Report</title></head><body></body></html>');
      doc.close();
      const style = doc.createElement('style');
      style.textContent = 'body{max-width:900px;margin:32px auto;padding:0 24px;font:13px/1.6 Arial,sans-serif;color:#26364D}h1{color:#7D2638;font-size:24px;border-bottom:2px solid #7D2638;padding-bottom:12px}h2{font-size:16px;color:#711C2D;margin-top:24px}p{margin:8px 0}.notice{padding:12px;border-left:3px solid #C88B27;background:#FFF8EA}.controls{display:flex;gap:12px;align-items:center;margin-bottom:20px}button{background:#7D2638;color:white;border:0;border-radius:7px;padding:10px 16px;cursor:pointer}li{margin:5px 0}section{break-inside:avoid}@media print{@page{size:A4;margin:16mm}body{margin:0;padding:0;max-width:none;font-size:11px}.controls{display:none}}';
      doc.head.append(style);
      const add = (tag, text, parent = doc.body) => {
        const node = doc.createElement(tag); node.textContent = text; parent.append(node); return node;
      };
      const controls = add('div', ''); controls.className = 'controls';
      const print = add('button', 'Print / Save PDF', controls); print.type = 'button';
      print.addEventListener('click', () => report.print());
      add('span', 'Choose Save as PDF in the print dialog.', controls);
      add('h1', 'SPARTANalytix | SETE Reminder Prioritization Report');
      add('p', 'Generated: ' + new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }) + ' PHT');
      const notice = add('p', 'Experimental model; not institutionally validated. ' + datasetSource + '.'); notice.className = 'notice';
      add('h2', 'Purpose and data');
      add('p', 'Identify sections that may remain below 100% participation at the deadline, so reminders can be prioritized before grade-viewing delays occur. Each section has 40 evaluators. Students must evaluate before viewing grades.');
      add('p', 'Technique: L2-regularized logistic regression. Inputs are current response rate, days remaining, responses in the preceding seven days, and previous completion rate.');
      add('p', el('modelValidation').textContent);
      const results = add('section', '');
      add('h2', 'Test results', results);
      add('p', 'Recall: ' + percent(evaluation.recall) + '. Precision: ' + percent(evaluation.precision) + '.', results);
      add('p', 'Recall measures actual missed deadlines identified; precision measures predicted misses that occurred. Undefined precision means no positive predictions were made.', results);
      const counts = evaluation.counts;
      add('p', 'True positives: ' + counts.tp + '; false negatives: ' + counts.fn + '; false positives: ' + counts.fp + '; true negatives: ' + counts.tn + '.', results);
      add('h2', 'Key Insights', results);
      add('p', el('modelInsightSummary').textContent, results);
      add('p', el('modelInsightAction').textContent, results);
      add('h2', 'What affects the prediction?');
      const list = add('ul', '');
      engine.names.forEach((name, i) => add('li', name + ': ' + (Math.abs(evaluation.model.weights[i]) < 0.001 ? 'little change' : evaluation.model.weights[i] < 0 ? 'a higher value lowers the predicted chance of missing the deadline' : 'a higher value raises the predicted chance of missing the deadline'), list));
      add('p', 'These patterns keep the other factors the same. They do not prove cause and effect.');
      if (!el('modelResult').hidden) {
        const scenario = add('section', ''); add('h2', 'Current scenario forecast', scenario);
        const form = new FormData(el('modelScenario'));
        engine.features.forEach((feature, i) => add('p', engine.names[i] + ': ' + form.get(feature), scenario));
        add('p', 'Probability of missing completion: ' + el('modelProbability').textContent, scenario);
        add('p', el('modelInterpretation').textContent, scenario);
        add('p', el('modelResult').querySelector('.model-next-action')?.textContent || '', scenario);
      }
      add('p', 'Use forecasts to prioritize reminders and access support. Internet access, reminder timing, deadlines, and grade-viewing requirements may affect participation. Low participation is not evidence of poor teaching; these forecasts must not automatically determine faculty personnel decisions. Historical data should follow the same grade-viewing policy. Validate performance before operational use; example results do not establish real-world accuracy.');
      report.opener = null;
      el('modelExportStatus').textContent = 'Report opened. Choose Save as PDF in the print dialog.';
      setTimeout(() => { if (!report.closed) { report.focus(); report.print(); } }, 150);
    } catch (error) {
      report?.close();
      el('modelExportStatus').textContent = error.message || 'Unable to open the PDF report.';
    }
  });
})();
