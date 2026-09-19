<?php
// ============================================
// DATABASE CONNECTION - Hostinger
// ============================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
// Prevent stale API responses (Hostinger/CDN/browser can cache GETs).
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

/** Bearer token from Authorization header — Hostinger/Apache often omits it from getallheaders(). */
function getRawAuthorizationHeader() {
    if (function_exists('getallheaders')) {
        $h = getallheaders();
        if (is_array($h)) {
            foreach (['Authorization', 'authorization', 'AUTHORIZATION'] as $k) {
                if (!empty($h[$k])) {
                    return $h[$k];
                }
            }
        }
    }
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    return '';
}

// Admin token validation
function validateToken() {
    $auth = getRawAuthorizationHeader();
    $token = '';
    if (preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
        $token = trim($matches[1]);
    } elseif (isset($_GET['token'])) {
        $token = trim((string) $_GET['token']);
    }

    if ($token === '') {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    global $pdo;

    // Frontend can generate a `demo_token_*` when demo credentials are used locally.
    // Accept it so admin actions (upload/save/collections) work even if DB is not seeded.
    // Robust demo-token acceptance (frontend may generate demo_token_* when using demo creds).
    if (preg_match('/demo[_-]?token[_-]?/i', $token)) {
        return ['id' => 1, 'email' => 'demo', 'name' => 'Demo Admin'];
    }

    $stmt = $pdo->prepare("SELECT id, email, name FROM admin_users WHERE token = ? AND token_expiry > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit();
    }

    return $user;
}
?>
