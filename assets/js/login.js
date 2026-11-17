document.getElementById('showPassword').addEventListener('click', function () {
  const input = document.getElementById('password');
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  const label = show ? 'Hide password' : 'Show password';
  this.setAttribute('aria-label', label);
  this.title = label;
  this.setAttribute('aria-pressed', String(show));
});

(() => {
  const form = document.getElementById('loginForm');
  const overlay = document.getElementById('pageLoading');
  const button = form.querySelector('[type="submit"]');
  let submitting = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (submitting) return;
    submitting = true;
    button.disabled = true;
    button.textContent = 'Logging in…';
    form.setAttribute('aria-busy', 'true');
    overlay.hidden = false;
    document.getElementById('loadingCaption').textContent = 'Signing you in. Please wait.';
    overlay.focus();
    // Keep the loading animation visible briefly before continuing to PHP login.
    window.setTimeout(() => HTMLFormElement.prototype.submit.call(form), 2500);
  });
  window.addEventListener('pageshow', () => {
    submitting = false;
    overlay.hidden = true;
    button.disabled = false;
    button.textContent = 'Log in';
    form.removeAttribute('aria-busy');
  });
})();

