<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── Schema: custom collection names + widen assignment keys (was ENUM) ───
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `collection_meta` (
            `collection_key` VARCHAR(64) NOT NULL,
            `display_name` VARCHAR(200) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`collection_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
} catch (Throwable $e) { /* ignore */ }

try {
    $pdo->exec("ALTER TABLE `collection_assignments` MODIFY `collection_type` VARCHAR(80) NOT NULL");
} catch (Throwable $e) { /* already VARCHAR or no permission */ }

try {
    $pdo->exec("ALTER TABLE `collection_meta` ADD COLUMN `icon_key` VARCHAR(32) NULL DEFAULT NULL AFTER `display_name`");
} catch (Throwable $e) { /* column exists */ }

try {
    $pdo->exec("ALTER TABLE `collection_meta` ADD COLUMN `display_order` INT NOT NULL DEFAULT 1000 AFTER `icon_key`");
} catch (Throwable $e) { /* column exists */ }
try {
    $pdo->exec("ALTER TABLE `collection_meta` ADD COLUMN `image_url` TEXT NULL DEFAULT NULL AFTER `display_order`");
} catch (Throwable $e) { /* column exists */ }

/** Must match src/lib/collectionIcons.ts COLLECTION_ICON_KEYS */
function valid_collection_icon_key($k) {
    if (!is_string($k) || $k === '') {
        return false;
    }
    $allowed = ['crown','sparkles','leaf','flower2','heart','gem','sun','feather','flame','ribbon'];
    return in_array($k, $allowed, true);
}

$builtinCollections = ['bridal', 'tissue', 'linen'];

/** Default titles when no row in collection_meta yet (aligned with public collection pages) */
$builtinDisplayDefaults = [
    'bridal' => 'Bridal Sarees',
    'tissue' => 'Tissue & Organza Sarees',
    'linen' => 'Linen & Cotton Sarees',
];

function collection_slug_valid($s) {
    return is_string($s) && preg_match('/^[a-z0-9][a-z0-9-]{0,62}$/', $s);
}

function slugify_display_name($name) {
    $s = strtolower(trim((string) $name));
    $s = preg_replace('/[\s_]+/', '-', $s);
    $s = preg_replace('/[^a-z0-9-]+/', '', $s);
    $s = preg_replace('/-+/', '-', $s);
    $s = trim($s, '-');
    if (strlen($s) > 64) {
        $s = substr($s, 0, 64);
        $s = rtrim($s, '-');
    }
    return $s;
}

function collection_allowed(PDO $pdo, $collection, $builtinCollections) {
    if (in_array($collection, $builtinCollections, true)) {
        return true;
    }
    $stmt = $pdo->prepare('SELECT 1 FROM collection_meta WHERE collection_key = ? LIMIT 1');
    $stmt->execute([$collection]);
    return (bool) $stmt->fetchColumn();
}

function get_collection_meta_ordered(PDO $pdo, array $builtinCollections, array $builtinDisplayDefaults) {
    $stmt = $pdo->query("SELECT collection_key, display_name, icon_key, display_order, image_url FROM collection_meta ORDER BY display_order ASC, display_name ASC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $byKey = [];
    foreach ($rows as $r) {
        $k = (string) ($r['collection_key'] ?? '');
        if ($k !== '') $byKey[$k] = $r;
    }

    // Ensure built-ins always exist in output; if missing, append default meta.
    foreach ($builtinCollections as $idx => $k) {
        if (!isset($byKey[$k])) {
            $byKey[$k] = [
                'collection_key' => $k,
                'display_name' => $builtinDisplayDefaults[$k] ?? ucfirst($k),
                'icon_key' => null,
                'display_order' => 100 + $idx,
                'image_url' => null,
            ];
        }
    }

    $out = array_values($byKey);
    usort($out, function ($a, $b) {
        $oa = intval($a['display_order'] ?? 1000);
        $ob = intval($b['display_order'] ?? 1000);
        if ($oa !== $ob) return $oa <=> $ob;
        return strcmp((string) ($a['display_name'] ?? ''), (string) ($b['display_name'] ?? ''));
    });
    return $out;
}

// ─── GET: Get all assignments ───
if ($method === 'GET' && $action === 'list') {
    $stmt = $pdo->query("SELECT product_id, collection_type FROM collection_assignments ORDER BY created_at DESC");
    $rows = $stmt->fetchAll();

    $grouped = [];
    foreach ($rows as $row) {
        $pid = $row['product_id'];
        if (!isset($grouped[$pid])) {
            $grouped[$pid] = [];
        }
        $grouped[$pid][] = $row['collection_type'];
    }
    echo json_encode($grouped);
}

// ─── GET: Custom collection definitions (public) — excludes built-in keys (those use get-display) ───
elseif ($method === 'GET' && $action === 'list-meta') {
    $stmt = $pdo->query("
        SELECT collection_key, display_name, icon_key, display_order, image_url FROM collection_meta
        WHERE collection_key NOT IN ('bridal','tissue','linen')
        ORDER BY display_order ASC, display_name ASC
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['collections' => $rows ?: []]);
}

// ─── GET: Built-in + custom collection definitions in display order (public) ───
elseif ($method === 'GET' && $action === 'list-all-meta') {
    $rows = get_collection_meta_ordered($pdo, $builtinCollections, $builtinDisplayDefaults);
    echo json_encode(['collections' => $rows ?: []]);
}

// ─── GET: Display name for any collection key (built-in defaults + DB override) — public ───
elseif ($method === 'GET' && $action === 'get-display') {
    $key = trim($_GET['key'] ?? '');
    if (!collection_slug_valid($key)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid key']);
        exit();
    }
    $default = $builtinDisplayDefaults[$key] ?? null;
    if ($default !== null) {
        $stmt = $pdo->prepare('SELECT collection_key, display_name, icon_key, display_order, image_url FROM collection_meta WHERE collection_key = ? LIMIT 1');
        $stmt->execute([$key]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $name = $row && !empty($row['display_name']) ? $row['display_name'] : $default;
        $out = ['collection_key' => $key, 'display_name' => $name];
        if ($row && isset($row['icon_key']) && $row['icon_key'] !== '') {
            $out['icon_key'] = $row['icon_key'];
        }
        echo json_encode($out);
        exit();
    }
    $stmt = $pdo->prepare('SELECT collection_key, display_name, icon_key, display_order, image_url FROM collection_meta WHERE collection_key = ? LIMIT 1');
    $stmt->execute([$key]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Collection not found']);
        exit();
    }
    echo json_encode($row);
}

// ─── POST: Update display name (admin) — built-in or custom collections ───
elseif ($method === 'POST' && $action === 'update-display') {
    validateToken();
    $input = json_decode(file_get_contents('php://input'), true);
    $key = trim((string) ($input['collection_key'] ?? ''));
    $displayName = trim((string) ($input['display_name'] ?? ''));
    $iconKeyIn = isset($input['icon_key']) ? trim((string) $input['icon_key']) : null;
    $imageUrlIn = array_key_exists('image_url', $input) ? trim((string) ($input['image_url'] ?? '')) : null;

    if (!collection_slug_valid($key)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid collection key']);
        exit();
    }
    if (mb_strlen($displayName) < 2 || mb_strlen($displayName) > 200) {
        http_response_code(400);
        echo json_encode(['error' => 'Name must be between 2 and 200 characters.']);
        exit();
    }

    $isBuiltin = in_array($key, $builtinCollections, true);
    if (!$isBuiltin) {
        $chk = $pdo->prepare('SELECT 1 FROM collection_meta WHERE collection_key = ? LIMIT 1');
        $chk->execute([$key]);
        if (!$chk->fetchColumn()) {
            http_response_code(404);
            echo json_encode(['error' => 'Unknown collection']);
            exit();
        }
    }

    $iconKey = null;
    if ($iconKeyIn !== null) {
        if ($iconKeyIn === '') {
            $iconKey = null;
        } elseif (!valid_collection_icon_key($iconKeyIn)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid icon key']);
            exit();
        } else {
            $iconKey = $iconKeyIn;
        }
    }

    if ($iconKeyIn !== null || $imageUrlIn !== null) {
        $imageUrl = $imageUrlIn === null ? null : ($imageUrlIn === '' ? null : $imageUrlIn);
        $stmt = $pdo->prepare('
            INSERT INTO collection_meta (collection_key, display_name, icon_key, image_url, display_order) VALUES (?, ?, ?, ?, COALESCE((SELECT display_order FROM collection_meta WHERE collection_key = ?), 1000))
            ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), icon_key = VALUES(icon_key), image_url = VALUES(image_url)
        ');
        $stmt->execute([$key, $displayName, $iconKey, $imageUrl, $key]);
    } else {
        $stmt = $pdo->prepare('
            INSERT INTO collection_meta (collection_key, display_name, display_order) VALUES (?, ?, COALESCE((SELECT display_order FROM collection_meta WHERE collection_key = ?), 1000))
            ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)
        ');
        $stmt->execute([$key, $displayName, $key]);
    }

    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('collections', ?, ?)")
        ->execute(['Renamed collection', $displayName]);

    $sel = $pdo->prepare('SELECT collection_key, display_name, icon_key, display_order, image_url FROM collection_meta WHERE collection_key = ? LIMIT 1');
    $sel->execute([$key]);
    $row = $sel->fetch(PDO::FETCH_ASSOC);
    $out = ['collection_key' => $key, 'display_name' => $displayName];
    if ($row && isset($row['icon_key']) && $row['icon_key'] !== '') {
        $out['icon_key'] = $row['icon_key'];
    }
    if ($row && isset($row['image_url']) && $row['image_url'] !== '') {
        $out['image_url'] = $row['image_url'];
    }

    echo json_encode([
        'success' => true,
        'collection' => $out,
    ]);
}

// ─── GET: One custom collection meta (public) ───
elseif ($method === 'GET' && $action === 'get-meta') {
    $key = trim($_GET['key'] ?? '');
    if (!collection_slug_valid($key)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid key']);
        exit();
    }
    $stmt = $pdo->prepare('SELECT collection_key, display_name, icon_key, display_order, image_url FROM collection_meta WHERE collection_key = ? LIMIT 1');
    $stmt->execute([$key]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Collection not found']);
        exit();
    }
    echo json_encode($row);
}

// ─── GET: Get collections for a product ───
elseif ($method === 'GET' && $action === 'get') {
    $productId = $_GET['product_id'] ?? '';
    if (!$productId) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT collection_type FROM collection_assignments WHERE product_id = ?");
    $stmt->execute([$productId]);
    $types = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'collection_type');
    echo json_encode($types);
}

// ─── POST: Create a new custom collection (admin) ───
elseif ($method === 'POST' && $action === 'create-collection') {
    validateToken();
    $input = json_decode(file_get_contents('php://input'), true);
    $displayName = trim($input['display_name'] ?? '');
    $requestedKey = isset($input['collection_key']) ? trim((string) $input['collection_key']) : '';
    $iconKeyRaw = isset($input['icon_key']) ? trim((string) $input['icon_key']) : '';
    $iconKey = valid_collection_icon_key($iconKeyRaw) ? $iconKeyRaw : 'sparkles';

    if (mb_strlen($displayName) < 2) {
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a collection name (at least 2 characters).']);
        exit();
    }

    if ($requestedKey !== '') {
        if (!collection_slug_valid($requestedKey)) {
            http_response_code(400);
            echo json_encode(['error' => 'URL key must be lowercase letters, numbers, and hyphens only.']);
            exit();
        }
        $key = $requestedKey;
    } else {
        $key = slugify_display_name($displayName);
        if ($key === '' || !collection_slug_valid($key)) {
            http_response_code(400);
            echo json_encode(['error' => 'Could not build a URL from that name. Try a simpler name or set a custom key.']);
            exit();
        }
    }

    if (in_array($key, $builtinCollections, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'That name is reserved. Choose a different name.']);
        exit();
    }

    // Uniqueness: append -2, -3, ...
    $baseKey = $key;
    $n = 2;
    while (true) {
        $check = $pdo->prepare('SELECT 1 FROM collection_meta WHERE collection_key = ? LIMIT 1');
        $check->execute([$key]);
        if (!$check->fetchColumn()) {
            break;
        }
        $suffix = '-' . $n;
        $key = substr($baseKey, 0, 64 - strlen($suffix)) . $suffix;
        $n++;
        if ($n > 50) {
            http_response_code(400);
            echo json_encode(['error' => 'Too many collections with a similar name. Pick a more unique name.']);
            exit();
        }
    }

    try {
        $maxOrder = intval($pdo->query('SELECT COALESCE(MAX(display_order), 100) FROM collection_meta')->fetchColumn() ?: 100);
        $ins = $pdo->prepare('INSERT INTO collection_meta (collection_key, display_name, icon_key, image_url, display_order) VALUES (?, ?, ?, NULL, ?)');
        $ins->execute([$key, $displayName, $iconKey, $maxOrder + 10]);
    } catch (Throwable $e) {
        http_response_code(400);
        echo json_encode(['error' => 'Could not create collection. It may already exist.']);
        exit();
    }

    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('collections', ?, ?)")
        ->execute(['Created collection', $displayName]);

    echo json_encode([
        'success' => true,
        'collection' => ['collection_key' => $key, 'display_name' => $displayName, 'icon_key' => $iconKey, 'image_url' => null],
    ]);
}

// ─── POST: Reorder collections for storefront/admin display ───
elseif ($method === 'POST' && $action === 'update-order') {
    validateToken();
    $input = json_decode(file_get_contents('php://input'), true);
    $keys = isset($input['keys']) && is_array($input['keys']) ? $input['keys'] : [];
    if (count($keys) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'keys array required']);
        exit();
    }

    $clean = [];
    foreach ($keys as $k) {
        $key = trim((string) $k);
        if (!collection_slug_valid($key)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid collection key in keys array']);
            exit();
        }
        if (!isset($clean[$key])) $clean[$key] = true;
    }
    $orderedKeys = array_keys($clean);

    // Validate: key must be built-in or existing custom collection.
    foreach ($orderedKeys as $key) {
        if (in_array($key, $builtinCollections, true)) continue;
        $chk = $pdo->prepare('SELECT 1 FROM collection_meta WHERE collection_key = ? LIMIT 1');
        $chk->execute([$key]);
        if (!$chk->fetchColumn()) {
            http_response_code(400);
            echo json_encode(['error' => "Unknown collection key: $key"]);
            exit();
        }
    }

    // Upsert rows for built-ins if missing and persist order for all provided keys.
    $order = 10;
    foreach ($orderedKeys as $key) {
        $defaultName = $builtinDisplayDefaults[$key] ?? $key;
        $stmt = $pdo->prepare("
            INSERT INTO collection_meta (collection_key, display_name, display_order)
            VALUES (?, COALESCE((SELECT display_name FROM (SELECT * FROM collection_meta) m2 WHERE m2.collection_key = ?), ?), ?)
            ON DUPLICATE KEY UPDATE display_order = VALUES(display_order)
        ");
        $stmt->execute([$key, $key, $defaultName, $order]);
        $order += 10;
    }

    $rows = get_collection_meta_ordered($pdo, $builtinCollections, $builtinDisplayDefaults);
    echo json_encode(['success' => true, 'collections' => $rows]);
}

// ─── POST: Add product to collection ───
elseif ($method === 'POST' && $action === 'add') {
    validateToken();
    $input = json_decode(file_get_contents('php://input'), true);
    $productId = $input['product_id'] ?? '';
    $collection = trim((string) ($input['collection_type'] ?? ''));

    if (!$productId || !collection_slug_valid($collection)) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid product_id and collection_type required']);
        exit();
    }

    if (!collection_allowed($pdo, $collection, $builtinCollections)) {
        http_response_code(400);
        echo json_encode(['error' => 'Unknown collection. Create it first from Admin → Collections.']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT item_name FROM admin_products WHERE product_id = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    $productName = $product['item_name'] ?? $productId;

    $stmt = $pdo->prepare("INSERT IGNORE INTO collection_assignments (product_id, collection_type) VALUES (?, ?)");
    $stmt->execute([$productId, $collection]);

    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('collections', ?, ?)")
        ->execute(["Added to $collection", $productName]);

    echo json_encode(['success' => true]);
}

// ─── DELETE: Remove product from collection ───
elseif ($method === 'DELETE' && $action === 'remove') {
    validateToken();
    $productId = $_GET['product_id'] ?? '';
    $collection = trim((string) ($_GET['collection_type'] ?? ''));

    if (!$productId || !$collection) {
        http_response_code(400);
        echo json_encode(['error' => 'product_id and collection_type required']);
        exit();
    }

    $pdo->prepare("DELETE FROM collection_assignments WHERE product_id = ? AND collection_type = ?")->execute([$productId, $collection]);

    $stmt = $pdo->prepare("SELECT item_name FROM admin_products WHERE product_id = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    $productName = $product['item_name'] ?? $productId;

    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('collections', ?, ?)")
        ->execute(["Removed from $collection", $productName]);

    echo json_encode(['success' => true]);
}

// ─── DELETE: Remove custom collection + its assignments (admin) ───
elseif ($method === 'DELETE' && $action === 'delete-collection') {
    validateToken();
    $key = trim($_GET['key'] ?? '');
    if (!collection_slug_valid($key) || in_array($key, $builtinCollections, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or reserved collection key']);
        exit();
    }

    $pdo->prepare('DELETE FROM collection_assignments WHERE collection_type = ?')->execute([$key]);
    $del = $pdo->prepare('DELETE FROM collection_meta WHERE collection_key = ?');
    $del->execute([$key]);
    if ($del->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Collection not found']);
        exit();
    }

    $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('collections', ?, ?)")
        ->execute(['Deleted custom collection', $key]);

    echo json_encode(['success' => true]);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Unknown action']);
}
