/* Section-level SETE deadline prediction; separate from current participation alerts. */
(() => {
  const features = ['current_response_rate', 'days_remaining', 'new_responses_7d', 'previous_completion_rate'];
  const headers = ['section_id', 'outcome_period', ...features, 'missed_deadline'];
  const names = ['Current response rate', 'Days until deadline', 'New responses in the last 7 days', 'Previous completion rate'];
  const sigmoid = z => z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
  function validateInputs(values) {
    const ranges = [[0, 100], [0, 180], [0, 40], [0, 100]];
    if (values.length !== features.length) throw Error('Four SETE inputs are required.');
    values.forEach((value, i) => {
      if (!Number.isFinite(value) || value < ranges[i][0] || value > ranges[i][1] || ([1, 2].includes(i) && !Number.isInteger(value))) throw Error('Invalid ' + names[i] + '. Check its range and definition.');
    });
    if (values[2] > Math.round(values[0] * 40 / 100)) throw Error('New responses cannot exceed current respondents out of 40 evaluators.');
  }
  function parseCSV(text) {
    // The fixed schema contains no free-form fields requiring embedded delimiters.
    const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
    if (lines.length < 2) throw Error('CSV has no records.');
    const cells = line => line.split(',').map(value => value.trim().replace(/^"([^"\r\n]*)"$/, '$1'));
    if (cells(lines[0]).join(',') !== headers.join(',')) throw Error('CSV columns must match the template exactly, in order.');
    const seen = new Set();
    return lines.slice(1).map((line, index) => {
      const fields = cells(line);
      if (fields.length !== headers.length || fields.some(value => value === '')) throw Error('Missing or invalid fields on row ' + (index + 2) + '.');
      const [id, period] = fields;
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(id) || seen.has(id + '|' + period)) throw Error('Use one section_id per outcome_period on row ' + (index + 2) + '.');
      seen.add(id + '|' + period);
      if (!/^20\d{2}-[12]$/.test(period)) throw Error('outcome_period must use YYYY-1 or YYYY-2.');
      const x = fields.slice(2, -1).map(Number), y = Number(fields.at(-1));
      validateInputs(x);
      if (y !== 0 && y !== 1) throw Error('missed_deadline must be 0 or 1.');
      if (x[0] === 100 && y === 1) throw Error('A section already at 100% cannot be labelled as missing completion.');
      if (x[1] === 0 && y !== Number(x[0] < 100)) throw Error('Deadline-day outcome must match the current completion rate.');
      return { id, period, x, y };
    });
  }
  function probability(model, x) {
    validateInputs(x);
    if (x[0] === 100) return 0;
    if (x[1] === 0) return 1;
    return sigmoid(model.intercept + x.reduce((sum, value, i) => sum + model.weights[i] * (value - model.means[i]) / model.scales[i], 0));
  }
  function* fitSteps(rows) {
    const periods = [...new Set(rows.map(row => row.period))].sort();
    if (periods.length < 2) throw Error('At least two outcome semesters are required.');
    const validationPeriod = periods.at(-1);
    const train = rows.filter(row => row.period !== validationPeriod), test = rows.filter(row => row.period === validationPeriod);
    if (train.length < 10 || test.length < 5) throw Error('Need at least 10 earlier section-period rows and 5 latest-semester validation rows.');
    if ([train, test].some(part => new Set(part.map(row => row.y)).size < 2)) throw Error('Both training and validation must contain missed-deadline and completed-by-deadline outcomes.');
    const means = features.map((_, i) => train.reduce((sum, row) => sum + row.x[i], 0) / train.length);
    const scales = means.map((mean, i) => Math.sqrt(train.reduce((sum, row) => sum + (row.x[i] - mean) ** 2, 0) / train.length) || 1);
    const standardized = train.map(row => row.x.map((value, i) => (value - means[i]) / scales[i]));
    const weights = features.map(() => 0);
    const prevalence = train.reduce((sum, row) => sum + row.y, 0) / train.length;
    let intercept = Math.log(prevalence / (1 - prevalence));
    const regularization = 0.01;
    for (let iteration = 0; iteration < 2500; iteration++) {
      if (iteration % 50 === 0) yield;
      let biasGradient = 0;
      const gradient = weights.map(value => regularization * value);
      train.forEach((row, index) => {
        const x = standardized[index];
        const error = sigmoid(intercept + weights.reduce((sum, value, i) => sum + value * x[i], 0)) - row.y;
        biasGradient += error / train.length;
        gradient.forEach((_, i) => { gradient[i] += error * x[i] / train.length; });
      });
      intercept -= 0.1 * biasGradient;
      weights.forEach((_, i) => { weights[i] -= 0.1 * gradient[i]; });
    }
    const model = { features, means, scales, weights, intercept, regularization, threshold: 0.5 };
    const counts = { tp: 0, fn: 0, fp: 0, tn: 0 };
    test.forEach(row => { const predicted = probability(model, row.x) >= 0.5; counts[row.y ? predicted ? 'tp' : 'fn' : predicted ? 'fp' : 'tn']++; });
    const recall = counts.tp / (counts.tp + counts.fn);
    const precision = counts.tp + counts.fp ? counts.tp / (counts.tp + counts.fp) : null;
    return { model, counts, recall, precision, trainCount: train.length, testCount: test.length, validationPeriod, trainingPeriods: periods.slice(0, -1) };
  }
  function fit(rows) {
    const steps = fitSteps(rows);
    let step;
    do { step = steps.next(); } while (!step.done);
    return step.value;
  }
  async function fitAsync(rows) {
    const steps = fitSteps(rows);
    let step = steps.next();
    while (!step.done) {
      // Let the browser paint the spinner and respond between training batches.
      await new Promise(resolve => setTimeout(resolve, 0));
      step = steps.next();
    }
    return step.value;
  }
  const api = { parseCSV, fit, fitAsync, probability, features, names, headers };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.SeteCompletionModel = api;
})();
