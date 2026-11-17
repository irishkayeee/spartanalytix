(() => {
  const form = document.querySelector('.logout-form');
  const element = document.getElementById('logoutModal');
  if (!form || !element || !window.bootstrap) return;
  const modal = new bootstrap.Modal(element);
  const confirm = document.getElementById('confirmLogout');
  let busy = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!busy) modal.show();
  });
  element.addEventListener('shown.bs.modal', () => {
    element.querySelector('.modal-footer [data-bs-dismiss]').focus();
  });
  element.addEventListener('hidden.bs.modal', () => form.querySelector('button').focus());
  element.addEventListener('hide.bs.modal', event => { if (busy) event.preventDefault(); });
  confirm.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    element.setAttribute('aria-busy', 'true');
    element.querySelectorAll('button').forEach(button => { button.disabled = true; });
    form.querySelector('button').disabled = true;
    confirm.querySelector('.spinner-border').hidden = false;
    confirm.querySelector('.logout-confirm-label').textContent = 'Logging out…';
    document.getElementById('logoutStatus').textContent = 'Signing you out. Please wait…';
    const overlay = document.getElementById('pageLoading');
    document.getElementById('loadingCaption').textContent = 'Signing you out. Please wait.';
    overlay.hidden = false;
    overlay.focus();
    window.setTimeout(() => HTMLFormElement.prototype.submit.call(form), 2500);
  });
  window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });
})();
