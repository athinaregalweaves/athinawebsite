<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Ensure reviews table exists (simple auto-migration).
// If you prefer manual migration, comment this out and run SQL once.
$pdo->exec("
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` VARCHAR(100) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `rating` TINYINT NOT NULL,
  `review_text` TEXT NOT NULL,
  `location` VARCHAR(120) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_product_reviews_product` (`product_id`),
  INDEX `idx_product_reviews_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

header('Content-Type: application/json');

if ($method === 'GET' && $action === 'list') {
    $productId = trim($_GET['product_id'] ?? '');
    if (!$productId) {
        http_response_code(400);
        echo json_encode(['error' => 'product_id is required']);
        exit();
    }

    $stmt = $pdo->prepare("
      SELECT
        id,
        name,
        rating,
        review_text,
        location,
        DATE_FORMAT(created_at, '%b %e, %Y') AS date
      FROM product_reviews
      WHERE product_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    ");
    $stmt->execute([$productId]);
    $rows = $stmt->fetchAll();

    // Match frontend keys: text/date/location.
    $out = array_map(function($r) {
        return [
            'id' => (string)$r['id'],
            'name' => $r['name'] ?? 'Anonymous',
            'rating' => (int)($r['rating'] ?? 5),
            'text' => $r['review_text'] ?? '',
            'location' => $r['location'] ?? '',
            'date' => $r['date'] ?? '',
        ];
    }, $rows);

    echo json_encode($out);
    exit();
}

if ($method === 'GET' && $action === 'admin-list') {
    validateToken();

    $stmt = $pdo->query("
      SELECT
        id,
        product_id,
        name,
        rating,
        review_text,
        location,
        created_at
      FROM product_reviews
      ORDER BY created_at DESC
      LIMIT 500
    ");
    $rows = $stmt->fetchAll();

    echo json_encode([
        'reviews' => array_map(function($r) {
            return [
                'id' => (int)$r['id'],
                'product_id' => (string)($r['product_id'] ?? ''),
                'name' => (string)($r['name'] ?? 'Anonymous'),
                'rating' => (int)($r['rating'] ?? 0),
                'text' => (string)($r['review_text'] ?? ''),
                'location' => (string)($r['location'] ?? ''),
                'created_at' => (string)($r['created_at'] ?? ''),
            ];
        }, $rows)
    ]);
    exit();
}

if ($method === 'POST' && $action === 'add') {
    $input = json_decode(file_get_contents('php://input'), true);
    $productId = trim($input['product_id'] ?? '');
    $name = trim($input['name'] ?? '');
    $location = trim($input['location'] ?? '');
    $text = trim($input['text'] ?? '');
    $rating = (int)($input['rating'] ?? 0);

    if (!$productId) {
        http_response_code(400);
        echo json_encode(['error' => 'product_id is required']);
        exit();
    }
    if (!$name) {
        $name = 'Anonymous';
    }
    if (!$text) {
        http_response_code(400);
        echo json_encode(['error' => 'Review text is required']);
        exit();
    }
    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['error' => 'rating must be between 1 and 5']);
        exit();
    }

    // Basic limits to prevent very large submissions.
    if (mb_strlen($text) > 2000) {
        http_response_code(400);
        echo json_encode(['error' => 'Review too long (max 2000 chars)']);
        exit();
    }

    $stmt = $pdo->prepare("
      INSERT INTO product_reviews (product_id, name, rating, review_text, location)
      VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$productId, $name, $rating, $text, $location]);

    $id = $pdo->lastInsertId();

    $stmt2 = $pdo->prepare("
      SELECT
        id,
        name,
        rating,
        review_text,
        location,
        DATE_FORMAT(created_at, '%b %e, %Y') AS date
      FROM product_reviews
      WHERE id = ?
      LIMIT 1
    ");
    $stmt2->execute([$id]);
    $row = $stmt2->fetch();

    echo json_encode([
        'success' => true,
        'review' => [
            'id' => (string)($row['id'] ?? $id),
            'name' => $row['name'] ?? $name,
            'rating' => (int)($row['rating'] ?? $rating),
            'text' => $row['review_text'] ?? $text,
            'location' => $row['location'] ?? $location,
            'date' => $row['date'] ?? '',
        ]
    ]);
    exit();
}

if ($method === 'DELETE' && $action === 'admin-delete') {
    validateToken();
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'id is required']);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM product_reviews WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Review not found']);
        exit();
    }
    echo json_encode(['success' => true]);
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Unknown action']);
?>

