<?php
require_once __DIR__ . '/db.php';

// Optional column for hero background video URL (direct MP4/WebM or page URL for YouTube/Vimeo).
try {
    $pdo->exec("ALTER TABLE `homepage_sections` ADD COLUMN `video_url` TEXT NULL DEFAULT NULL AFTER `image_url`");
} catch (Throwable $e) { /* column exists */ }
try {
    $pdo->exec("ALTER TABLE `homepage_sections` ADD COLUMN `show_on_collections` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_active`");
} catch (Throwable $e) { /* column exists */ }
try {
    $pdo->exec("ALTER TABLE `homepage_sections` ADD COLUMN `image_position` VARCHAR(32) NOT NULL DEFAULT 'center center' AFTER `image_height`");
} catch (Throwable $e) { /* column exists */ }
try {
    $pdo->exec("ALTER TABLE `homepage_sections` ADD COLUMN `image_zoom` INT NOT NULL DEFAULT 100 AFTER `image_position`");
} catch (Throwable $e) { /* column exists */ }
// Sensible defaults for existing built-ins.
try {
    $pdo->exec("UPDATE `homepage_sections` SET `show_on_collections` = 1 WHERE `section_key` IN ('bridal','tissue','linen')");
} catch (Throwable $e) { /* ignore */ }
try {
    $pdo->exec("UPDATE `homepage_sections` SET `show_on_collections` = 0 WHERE `section_key` = 'hero'");
} catch (Throwable $e) { /* ignore */ }
// Ensure built-in bestseller section exists so admin can edit its image/content.
try {
    $chk = $pdo->prepare("SELECT id FROM `homepage_sections` WHERE `section_key` = 'bestseller' LIMIT 1");
    $chk->execute();
    if (!$chk->fetchColumn()) {
        $ins = $pdo->prepare("
            INSERT INTO `homepage_sections`
            (`section_key`, `title`, `subtitle`, `description`, `image_url`, `video_url`, `image_width`, `image_height`, `redirect_page`, `button_text`, `caption`, `is_active`, `show_on_collections`)
            VALUES ('bestseller', 'The Banarasi', 'Legacy', 'Our most treasured collection — Banarasi silks handwoven by master artisans with pure gold and silver zari.', '', '', 1400, 1800, '/collections', 'Shop Banarasi', 'Bestseller Collection', 1, 0)
        ");
        $ins->execute();
    }
} catch (Throwable $e) { /* ignore */ }

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM homepage_sections WHERE is_active = 1 ORDER BY id ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} elseif ($method === 'PUT') {
    $user = validateToken();
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? '';

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Section ID required']);
        exit();
    }

    $fields = [];
    $values = [];

    $allowed = ['title', 'subtitle', 'description', 'image_url', 'video_url', 'image_width', 'image_height', 'image_position', 'image_zoom', 'redirect_page', 'button_text', 'caption', 'is_active', 'show_on_collections'];

    foreach ($allowed as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $values[] = $input[$field];
        }
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit();
    }

    $values[] = $id;
    $sql = "UPDATE homepage_sections SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);

    // Log to history
    $stmt2 = $pdo->prepare("SELECT section_key FROM homepage_sections WHERE id = ?");
    $stmt2->execute([$id]);
    $section = $stmt2->fetch();
    if ($section) {
        $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('sections', 'Updated section', ?)")
            ->execute([$section['section_key']]);
    }

    $stmt = $pdo->prepare("SELECT * FROM homepage_sections WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

elseif ($method === 'POST') {
    validateToken();
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    $sectionKey = isset($input['section_key']) ? trim((string) $input['section_key']) : '';
    if ($sectionKey === '' || !preg_match('/^custom_[a-zA-Z0-9_]{1,40}$/', $sectionKey)) {
        $sectionKey = 'custom_' . preg_replace('/[^a-z0-9]/i', '', uniqid('', true));
        if (strlen($sectionKey) > 50) {
            $sectionKey = substr($sectionKey, 0, 50);
        }
    }

    $chk = $pdo->prepare('SELECT 1 FROM homepage_sections WHERE section_key = ? LIMIT 1');
    $chk->execute([$sectionKey]);
    if ($chk->fetchColumn()) {
        http_response_code(400);
        echo json_encode(['error' => 'Section key already exists']);
        exit();
    }

    $title = trim((string) ($input['title'] ?? 'New Section'));
    if ($title === '') {
        $title = 'New Section';
    }
    $subtitle = trim((string) ($input['subtitle'] ?? ''));
    $description = trim((string) ($input['description'] ?? ''));
    $imageUrl = trim((string) ($input['image_url'] ?? ''));
    $videoUrl = isset($input['video_url']) ? trim((string) $input['video_url']) : '';
    $imageWidth = isset($input['image_width']) ? (int) $input['image_width'] : 1920;
    $imageHeight = isset($input['image_height']) ? (int) $input['image_height'] : 1080;
    $imagePosition = trim((string) ($input['image_position'] ?? 'center center'));
    if ($imagePosition === '') $imagePosition = 'center center';
    $imageZoom = isset($input['image_zoom']) ? (int) $input['image_zoom'] : 100;
    if ($imageZoom < 50) $imageZoom = 50;
    if ($imageZoom > 200) $imageZoom = 200;
    $redirectPage = trim((string) ($input['redirect_page'] ?? '/collections'));
    if ($redirectPage === '') {
        $redirectPage = '/collections';
    }
    $buttonText = trim((string) ($input['button_text'] ?? 'Explore'));
    $caption = trim((string) ($input['caption'] ?? 'Featured'));
    $showOnCollections = isset($input['show_on_collections']) ? (int) $input['show_on_collections'] : 0;
    if ($showOnCollections !== 1) $showOnCollections = 0;

    $ins = $pdo->prepare('
        INSERT INTO homepage_sections (
            section_key, title, subtitle, description, image_url, video_url,
            image_width, image_height, image_position, image_zoom, redirect_page, button_text, caption, is_active, show_on_collections
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    ');
    $ins->execute([
        $sectionKey,
        $title,
        $subtitle,
        $description,
        $imageUrl,
        $videoUrl,
        $imageWidth,
        $imageHeight,
        $imagePosition,
        $imageZoom,
        $redirectPage,
        $buttonText,
        $caption,
        $showOnCollections,
    ]);

    $newId = (int) $pdo->lastInsertId();
    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('sections', 'Created homepage section', ?)")
        ->execute([$sectionKey]);

    $stmt = $pdo->prepare('SELECT * FROM homepage_sections WHERE id = ?');
    $stmt->execute([$newId]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

elseif ($method === 'DELETE') {
    validateToken();
    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Section ID required']);
        exit();
    }

    $stmt = $pdo->prepare('SELECT section_key FROM homepage_sections WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Section not found']);
        exit();
    }
    $key = $row['section_key'];
    $builtin = ['hero', 'bridal', 'tissue', 'linen', 'bestseller'];
    if (in_array($key, $builtin, true) || strpos($key, 'custom_') !== 0) {
        http_response_code(403);
        echo json_encode(['error' => 'Only custom sections (custom_*) can be deleted.']);
        exit();
    }

    $pdo->prepare('DELETE FROM homepage_sections WHERE id = ?')->execute([$id]);
    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('sections', 'Deleted homepage section', ?)")
        ->execute([$key]);
    echo json_encode(['success' => true]);
}

?>
