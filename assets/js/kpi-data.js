// Illustrative aggregate source records, never official university records.
function getKpiSourceData(delta) {

  const assessed = getScopedPeriodCount(1000);
  const format = value => value.toLocaleString('en-PH');
  const percent = (numerator, denominator) => denominator > 0 ? numerator / denominator * 100 : null;
  const rate = (numerator, denominator, digits = 1) => percent(numerator, denominator).toFixed(digits) + '%';
  const risk = getScopedPeriodCount(selection => 86 + Math.round(selection * 1.4));
  const priorRisk = getScopedPeriodCount(selection => 94 + Math.round(selection * 1.4));
  const scores = getScopedPeriodCount(selection => 4320 - selection * 14);
  const priorScores = getScopedPeriodCount(selection => 4180 - selection * 14);
  const eligibleEvaluators = getScopedEvaluatorCount();
  const respondents = getScopedParticipationCount();
  const priorRespondents = getScopedParticipationCount(true);
  const failed = getScopedPeriodCount(selection => 78 + Math.round(selection * 2.1));
  const priorFailed = getScopedPeriodCount(selection => 89 + Math.round(selection * 2.1));
  const currentOverallScores = getScopedPeriodCount(selection => 4320 - selection * 14);
  const previousOverallScores = getScopedPeriodCount(selection => 4180 - selection * 14);
  const currentMean = currentOverallScores / assessed;
  const previousMean = previousOverallScores / assessed;
  const improvement = (currentMean - previousMean) / previousMean * 100;
  const records = [
    {
      current: percent(risk, assessed), previous: percent(priorRisk, assessed),
      rows: [['Students meeting approved risk criteria', risk], ['Students assessed', assessed]],
      calculation: `(${format(risk)} ÷ ${format(assessed)}) × 100 = ${rate(risk, assessed)}`,
      previousCalculation: `(${format(priorRisk)} ÷ ${format(assessed)}) × 100 = ${rate(priorRisk, assessed)}`,
    },
    {
      current: scores / assessed, previous: priorScores / assessed,
      rows: [['Sum of valid SETE rating scores', scores], ['Valid rated items', assessed], ['Rating scale', '1 to 5']],
      calculation: `${format(scores)} ÷ ${format(assessed)} = ${(scores / assessed).toFixed(2)}/5`,
      previousCalculation: `${format(priorScores)} ÷ ${format(assessed)} = ${(priorScores / assessed).toFixed(2)}/5`,
    },
    {
      current: percent(respondents, eligibleEvaluators), previous: percent(priorRespondents, eligibleEvaluators),
      rows: [['Valid SETE respondents', respondents], ['Eligible student evaluators', eligibleEvaluators]],
      calculation: `(${format(respondents)} ÷ ${format(eligibleEvaluators)}) × 100 = ${rate(respondents, eligibleEvaluators)}`,
      previousCalculation: `(${format(priorRespondents)} ÷ ${format(eligibleEvaluators)}) × 100 = ${rate(priorRespondents, eligibleEvaluators)}`,
    },
    {
      current: percent(failed, assessed), previous: percent(priorFailed, assessed),
      rows: [['Students who failed the selected core/prerequisite course', failed], ['Students enrolled in that course', assessed]],
      calculation: `(${format(failed)} ÷ ${format(assessed)}) × 100 = ${rate(failed, assessed)}`,
      previousCalculation: `(${format(priorFailed)} ÷ ${format(assessed)}) × 100 = ${rate(priorFailed, assessed)}`,
      note: `Course: ${portalCourses[0].label}. The subject name and code come from the BatStateU Lipa BSIT AY 2023–2024 curriculum. Enrollments and outcomes remain demo data. The rate uses only this course’s enrollment group.`,
    },
    {
      current: improvement, previous: (previousMean - getScopedPeriodCount(selection => 4040 - selection * 14) / assessed) / (getScopedPeriodCount(selection => 4040 - selection * 14) / assessed) * 100,
      rows: [['Evaluation scope', 'Overall SETE rating'], ['Current semester total rating scores', currentOverallScores], ['Current semester valid rated items', assessed], ['Current semester mean', currentMean.toFixed(3)], ['Previous semester total rating scores', previousOverallScores], ['Previous semester valid rated items', assessed], ['Previous semester mean', previousMean.toFixed(3)]],
      calculation: `((${currentMean.toFixed(3)} − ${previousMean.toFixed(3)}) ÷ ${previousMean.toFixed(3)}) × 100 = ${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}%`,
      previousCalculation: `((${previousMean.toFixed(3)} − ${(getScopedPeriodCount(selection => 4040 - selection * 14) / assessed).toFixed(3)}) ÷ ${(getScopedPeriodCount(selection => 4040 - selection * 14) / assessed).toFixed(3)}) × 100 = ${((previousMean - getScopedPeriodCount(selection => 4040 - selection * 14) / assessed) / (getScopedPeriodCount(selection => 4040 - selection * 14) / assessed) * 100).toFixed(1)}%`,
      note: 'Each mean equals the total valid rating scores divided by valid rated items. Improvement compares the overall SETE mean across semesters; no teaching dimensions are assumed.',
    },
  ];
  return records.map((record, index) => {
    const denominator = index === 2 ? eligibleEvaluators : assessed;
    const sensitive = index === 0 ? [risk, priorRisk] : index === 2 ? [respondents, priorRespondents] : index === 3 ? [failed, priorFailed] : [];
    const suppressed = isReportSuppressed(denominator) || sensitive.some(count => isReportSuppressed(denominator, count));
    if (!suppressed) return { ...record, suppressed: false };
    return { current: null, previous: null, suppressed: true,
      rows: [['Reporting rule', 'Minimum group size: 5']],
      calculation: 'Withheld to protect small groups.', previousCalculation: 'Withheld to prevent disclosure through comparison.',
      note: 'This selection contains a group or sensitive count below 5. Both current and previous values are withheld. Broaden the filters to view an aggregate.',
    };
  });
}

function renderKpiValues(delta) {
  window.kpiSourceData = getKpiSourceData(delta);
  window.kpiSourceData.forEach((record, index) => {
    if (record.suppressed) { document.getElementById(`k${index + 1}`).textContent = 'Suppressed'; return; }
    const value = index === 1 ? record.current.toFixed(2) + '/5'
      : (index === 4 && record.current >= 0 ? '+' : '') + record.current.toFixed(1) + '%';
    document.getElementById(`k${index + 1}`).textContent = value;
  });
}
