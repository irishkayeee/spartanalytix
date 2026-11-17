<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
    ]);
    session_start();
}

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function require_login(): void
{
    if (empty($_SESSION['authenticated'])) {
        header('Location: login.php');
        exit;
    }
    if (!isset($_SESSION['role'])) {
        unset($_SESSION['authenticated']);
        header('Location: login.php');
        exit;
    }
    if ($_SESSION['role'] !== 'program_chair') {
        http_response_code(403);
        exit('Access denied. This portal is restricted to the authorized BSIT Program Chair.');
    }
}

function valid_csrf(): bool
{
    return isset($_POST['csrf_token']) && is_string($_POST['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $_POST['csrf_token']);
}
