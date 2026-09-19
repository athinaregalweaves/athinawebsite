<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? '';

// ─── CREATE ORDER ───
if ($method === 'POST' && $action === 'create') {
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $address = trim($input['address'] ?? '');
    $city = trim($input['city'] ?? '');
    $state = trim($input['state'] ?? '');
    $pincode = trim($input['pincode'] ?? '');
    $items = $input['items'] ?? [];
    $total = floatval($input['total'] ?? 0);
    $customerId = intval($input['customer_id'] ?? 0);

    if (!$name || !$email || !$phone || !$address || !$city || !$state || !$pincode) {
        http_response_code(400);
        echo json_encode(['error' => 'All address fields are required']);
        exit();
    }
    if (!preg_match('/^\d{6}$/', preg_replace('/\s+/', '', $pincode))) {
        http_response_code(400);
        echo json_encode(['error' => 'Pincode must be a valid 6-digit Indian postal code']);
        exit();
    }
    if (empty($items) || $total <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Cart is empty']);
        exit();
    }

    $orderNumber = 'ATH-' . strtoupper(substr(uniqid(), -8));

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("INSERT INTO orders (order_number, customer_id, customer_name, customer_email, customer_phone, address, city, state, pincode, total_amount, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')");
        $stmt->execute([$orderNumber, $customerId ?: null, $name, $email, $phone, $address, $city, $state, $pincode, $total]);
        $orderId = $pdo->lastInsertId();

        $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, product_sku, price, quantity) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($items as $item) {
            $pid = $item['product_id'] ?? '';
            $pname = trim((string)($item['product_name'] ?? ''));
            $qty = max(1, (int)($item['quantity'] ?? 1));
            $price = floatval($item['price'] ?? 0);
            if ($pname === '' || $price <= 0) {
                throw new Exception('Invalid line item');
            }
            if ($pid === '' || $pid === null) {
                $pid = 'unknown';
            }
            $stmt->execute([
                $orderId,
                (string) $pid,
                $pname,
                (string)($item['product_sku'] ?? ''),
                $price,
                $qty,
            ]);
        }

        $pdo->commit();
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['error' => 'Could not save order. Check order_items table exists and product lines are valid.']);
        exit();
    }

    sendOrderEmail($email, $name, $orderNumber, $items, $total);

    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'order_number' => $orderNumber,
    ]);
}

// ─── INITIATE RAZORPAY PAYMENT ───
elseif ($method === 'POST' && $action === 'create-payment') {
    $orderId = intval($input['order_id'] ?? 0);
    $amount = floatval($input['amount'] ?? 0);

    if (!$orderId || $amount <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid order or amount']);
        exit();
    }

    $razorpayKey = RAZORPAY_KEY_ID;
    $razorpaySecret = RAZORPAY_KEY_SECRET;

    if (
        !$razorpayKey || $razorpayKey === 'YOUR_RAZORPAY_KEY_ID' ||
        !$razorpaySecret || $razorpaySecret === 'YOUR_RAZORPAY_KEY_SECRET'
    ) {
        http_response_code(503);
        echo json_encode(['error' => 'Payment gateway not configured. Add api/secrets.local.php with Razorpay keys.']);
        exit();
    }

    $orderData = [
        'amount' => $amount * 100,
        'currency' => 'INR',
        'receipt' => 'order_' . $orderId,
        'notes' => ['order_id' => $orderId],
    ];

    $ch = curl_init('https://api.razorpay.com/v1/orders');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($orderData),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_USERPWD => "$razorpayKey:$razorpaySecret",
        CURLOPT_TIMEOUT => 30,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        http_response_code(500);
        echo json_encode(['error' => 'Payment gateway error']);
        exit();
    }

    $razorpayOrder = json_decode($response, true);

    $stmt = $pdo->prepare("UPDATE orders SET razorpay_order_id = ? WHERE id = ?");
    $stmt->execute([$razorpayOrder['id'], $orderId]);

    echo json_encode([
        'razorpay_order_id' => $razorpayOrder['id'],
        'razorpay_key' => $razorpayKey,
        'amount' => $amount * 100,
        'currency' => 'INR',
    ]);
}

// ─── VERIFY PAYMENT ───
elseif ($method === 'POST' && $action === 'verify-payment') {
    $razorpayPaymentId = $input['razorpay_payment_id'] ?? '';
    $razorpayOrderId = $input['razorpay_order_id'] ?? '';
    $razorpaySignature = $input['razorpay_signature'] ?? '';
    $orderId = intval($input['order_id'] ?? 0);

    $expectedSignature = hash_hmac('sha256', $razorpayOrderId . '|' . $razorpayPaymentId, RAZORPAY_KEY_SECRET);

    if (hash_equals($expectedSignature, $razorpaySignature)) {
        $newStatus = 'processing';
        $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'paid', razorpay_payment_id = ?, status = ? WHERE id = ?");
        $stmt->execute([$razorpayPaymentId, $newStatus, $orderId]);

        echo json_encode(['success' => true, 'message' => 'Payment verified']);
    } else {
        $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'failed' WHERE id = ?");
        $stmt->execute([$orderId]);
        http_response_code(400);
        echo json_encode(['error' => 'Payment verification failed']);
    }
}

// ─── MARK PAYMENT FAILED (when customer closes/cancels gateway) ───
elseif ($method === 'POST' && $action === 'mark-payment-failed') {
    $orderId = intval($input['order_id'] ?? 0);
    if (!$orderId) {
        http_response_code(400);
        echo json_encode(['error' => 'Order id required']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'failed', status = 'pending', updated_at = NOW() WHERE id = ? AND payment_status <> 'paid'");
    $stmt->execute([$orderId]);
    echo json_encode(['success' => true]);
}

// ─── GET ORDER (by order number) ───
elseif ($method === 'GET' && $action === 'track') {
    $orderNumber = $_GET['order_number'] ?? '';
    if (!$orderNumber) {
        http_response_code(400);
        echo json_encode(['error' => 'Order number required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM orders WHERE order_number = ?");
    $stmt->execute([$orderNumber]);
    $order = $stmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $stmt->execute([$order['id']]);
    $order['items'] = $stmt->fetchAll();
    echo json_encode($order);
}

// ─── MY ORDERS (for logged-in customer) ───
elseif ($method === 'GET' && $action === 'my-orders') {
    $auth = getRawAuthorizationHeader();
    if (!preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    $token = $matches[1];
    $stmt = $pdo->prepare("SELECT id FROM customers WHERE token = ? AND token_expiry > NOW()");
    $stmt->execute([$token]);
    $customer = $stmt->fetch();

    if (!$customer) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid session']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC");
    $stmt->execute([$customer['id']]);
    echo json_encode($stmt->fetchAll());
}

// ─── ADMIN: LIST ALL ORDERS ───
// Note: `list` is an alias for dashboard (was incorrectly calling `list` while only `admin-list` existed).
// PDO MySQL + ATTR_EMULATE_PREPARES false: bound LIMIT/OFFSET often fails; use safe integer SQL.
elseif ($method === 'GET' && ($action === 'admin-list' || $action === 'list')) {
    validateToken();
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = intval($_GET['limit'] ?? 25);
    if ($limit < 1) {
        $limit = 25;
    }
    if ($limit > 1000) {
        $limit = 1000;
    }
    $offset = ($page - 1) * $limit;

    $lim = (int) $limit;
    $off = (int) $offset;

    // One row per order_number (newest id). Empty/missing order_number groups by _pk_<id> so rows are not merged.
    $dedupGroup = "IFNULL(NULLIF(TRIM(COALESCE(order_number, '')), ''), CONCAT('_pk_', id))";

    $total = (int) $pdo->query(
        "SELECT COUNT(*) FROM ( SELECT 1 AS c FROM orders GROUP BY $dedupGroup ) t"
    )->fetchColumn();

    $orders = $pdo->query(
        "SELECT o.* FROM orders o
        INNER JOIN (
            SELECT MAX(id) AS id FROM orders GROUP BY $dedupGroup
        ) latest ON o.id = latest.id
        ORDER BY o.created_at DESC
        LIMIT {$lim} OFFSET {$off}"
    )->fetchAll();
    $orders = attachLineItemsForOrders($pdo, $orders);

    $pages = max(1, (int) ceil($total / $limit));
    echo json_encode(['orders' => $orders, 'total' => $total, 'page' => $page, 'pages' => $pages]);
}

// ─── ADMIN: SINGLE ORDER + LINE ITEMS (authenticated) ───
elseif ($method === 'GET' && $action === 'admin-detail') {
    validateToken();
    $orderId = intval($_GET['id'] ?? 0);
    if (!$orderId) {
        http_response_code(400);
        echo json_encode(['error' => 'Order id required']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $stmt->execute([$orderId]);
    $order['items'] = $stmt->fetchAll();
    echo json_encode($order);
}

// ─── ADMIN: UPDATE ORDER STATUS ───
elseif ($method === 'PUT' && $action === 'update-status') {
    validateToken();
    $orderId = intval($_GET['id'] ?? 0);
    $status = $input['status'] ?? '';
    $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivery', 'delivered', 'cancelled'];

    if (!in_array($status, $validStatuses)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$status, $orderId]);

    echo json_encode(['success' => true]);
}

// ─── ADMIN: UPDATE PAYMENT STATUS (links to shipping when ready) ───
elseif ($method === 'PUT' && $action === 'update-payment-status') {
    validateToken();
    $orderId = intval($_GET['id'] ?? 0);
    $paymentStatus = $input['payment_status'] ?? '';
    $validPayment = ['pending', 'paid', 'failed', 'refunded'];

    if (!in_array($paymentStatus, $validPayment, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid payment status']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$paymentStatus, $orderId]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit();
    }

    echo json_encode(['success' => true]);
}

// ─── ADMIN: FIX SHIPPING FIELDS ───
elseif ($method === 'PUT' && $action === 'admin-update-shipping') {
    validateToken();
    $orderId = intval($_GET['id'] ?? 0);
    if (!$orderId) {
        http_response_code(400);
        echo json_encode(['error' => 'Order id required']);
        exit();
    }

    $sets = [];
    $vals = [];
    if (array_key_exists('address', $input)) {
        $sets[] = 'address = ?';
        $vals[] = trim((string) $input['address']);
    }
    if (array_key_exists('city', $input)) {
        $sets[] = 'city = ?';
        $vals[] = trim((string) $input['city']);
    }
    if (array_key_exists('state', $input)) {
        $sets[] = 'state = ?';
        $vals[] = trim((string) $input['state']);
    }
    if (array_key_exists('pincode', $input)) {
        $pc = preg_replace('/\s+/', '', trim((string) $input['pincode']));
        if (!preg_match('/^\d{6}$/', $pc)) {
            http_response_code(400);
            echo json_encode(['error' => 'Pincode must be exactly 6 digits']);
            exit();
        }
        $sets[] = 'pincode = ?';
        $vals[] = $pc;
    }
    if (array_key_exists('customer_phone', $input)) {
        $sets[] = 'customer_phone = ?';
        $vals[] = trim((string) $input['customer_phone']);
    }

    if (empty($sets)) {
        http_response_code(400);
        echo json_encode(['error' => 'Provide at least one field: address, city, state, pincode, customer_phone']);
        exit();
    }

    $vals[] = $orderId;
    $sql = 'UPDATE orders SET ' . implode(', ', $sets) . ', updated_at = NOW() WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($vals);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit();
    }

    echo json_encode(['success' => true]);
}

// ─── HELPERS ───

/** Batch-load order_items for admin list/detail so the dashboard always shows line items. */
function attachLineItemsForOrders(PDO $pdo, array $orders) {
    if (empty($orders)) {
        return $orders;
    }
    $ids = [];
    foreach ($orders as $o) {
        $id = (int)($o['id'] ?? 0);
        if ($id > 0) {
            $ids[$id] = true;
        }
    }
    $idList = array_keys($ids);
    if (empty($idList)) {
        foreach ($orders as &$o) {
            $o['items'] = [];
        }
        unset($o);
        return $orders;
    }
    $in = implode(',', $idList);
    $stmt = $pdo->query("SELECT * FROM order_items WHERE order_id IN ($in) ORDER BY id ASC");
    $rows = $stmt->fetchAll();
    $byOrder = [];
    foreach ($rows as $row) {
        $oid = (int)$row['order_id'];
        $byOrder[$oid][] = $row;
    }
    foreach ($orders as &$o) {
        $oid = (int)($o['id'] ?? 0);
        $o['items'] = $byOrder[$oid] ?? [];
    }
    unset($o);
    return $orders;
}

function sendOrderEmail($to, $name, $orderNumber, $items, $total) {
    $itemsHtml = '';
    foreach ($items as $item) {
        $subtotal = $item['price'] * $item['quantity'];
        $itemsHtml .= '<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e0d8;font-size:14px;">' . htmlspecialchars($item['product_name']) . '</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e0d8;font-size:14px;text-align:center;">' . $item['quantity'] . '</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e8e0d8;font-size:14px;text-align:right;">₹' . number_format($subtotal) . '</td>
        </tr>';
    }

    $html = '<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#FAF8F5;padding:40px 20px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e8e0d8;padding:40px;">
        <div style="text-align:center;margin-bottom:30px;">
            <div style="display:inline-block;border-left:3px solid #C4A265;padding-left:12px;">
                <div style="font-size:20px;letter-spacing:0.25em;font-weight:bold;color:#1a1a1a;">ATHINA</div>
                <div style="font-size:9px;letter-spacing:0.4em;color:#C4A265;margin-top:4px;">REGAL WEAVES</div>
            </div>
        </div>
        <h2 style="text-align:center;color:#722F37;font-size:22px;margin:0 0 10px;">Order Confirmation</h2>
        <p style="text-align:center;color:#555;font-size:14px;">Dear ' . htmlspecialchars($name) . ',</p>
        <p style="text-align:center;color:#555;font-size:14px;">Thank you for your order! Your order number is:</p>
        <div style="text-align:center;margin:20px 0;">
            <span style="display:inline-block;background:#722F37;color:#FAF8F5;font-size:18px;letter-spacing:0.2em;padding:12px 24px;font-weight:bold;">' . $orderNumber . '</span>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr style="background:#f5f0eb;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Item</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;">Amount</th>
            </tr>
            ' . $itemsHtml . '
            <tr>
                <td colspan="2" style="padding:12px;font-size:16px;font-weight:bold;text-align:right;">Total:</td>
                <td style="padding:12px;font-size:16px;font-weight:bold;text-align:right;color:#722F37;">₹' . number_format($total) . '</td>
            </tr>
        </table>
        <p style="text-align:center;color:#999;font-size:12px;margin-top:30px;">We will notify you once your order is shipped.</p>
        <hr style="border:none;border-top:1px solid #e8e0d8;margin:30px 0;">
        <p style="text-align:center;color:#999;font-size:11px;">' . SITE_NAME . ' · Hyderabad · Heritage Handloom</p>
    </div></body></html>';

    $headers = "From: " . SITE_NAME . " <" . SITE_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . SITE_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    mail($to, "Order Confirmed - $orderNumber | " . SITE_NAME, $html, $headers);
}
?>
