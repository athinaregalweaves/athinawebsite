<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── GET: List all active blogs ───
if ($method === 'GET' && $action === 'list') {
    $stmt = $pdo->query("SELECT id, slug, headline, excerpt, category, date, read_time, author, image, is_active, created_at FROM blogs WHERE is_active = 1 ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll());
}

// ─── GET: Single blog by slug ───
elseif ($method === 'GET' && $action === 'get') {
    $slug = $_GET['slug'] ?? '';
    if (!$slug) {
        http_response_code(400);
        echo json_encode(['error' => 'Slug required']);
        exit();
    }
    $stmt = $pdo->prepare("SELECT * FROM blogs WHERE slug = ? AND is_active = 1");
    $stmt->execute([$slug]);
    $blog = $stmt->fetch();
    if (!$blog) {
        http_response_code(404);
        echo json_encode(['error' => 'Blog not found']);
        exit();
    }
    $blog['body'] = json_decode($blog['body'], true) ?: [];
    $blog['images'] = json_decode($blog['images'], true) ?: [];
    echo json_encode($blog);
}

// ─── GET: Admin list all (including inactive) ───
elseif ($method === 'GET' && $action === 'admin-list') {
    validateToken();
    $stmt = $pdo->query("SELECT * FROM blogs ORDER BY created_at DESC");
    $blogs = $stmt->fetchAll();
    foreach ($blogs as &$b) {
        $b['body'] = json_decode($b['body'], true) ?: [];
        $b['images'] = json_decode($b['images'], true) ?: [];
    }
    echo json_encode($blogs);
}

// ─── POST: Create blog ───
elseif ($method === 'POST' && $action === 'create') {
    validateToken();
    $input = json_decode(file_get_contents('php://input'), true);

    $slug = trim($input['slug'] ?? '');
    $headline = trim($input['headline'] ?? '');
    if (!$slug || !$headline) {
        http_response_code(400);
        echo json_encode(['error' => 'Slug and headline are required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT id FROM blogs WHERE slug = ?");
    $stmt->execute([$slug]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Slug already exists']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO blogs (slug, headline, excerpt, category, date, read_time, author, image, body, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $slug,
        $headline,
        trim($input['excerpt'] ?? ''),
        trim($input['category'] ?? ''),
        trim($input['date'] ?? date('F j, Y')),
        trim($input['readTime'] ?? '5 min read'),
        trim($input['author'] ?? 'Athina Editorial'),
        trim($input['image'] ?? ''),
        json_encode($input['body'] ?? []),
        json_encode($input['images'] ?? []),
    ]);

    $id = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM blogs WHERE id = ?");
    $stmt->execute([$id]);
    $blog = $stmt->fetch();
    $blog['body'] = json_decode($blog['body'], true) ?: [];
    $blog['images'] = json_decode($blog['images'], true) ?: [];

    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('blog', 'Created blog', ?)")->execute([$headline]);

    echo json_encode($blog);
}

// ─── PUT: Update blog ───
elseif ($method === 'PUT' && $action === 'update') {
    validateToken();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Blog ID required']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $fields = [];
    $values = [];

    $stringFields = ['slug', 'headline', 'excerpt', 'category', 'date', 'read_time', 'author', 'image'];
    foreach ($stringFields as $f) {
        $camel = lcfirst(str_replace('_', '', ucwords($f, '_')));
        $key = isset($input[$f]) ? $f : (isset($input[$camel]) ? $camel : null);
        if ($key !== null) {
            $fields[] = "$f = ?";
            $values[] = $input[$key];
        }
    }

    if (isset($input['body'])) {
        $fields[] = "body = ?";
        $values[] = json_encode($input['body']);
    }
    if (isset($input['images'])) {
        $fields[] = "images = ?";
        $values[] = json_encode($input['images']);
    }
    if (isset($input['is_active'])) {
        $fields[] = "is_active = ?";
        $values[] = intval($input['is_active']);
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit();
    }

    $values[] = $id;
    $pdo->prepare("UPDATE blogs SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?")->execute($values);

    $stmt = $pdo->prepare("SELECT * FROM blogs WHERE id = ?");
    $stmt->execute([$id]);
    $blog = $stmt->fetch();
    $blog['body'] = json_decode($blog['body'], true) ?: [];
    $blog['images'] = json_decode($blog['images'], true) ?: [];

    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('blog', 'Updated blog', ?)")->execute([$blog['headline']]);

    echo json_encode($blog);
}

// ─── DELETE: Delete blog ───
elseif ($method === 'DELETE' && $action === 'delete') {
    validateToken();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Blog ID required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT headline FROM blogs WHERE id = ?");
    $stmt->execute([$id]);
    $blog = $stmt->fetch();

    $pdo->prepare("DELETE FROM blogs WHERE id = ?")->execute([$id]);

    if ($blog) {
        $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('blog', 'Deleted blog', ?)")->execute([$blog['headline']]);
    }

    echo json_encode(['success' => true]);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Unknown action']);
}
?>
