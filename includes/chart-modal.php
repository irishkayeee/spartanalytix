<div class="modal fade" id="chartModal" tabindex="-1" aria-labelledby="chartModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content expanded-chart-modal">
      <div class="modal-header">
        <h2 class="modal-title fs-5" id="chartModalTitle">Expanded chart</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close expanded chart"></button>
      </div>
      <div class="modal-body">
        <p class="expanded-chart-context" id="chartModalContext"></p>
        <div class="expanded-chart-canvas"><canvas id="expandedChart" role="img" aria-label="Expanded analytics chart"></canvas></div>
        <div class="expanded-inspection" id="expandedInspection" hidden>
          <label for="expandedInspector">Inspect Data</label>
          <select id="expandedInspector"></select>
          <p id="expandedInspectionDetail" aria-live="polite"></p>
        </div>
        <p class="expanded-chart-note">Click a cell, bar, or point to inspect its details below. Use the dropdown to select data with the keyboard. All figures are illustrative demo data.</p>
      </div>
      <div class="modal-footer"><button type="button" class="welcome-dismiss" data-bs-dismiss="modal">Close</button></div>
    </div>
  </div>
</div>
