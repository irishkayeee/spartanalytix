<div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutTitle" aria-describedby="logoutDescription" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content logout-modal">
      <div class="modal-header">
        <h2 class="modal-title fs-5" id="logoutTitle">Log out?</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p id="logoutDescription" class="mb-0">Are you sure you want to log out of SPARTANalytix?</p>
        <p id="logoutStatus" class="logout-status mb-0" role="status" aria-live="polite"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn logout-confirm" id="confirmLogout">
          <span class="spinner-border spinner-border-sm me-2" aria-hidden="true" hidden></span><span class="logout-confirm-label">Log out</span>
        </button>
      </div>
    </div>
  </div>
</div>
