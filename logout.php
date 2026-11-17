<?php
declare(strict_types=1);
require __DIR__ . '/includes/auth.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}
if (!valid_csrf()) {
    http_response_code(403);
    exit('Invalid request. Refresh the portal and try again.');
}
$_SESSION = [];
$params = session_get_cookie_params();
setcookie(session_name(), '', [
    'expires' => time() - 42000,
    'path' => $params['path'],
    'domain' => $params['domain'],
    'secure' => $params['secure'],
    'httponly' => $params['httponly'],
    'samesite' => 'Lax',
]);
session_destroy();
header('Location: login.php');
exit;
