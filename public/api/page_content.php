<?php
require_once __DIR__ . '/db.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `site_page_content` (
        `page_key` VARCHAR(32) NOT NULL PRIMARY KEY,
        `content_json` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
} catch (Throwable $e) { /* ignore */ }

$method = $_SERVER['REQUEST_METHOD'];
$allowed = ['heritage', 'about', 'store', 'contact'];

$key = isset($_GET['key']) ? preg_replace('/[^a-z]/', '', strtolower((string) $_GET['key'])) : '';

if ($method === 'GET') {
    if ($key !== '') {
        if (!in_array($key, $allowed, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid page key']);
            exit();
        }
        $stmt = $pdo->prepare('SELECT content_json FROM site_page_content WHERE page_key = ?');
        $stmt->execute([$key]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['content_json'] !== '') {
            echo $row['content_json'];
        } else {
            echo '{}';
        }
        exit();
    }

    $stmt = $pdo->query('SELECT page_key, content_json FROM site_page_content');
    $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    $out = [];
    foreach ($rows as $r) {
        $k = $r['page_key'];
        if (in_array($k, $allowed, true)) {
            $decoded = json_decode($r['content_json'], true);
            $out[$k] = is_array($decoded) ? $decoded : [];
        }
    }
    echo json_encode($out);
    exit();
}

if ($method === 'PUT') {
    validateToken();
    if (!in_array($key, $allowed, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Page key required (heritage, about, store, contact)']);
        exit();
    }
    $raw = file_get_contents('php://input');
    json_decode($raw);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        exit();
    }

    $stmt = $pdo->prepare('INSERT INTO site_page_content (page_key, content_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_json = VALUES(content_json), updated_at = NOW()');
    $stmt->execute([$key, $raw]);

    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('site_pages', 'Updated site page', ?)")
        ->execute([$key]);

    echo json_encode(['success' => true, 'page_key' => $key]);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
