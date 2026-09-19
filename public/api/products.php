<?php
require_once __DIR__ . '/db.php';
try {
    $pdo->exec("ALTER TABLE `admin_products` ADD COLUMN `subcategory` VARCHAR(191) NULL DEFAULT NULL AFTER `category`");
} catch (Throwable $e) { /* column exists */ }

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── GET: List all products (optimized - only needed columns) ───
if ($method === 'GET' && $action === 'list') {
    // Newest created listings first (duplicates/new saves). Tie-break by last update.
    $stmt = $pdo->query("SELECT product_id, item_name, sku, price, original_price, category, subcategory, fabric, images, item_note, offer_percent, description, created_at, updated_at FROM admin_products ORDER BY COALESCE(created_at, updated_at) DESC, updated_at DESC");
    $products = $stmt->fetchAll();
    foreach ($products as &$p) {
        $p['images'] = json_decode($p['images'], true) ?: [];
    }
    echo json_encode($products);
}

// ─── GET: Single product by product_id (full detail) ───
elseif ($method === 'GET' && $action === 'get') {
    $productId = $_GET['product_id'] ?? '';
    if (!$productId) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM admin_products WHERE product_id = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit();
    }

    $product['images'] = json_decode($product['images'], true) ?: [];

    // Also fetch collection assignments for this product
    $stmt2 = $pdo->prepare("SELECT collection_type FROM collection_assignments WHERE product_id = ?");
    $stmt2->execute([$productId]);
    $product['collections'] = array_column($stmt2->fetchAll(), 'collection_type');

    echo json_encode($product);
}

// ─── POST: Create or update product (upsert) ───
elseif ($method === 'POST' && $action === 'save') {
    validateToken();
    $input = json_decode(file_get_contents('php://input'), true);

    $productId = trim($input['product_id'] ?? '');
    if (!$productId) {
        http_response_code(400);
        echo json_encode(['error' => 'product_id is required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT id FROM admin_products WHERE product_id = ?");
    $stmt->execute([$productId]);
    $existing = $stmt->fetch();

    $data = [
        'item_name' => trim($input['item_name'] ?? $input['itemName'] ?? ''),
        'sku' => trim($input['sku'] ?? ''),
        'price' => floatval($input['price'] ?? 0),
        'original_price' => floatval($input['original_price'] ?? $input['originalPrice'] ?? 0),
        'category' => trim($input['category'] ?? ''),
        'subcategory' => trim($input['subcategory'] ?? $input['subCategory'] ?? ''),
        'fabric' => trim($input['fabric'] ?? ''),
        'description' => trim($input['description'] ?? ''),
        'long_description' => trim($input['long_description'] ?? $input['longDescription'] ?? ''),
        'item_note' => trim($input['item_note'] ?? $input['itemNote'] ?? ''),
        'images' => json_encode($input['images'] ?? []),
        'offer_percent' => intval($input['offer_percent'] ?? $input['offerPercent'] ?? 0),
        'map_location' => trim($input['map_location'] ?? $input['mapLocation'] ?? ''),
        'weight' => trim($input['weight'] ?? ''),
        'length' => trim($input['length'] ?? ''),
        'blouse_included' => trim($input['blouse_included'] ?? $input['blouseIncluded'] ?? ''),
        'care_instructions' => trim($input['care_instructions'] ?? $input['careInstructions'] ?? ''),
        'tags' => trim($input['tags'] ?? ''),
        'origin_story' => trim($input['origin_story'] ?? $input['originStory'] ?? ''),
        'weaving_process' => trim($input['weaving_process'] ?? $input['weavingProcess'] ?? ''),
        'quality_assurance' => trim($input['quality_assurance'] ?? $input['qualityAssurance'] ?? ''),
        'story_image_origin' => trim($input['story_image_origin'] ?? $input['storyImageOrigin'] ?? ''),
        'story_image_weaving' => trim($input['story_image_weaving'] ?? $input['storyImageWeaving'] ?? ''),
        'story_image_quality' => trim($input['story_image_quality'] ?? $input['storyImageQuality'] ?? ''),
        'story_image_banner' => trim($input['story_image_banner'] ?? $input['storyImageBanner'] ?? ''),
        'weave' => trim($input['weave'] ?? ''),
        'width' => trim($input['width'] ?? ''),
        'draping_style' => trim($input['draping_style'] ?? $input['drapingStyle'] ?? ''),
        'certification' => trim($input['certification'] ?? ''),
    ];

    if ($existing) {
        $fields = [];
        $values = [];
        foreach ($data as $key => $val) {
            $fields[] = "$key = ?";
            $values[] = $val;
        }
        $values[] = $productId;
        $pdo->prepare("UPDATE admin_products SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE product_id = ?")->execute($values);
        $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('products', 'Updated product', ?)")->execute([$data['item_name']]);
    } else {
        $data['product_id'] = $productId;
        $cols = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $pdo->prepare("INSERT INTO admin_products ($cols) VALUES ($placeholders)")->execute(array_values($data));
        $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('products', 'Created product', ?)")->execute([$data['item_name']]);
    }

    $stmt = $pdo->prepare("SELECT * FROM admin_products WHERE product_id = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    $product['images'] = json_decode($product['images'], true) ?: [];
    echo json_encode($product);
}

// ─── DELETE: Delete product ───
elseif ($method === 'DELETE' && $action === 'delete') {
    validateToken();
    $productId = $_GET['product_id'] ?? '';
    if (!$productId) {
        http_response_code(400);
        echo json_encode(['error' => 'product_id required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT item_name FROM admin_products WHERE product_id = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    $pdo->prepare("DELETE FROM admin_products WHERE product_id = ?")->execute([$productId]);
    $pdo->prepare("DELETE FROM collection_assignments WHERE product_id = ?")->execute([$productId]);

    if ($product) {
        $pdo->prepare("INSERT INTO edit_history (page, action, item_name) VALUES ('products', 'Deleted product', ?)")->execute([$product['item_name']]);
    }

    echo json_encode(['success' => true]);
}

// ─── GET: Products by collection type ───
elseif ($method === 'GET' && $action === 'by-collection') {
    $type = $_GET['type'] ?? '';
    if (!in_array($type, ['bridal', 'tissue', 'linen'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid collection type required']);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT p.product_id, p.item_name, p.sku, p.price, p.original_price, p.category, p.subcategory, p.fabric, p.images, p.item_note, p.offer_percent, p.description
        FROM admin_products p
        INNER JOIN collection_assignments ca ON ca.product_id = p.product_id
        WHERE ca.collection_type = ?
        ORDER BY COALESCE(p.created_at, p.updated_at) DESC, p.updated_at DESC
    ");
    $stmt->execute([$type]);
    $products = $stmt->fetchAll();
    foreach ($products as &$p) {
        $p['images'] = json_decode($p['images'], true) ?: [];
    }
    echo json_encode($products);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Unknown action']);
}
?>
