<?php
declare(strict_types=1);
require __DIR__ . '/includes/auth.php';
if (!empty($_SESSION['authenticated']) && ($_SESSION['role'] ?? '') === 'program_chair') {
    header('Location: index.php');
    exit;
}
$error = '';
$username = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = is_string($_POST['username'] ?? null) ? trim($_POST['username']) : '';
    $password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
    if (!valid_csrf()) {
        $error = 'Your session expired. Please try again.';
    } elseif ($username === 'programchair' && hash_equals('Spartan2026!', $password)) {
        session_regenerate_id(true);
        $_SESSION['authenticated'] = true;
        $_SESSION['role'] = 'program_chair';
        $_SESSION['show_welcome_tip'] = true;
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        header('Location: index.php');
        exit;
    } else {
        $error = 'Incorrect username or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login | SPARTANalytix</title>
  <link rel="stylesheet" href="assets/vendor/bootstrap/bootstrap.min.css">
  <link rel="stylesheet" href="assets/css/portal.css">
  <link rel="stylesheet" href="assets/css/login.css"><link rel="stylesheet" href="assets/css/loading.css">
</head>
<body class="login-page">
  <main class="login-card">
    <svg class="login-shape-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="loginBrandWave" clipPathUnits="objectBoundingBox">
          <path d="M0,0 H1 C.88,.17 .84,.29 .88,.45 C.92,.62 .98,.77 .84,1 H0 Z"/>
        </clipPath>
      </defs>
    </svg>
    <section class="login-brand-panel" aria-label="Academic Analytics Portal">
      <svg class="login-wave-border" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="loginWaveFusion" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#7D2638"/>
            <stop offset="48%" stop-color="#D6B477"/>
            <stop offset="100%" stop-color="#26364D"/>
          </linearGradient>
        </defs>
        <path d="M100,0 C88,17 84,29 88,45 C92,62 98,77 84,100" fill="none" stroke="url(#loginWaveFusion)" stroke-width="8" vector-effect="non-scaling-stroke"/>
      </svg>
      <div class="login-brand-copy">
        <div class="login-school">
          <div class="bsu-logo-placeholder" role="img" aria-label="Placeholder for Batangas State University logo">BSU<span>LOGO</span></div>
          <p class="login-university">Batangas State University</p>
        </div>
        <h2>Academic<br><span>Analytics</span><br>Portal</h2>
        <p class="login-tagline">Data-Driven Insights for<br>Academic Excellence</p>
      </div>
      <svg class="login-bottom-waves" viewBox="0 0 500 170" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 66 C155 85 330 143 500 8 V170 H0Z" fill="#7D2638"/>
        <path d="M0 170 C150 124 365 115 500 8 L500 26 C358 145 157 134 0 170Z" fill="#D6B477"/>
        <path d="M0 170 C172 153 377 105 500 40 V170Z" fill="#651B2D"/>
        <path d="M0 170 C224 166 400 136 500 85 V170Z" fill="#7D2638"/>
      </svg>
    </section>
    <section class="login-form-panel" aria-labelledby="loginTitle">
    <img class="login-logo" src="assets/spartan_logo.png" alt="SPARTANalytix">
    <h1 id="loginTitle">Welcome back!</h1>
    <p class="login-intro">Sign in to your BSIT · CICS analytics portal.</p>
    <?php if ($error !== ''): ?>
      <p class="login-error" role="alert"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></p>
    <?php endif; ?>
    <form method="post" action="login.php" id="loginForm">
      <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8'); ?>">
      <label class="visually-hidden" for="username">Username</label>
      <div class="login-input mb-3">
        <svg class="login-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/></svg>
        <input class="form-control" id="username" name="username" placeholder="Username" autocomplete="username" required maxlength="80" value="<?php echo htmlspecialchars($username, ENT_QUOTES, 'UTF-8'); ?>">
      </div>
      <label class="visually-hidden" for="password">Password</label>
      <div class="password-field login-input mb-3">
        <svg class="login-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="3"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/><path d="M12 15v3"/></svg>
        <input class="form-control" type="password" id="password" name="password" placeholder="Password" autocomplete="current-password" required>
        <button class="password-toggle" type="button" id="showPassword" aria-label="Show password" title="Show password" aria-controls="password" aria-pressed="false">
          <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="m3 3 18 18"/></svg>
        </button>
      </div>
      <button class="login-submit" type="submit">Log in</button>
    </form>
    <div class="login-demo">
      <strong><svg class="demo-bank-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m2 8 10-6 10 6H2Zm2 12h16M2 22h20M6 10v8m6-8v8m6-8v8"/></svg> Account Access</strong>
      <span>Username: <code>programchair</code></span>
      <span>Password: <code>Spartan2026!</code></span>
      <small>For demonstration only. No database is connected.</small>
    </div>
    <p class="login-copyright">&copy; <?php echo date('Y'); ?> SPARTANalytix. All rights reserved.</p>
    </section>
  </main>
  <?php require __DIR__ . '/includes/loading.php'; ?>
  <script src="assets/js/login.js"></script>
</body>
</html>
