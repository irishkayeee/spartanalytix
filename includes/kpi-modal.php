<div class="modal fade" id="kpiModal" tabindex="-1" aria-labelledby="kpiModalTitle" aria-describedby="kpiModalPurpose" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content kpi-modal">
      <div class="modal-header">
        <h2 class="modal-title fs-5" id="kpiModalTitle">Indicator details</h2>
      </div>
      <div class="modal-body">
        <p id="kpiModalFilters" class="kpi-modal-filters"></p>
        <div class="kpi-modal-summary">
          <strong id="kpiModalValue"></strong>
          <span id="kpiModalStatus" class="kpi-modal-status"></span>
          <p id="kpiModalTarget" class="mb-0"></p>
          <p id="kpiModalChange" class="mb-0"></p>
          <p id="kpiModalPrevious" class="mb-0"></p>
        </div>
        <section class="kpi-source-section" aria-labelledby="kpiSourceTitle">
          <h3 id="kpiSourceTitle">Data behind this number</h3>
          <p class="kpi-source-label">Illustrative aggregate records for your selected filters</p>
          <div class="table-responsive">
            <table class="table table-sm kpi-source-table">
              <thead><tr><th scope="col">Source measure</th><th scope="col">Sample value</th></tr></thead>
              <tbody id="kpiSourceRows"></tbody>
            </table>
          </div>
          <h4>Calculation</h4>
          <p id="kpiSourceCalculation" class="kpi-calculation"></p>
          <p id="kpiSourceNote" class="kpi-source-label" hidden></p>
          <details class="kpi-previous-calculation">
            <summary>Previous semester calculation</summary>
            <p id="kpiPreviousCalculation"></p>
          </details>
        </section>
        <section class="kpi-drilldown" id="kpiDrilldown" aria-labelledby="kpiBreakdownTitle">
          <h3 id="kpiBreakdownTitle">Breakdown by academic period, year, and section</h3>
          <p class="kpi-demo-disclosure">Demo data only. Student references, IDs, faculty labels, enrollments, outcomes, and flags are sample records. Subject names and codes use the <a href="https://batstateu.edu.ph/wp-content/uploads/2025/03/BSIT-Curriculum-2023-2024.pdf" target="_blank" rel="noopener noreferrer">BatStateU Lipa BSIT AY 2023–2024 curriculum</a>.</p>
          <div class="table-responsive drilldown-scroll"><table class="table table-sm drilldown-table" id="kpiGroupTable"></table></div>
          <div class="drilldown-pagination">
            <span id="kpiGroupCount" role="status" aria-live="polite"></span>
            <div><button type="button" id="kpiGroupPrev">Previous</button><button type="button" id="kpiGroupNext">Next</button></div>
          </div>
          <p class="kpi-source-label" id="kpiWithheldNotice"></p>
          <h3 id="kpiDrilldownTitle">Supporting records</h3>
          <p class="kpi-source-label" id="kpiDrilldownNote"></p>
          <label class="visually-hidden" for="kpiRecordSearch">Search supporting demo records</label>
          <input type="search" class="form-control drilldown-search" id="kpiRecordSearch" placeholder="Search reference, ID, section, year, or course…" autocomplete="off">
          <div class="table-responsive drilldown-scroll"><table class="table table-sm drilldown-table" id="kpiRecordTable"></table></div>
          <div class="drilldown-pagination">
            <span id="kpiRecordCount" role="status" aria-live="polite"></span>
            <div><button type="button" id="kpiRecordPrev">Previous</button><button type="button" id="kpiRecordNext">Next</button></div>
          </div>
        </section>
        <dl class="kpi-modal-details">
          <dt>Purpose</dt><dd id="kpiModalPurpose"></dd>
          <dt>Formula</dt><dd id="kpiModalFormula"></dd>
          <dt>Recommended action</dt><dd id="kpiModalAction"></dd>
        </dl>
        <p class="kpi-modal-note">Demonstration only. These sample values are not official university records. Review underlying records with authorized personnel before taking action.</p>
      </div>
      <div class="modal-footer"><button type="button" class="welcome-dismiss" data-bs-dismiss="modal">Close</button></div>
    </div>
  </div>
</div>
