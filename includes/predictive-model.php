<section class="panel prediction-panel" id="predictionPanel" aria-labelledby="predictionTitle">
  <div class="prediction-heading"><div><h3 id="predictionTitle">SETE Reminder Prioritization</h3><p>Which sections need an early reminder to avoid delays in viewing grades?</p></div><span class="model-badge">Experimental · Requires validation</span></div>
  <p class="model-notice">Use completion forecasts to prioritize evaluation reminders before the deadline. Students must evaluate before viewing grades. Predictions are experimental.</p>
  <div class="model-layout">
    <div class="model-card">
      <h4>Train and evaluate</h4>
      <p>Upload historical participation data or try the example.</p>
      <label for="modelDataset">Participation dataset</label>
      <div class="model-file-picker">
        <span class="model-file-action" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 16V3m-4 4 4-4 4 4M4 15v6h16v-6"/></svg>Choose CSV</span>
        <span id="modelFileName" class="model-file-name" aria-hidden="true">No file selected</span>
        <input type="file" id="modelDataset" accept=".csv" aria-describedby="modelStatus">
      </div>
      <div class="model-actions"><button type="button" id="modelExample">Load example data</button><button type="button" id="modelTemplate">Download CSV template</button><button type="button" id="modelTrain" disabled>Train and evaluate</button></div>
      <button type="button" class="model-view-sample" id="modelViewSample" data-bs-toggle="modal" data-bs-target="#modelSampleModal" hidden>View sample data</button>
      <p id="modelStatus" role="status" aria-live="polite">Choose a dataset to begin.</p>
      <details class="model-csv-guide"><summary>CSV format and requirements</summary>
        <p>Use the CSV template. Add one row per section per semester.</p>
        <ul>
          <li>Each section has 40 evaluators. Rates must be 0-100%.</li>
          <li>Include at least 2 semesters: 10 earlier records for training and 5 latest records for testing.</li>
          <li>Include sections that completed and missed the deadline in both groups. Maximum: 2,000 records.</li>
        </ul>
        <details><summary>Column guide</summary>
          <ul>
            <li><b>section_id:</b> Section name, such as BA-1.</li>
            <li><b>outcome_period:</b> Semester, such as 2025-1 for the first semester of AY 2025-2026.</li>
            <li><b>current_response_rate:</b> Percentage who had responded at the time of the snapshot.</li>
            <li><b>days_remaining:</b> Days left before the deadline.</li>
            <li><b>new_responses_7d:</b> Responses received in the previous 7 days; cannot exceed current respondents.</li>
            <li><b>previous_completion_rate:</b> Final response percentage from the previous semester.</li>
            <li><b>missed_deadline:</b> 1 if below 100% at the deadline; 0 if completed.</li>
          </ul>
          <p>Record the inputs before the deadline outcome. Avoid missing values and duplicate section-semester rows.</p>
        </details>
        <p class="model-note">Data stays in this tab and clears on reload. Dashboard filters do not change it. Use history with the same grade-viewing policy. Small test results still need further validation.</p>
      </details>   <div class="model-metrics" id="modelMetrics" hidden>
        <div><small>Recall</small><strong id="modelRecall"></strong><span>Missed deadlines identified</span></div>
        <div><small>Precision</small><strong id="modelPrecision"></strong><span>Predicted misses that occurred</span></div>
      </div>
      <div class="model-overall-insights" id="modelOverallInsights" hidden aria-live="polite"><strong>Key Insights</strong><p id="modelInsightSummary"></p><p id="modelInsightAction"></p></div>
      <details class="model-evaluation-details" id="modelEvaluationDetails" hidden><summary>Evaluation details</summary>
      <p id="modelValidation"></p>
      <div class="model-table-wrap" id="modelConfusion" hidden><table><caption>How the predictions compared with the actual results</caption><thead><tr><th>What actually happened</th><th>Expected to miss the deadline</th><th>Expected to finish on time</th></tr></thead><tbody><tr><th>Missed the deadline</th><td id="modelTP"></td><td id="modelFN"></td></tr><tr><th>Finished on time</th><td id="modelFP"></td><td id="modelTN"></td></tr></tbody></table></div>
      <p class="model-note">For this test, a predicted chance of 50% or higher means the model expects the section to miss the deadline. Below 50% means it expects completion on time. More testing and school review are needed before relying on these predictions.</p>
      </details>
    </div>
    <div class="model-card">
      <h4>Check reminder priority</h4>
      <p>Choose a section. Recorded rates fill in automatically.</p>
      <form id="modelScenario">
        <div class="model-inputs">
          <label>Prediction semester<select name="prediction_period" id="modelPredictionPeriod" required><option value="2026-1">1st Semester | AY 2026-2027</option></select></label>
          <label>Section<select name="section_id" id="modelSection"><option value="BA-1">BA-1</option><option value="BA-2">BA-2</option><option value="BA-3">BA-3</option><option value="NT-1">NT-1</option><option value="NT-2">NT-2</option></select></label>
          <label>Current response rate (%)<input name="current_response_rate" readonly aria-describedby="modelRateSource" placeholder="Not available" type="number" min="0" max="100" step="0.1" value="90" required></label>
          <label>Days until deadline<input name="days_remaining" type="number" min="0" max="180" step="1" value="0" required><small>0 = deadline day</small></label>
          <label>New responses in the last 7 days<input name="new_responses_7d" type="number" min="0" max="40" step="1" value="0" required></label>
          <label>Previous completion rate (%)<input name="previous_completion_rate" readonly aria-describedby="modelRateSource" placeholder="Not available" type="number" min="0" max="100" step="0.1" value="90" required></label>
        </div>
        <p class="model-rate-source" id="modelRateSource" role="status" aria-live="polite"></p>
        <div class="model-forecast-actions">
          <button type="submit" id="modelPredict" disabled>Estimate probability</button>
          <button type="button" id="modelDownload" disabled>Print / Save PDF</button>
        </div>
      </form>
      <div class="model-result" id="modelResult" hidden aria-live="polite"><small>Probability of missing 100% completion by the deadline</small><strong id="modelProbability"></strong><p id="modelInterpretation"></p><p>Remind pending evaluators early to help avoid delays in viewing grades.</p></div>
      <details class="model-coefficient-details" id="modelCoefficients" hidden><summary>What affects the prediction?</summary><div class="model-table-wrap"><table><caption>Patterns found in the training data</caption><thead><tr><th>Factor</th><th>When this value increases</th></tr></thead><tbody id="modelCoefficientRows"></tbody></table><p class="model-note">These are patterns the model found while keeping the other factors the same. They do not prove that a factor causes a missed deadline.</p></div></details>
      <p id="modelExportStatus" role="status" aria-live="polite"></p>
    </div>
  </div>
</section>
<div class="modal fade" id="modelSampleModal" tabindex="-1" aria-labelledby="modelSampleTitle" aria-describedby="modelSampleDescription" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content model-sample-modal">
      <div class="modal-header"><h2 class="modal-title fs-5" id="modelSampleTitle">Sample participation data</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close sample data"></button></div>
      <div class="modal-body">
        <p id="modelSampleDescription">These are the exact synthetic records loaded for this model. Earlier semesters are used for training; the latest semester is held out for validation.</p>
        <div class="model-sample-toolbar"><label for="modelSamplePartition">Show <select id="modelSamplePartition"><option value="all">All records</option><option value="training">Training records</option><option value="validation">Validation records</option></select></label><span id="modelSampleTotals"></span></div>
        <div class="model-sample-table"><table><caption class="visually-hidden">Loaded sample records and their training or validation assignment</caption><thead><tr><th scope="col">Section</th><th scope="col">Semester</th><th scope="col">Response rate</th><th scope="col">Days left</th><th scope="col">New responses (7 days)</th><th scope="col">Previous completion</th><th scope="col">Deadline outcome</th><th scope="col">Used for</th></tr></thead><tbody id="modelSampleRows"></tbody></table></div>
        <div class="model-sample-pagination"><button type="button" id="modelSamplePrevious">Previous</button><span id="modelSamplePage" role="status" aria-live="polite"></span><button type="button" id="modelSampleNext">Next</button></div>
      </div>
      <div class="modal-footer"><button type="button" class="welcome-dismiss" data-bs-dismiss="modal">Close</button></div>
    </div>
  </div>
</div>
