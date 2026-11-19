<section class="report-actions" aria-label="Download reports">
  <div class="report-options">
    <span class="report-actions-label">Export current selection</span>
    <div class="report-records-option">
      <label><input type="checkbox" id="includeReportRecords" aria-describedby="reportRecordsHelp"> Include supporting records</label>
      <p id="reportRecordsHelp">Adds sample SETE ratings, completion status, course failures, and risk flags.</p>
    </div>
  </div>
  <div class="report-action-buttons">
    <button type="button" class="report-download" id="downloadCsv"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/></svg>Download CSV</button>
    <button type="button" class="report-print" id="printReport">Print / Save PDF</button>
  </div>
  <p class="report-export-status" id="reportExportStatus" role="status" aria-live="polite"></p>
</section>
