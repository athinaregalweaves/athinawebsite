<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' || $method === 'GET') {

    if ($action === 'login' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            exit();
        }

        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime(ADMIN_TOKEN_EXPIRY));

        $stmt = $pdo->prepare("UPDATE admin_users SET token = ?, token_expiry = ? WHERE id = ?");
        $stmt->execute([$token, $expiry, $user['id']]);

        echo json_encode([
            'token' => $token,
            'user' => ['id' => $user['id'], 'email' => $user['email'], 'name' => $user['name']]
        ]);

    } elseif ($action === 'logout' && $method === 'POST') {
        $user = validateToken();
        $stmt = $pdo->prepare("UPDATE admin_users SET token = NULL, token_expiry = NULL WHERE id = ?");
        $stmt->execute([$user['id']]);
        echo json_encode(['success' => true]);

    } elseif ($action === 'verify') {
        $user = validateToken();
        echo json_encode(['user' => ['id' => $user['id'], 'email' => $user['email'], 'name' => $user['name']]]);
    }
}
?>
