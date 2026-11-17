const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../assets/js/sete-completion-model.js');

function dataset() {
  return ['2024-1', '2024-2', '2025-1'].flatMap((period, term) =>
    Array.from({ length: 40 }, (_, i) => ({
      id: `S${term}_${i}`, period,
      x: [20 + i * 2, 7, 2, 80], y: Number(i < 20),
    })));
}

test('fits earlier semesters and measures a separate latest-semester holdout', () => {
  const evaluation = engine.fit(dataset());
  assert.equal(evaluation.trainCount, 80);
  assert.equal(evaluation.testCount, 40);
  assert.equal(evaluation.validationPeriod, '2025-1');
  const { tp, fn, fp, tn } = evaluation.counts;
  assert.equal(tp + fn + fp + tn, 40);
  assert.equal(evaluation.recall, tp / (tp + fn));
  assert.equal(evaluation.precision, tp / (tp + fp));
  assert.ok(evaluation.recall > 0.8 && evaluation.precision > 0.8);
  assert.ok(engine.probability(evaluation.model, [30, 7, 2, 80]) >
    engine.probability(evaluation.model, [90, 7, 2, 80]));
});

test('validation features and outcomes never change the fitted model or scaler', () => {
  const original = dataset();
  const changed = original.map(row => row.period === '2025-1'
    ? { ...row, x: [25, 5, 2, 60], y: 1 - row.y } : row);
  assert.deepEqual(engine.fit(original).model, engine.fit(changed).model);
});

test('CSV validation rejects missing values, duplicate identities and wrong schema', () => {
  const csv = engine.headers.join(',') + '\n' + dataset()
    .map(row => [row.id, row.period, ...row.x, row.y].join(',')).join('\n');
  assert.equal(engine.parseCSV(csv).length, 120);
  assert.throws(() => engine.parseCSV(csv + '\nS0_0,2024-1,50,7,2,80,0'), /one section_id/);
  assert.throws(() => engine.parseCSV(engine.headers.join(',') + '\nX,2024-1,,7,2,80,0'), /Missing/);
  assert.throws(() => engine.parseCSV('id,sete_score\nX,4'), /template/);
});

test('insufficient periods, single-class data and invalid profiles fail explicitly', () => {
  assert.throws(() => engine.fit(dataset().filter(row => row.period === '2025-1')), /two outcome/);
  assert.throws(() => engine.fit(dataset().map(row => ({ ...row, y: 1 }))), /missed-deadline and completed-by-deadline outcomes/);
  const { model } = engine.fit(dataset());
  assert.throws(() => engine.probability(model, [105, 7, 2, 80]), /Invalid/);
  assert.throws(() => engine.probability(model, [50, 1.5, 2, 80]), /Invalid/);
});

test('no positive predictions gives undefined precision, not a misleading zero', () => {
  const constant = dataset().map((row, i) => ({ ...row, x: [50, 7, 2, 80], y: Number(i % 10 === 0) }));
  const result = engine.fit(constant);
  assert.equal(result.precision, null);
  assert.equal(result.recall, 0);
  assert.ok(result.model.scales.every(value => value === 1));
});

test('completion and deadline-day states are known, not uncertain forecasts', () => {
  const { model } = engine.fit(dataset());
  assert.equal(engine.probability(model, [100, 7, 2, 80]), 0);
  assert.equal(engine.probability(model, [50, 0, 2, 80]), 1);
  assert.throws(() => engine.probability(model, [10, 7, 12, 80]), /cannot exceed/);
  assert.throws(() => engine.parseCSV(engine.headers.join(',') + '\nBA-1,2024-1,100,7,2,80,1'), /already at 100/);
});

test('asynchronous training yields to the UI and matches synchronous results', async () => {
  let yielded = false;
  setTimeout(() => { yielded = true; }, 0);
  const actual = await engine.fitAsync(dataset());
  assert.ok(yielded);
  assert.deepEqual(actual, engine.fit(dataset()));
});
