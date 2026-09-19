<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $page = $_GET['page'] ?? '';
    $limit = intval($_GET['limit'] ?? 100);
    $limit = min($limit, 500);

    $sql = "SELECT * FROM edit_history";
    $params = [];
    if ($page) {
        $sql .= " WHERE page = ?";
        $params[] = $page;
    }
    $sql .= " ORDER BY created_at DESC LIMIT ?";
    $params[] = $limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll());

} elseif ($method === 'POST') {
    $user = validateToken();
    $input = json_decode(file_get_contents('php://input'), true);

    $stmt = $pdo->prepare("INSERT INTO edit_history (page, action, item_name, image_url, old_data) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['page'] ?? '',
        $input['action'] ?? '',
        $input['item_name'] ?? '',
        $input['image_url'] ?? '',
        isset($input['old_data']) ? json_encode($input['old_data']) : null,
    ]);

    $id = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM edit_history WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());

} elseif ($method === 'DELETE') {
    $user = validateToken();
    $id = $_GET['id'] ?? '';
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID required']); exit(); }
    $pdo->prepare("DELETE FROM edit_history WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
}
?>
