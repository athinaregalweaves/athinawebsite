<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ─── POST: Submit inquiry (public) ───
if ($method === 'POST' && $action === 'submit') {
    $input = json_decode(file_get_contents('php://input'), true);

    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $preferredDate = trim($input['preferredDate'] ?? '');
    $message = trim($input['message'] ?? '');

    if (!$name || !$email) {
        http_response_code(400);
        echo json_encode(['error' => 'Name and email are required']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO contact_inquiries (name, email, phone, preferred_date, message) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$name, $email, $phone, $preferredDate, $message]);

    $adminHtml = '<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#FAF8F5;padding:20px;">
    <div style="max-width:500px;margin:0 auto;background:#fff;border:1px solid #e8e0d8;padding:30px;">
        <h2 style="color:#722F37;font-size:18px;">New Contact Inquiry</h2>
        <p><strong>Name:</strong> ' . htmlspecialchars($name) . '</p>
        <p><strong>Email:</strong> ' . htmlspecialchars($email) . '</p>
        <p><strong>Phone:</strong> ' . htmlspecialchars($phone) . '</p>
        <p><strong>Preferred Date:</strong> ' . htmlspecialchars($preferredDate) . '</p>
        <p><strong>Message:</strong> ' . htmlspecialchars($message) . '</p>
    </div></body></html>';

    $headers = "From: " . SITE_NAME . " <" . SITE_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    mail(SITE_EMAIL, "New Inquiry from $name", $adminHtml, $headers);

    echo json_encode(['success' => true, 'message' => 'Inquiry submitted successfully']);
}

// ─── GET: Admin list all inquiries ───
elseif ($method === 'GET' && $action === 'list') {
    validateToken();
    $stmt = $pdo->query("SELECT * FROM contact_inquiries ORDER BY submitted_at DESC");
    echo json_encode($stmt->fetchAll());
}

// ─── PUT: Update inquiry status ───
elseif ($method === 'PUT' && $action === 'update-status') {
    validateToken();
    $id = intval($_GET['id'] ?? 0);
    $input = json_decode(file_get_contents('php://input'), true);
    $status = $input['status'] ?? '';

    if (!$id || !in_array($status, ['new', 'contacted', 'resolved'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid ID and status required']);
        exit();
    }

    $pdo->prepare("UPDATE contact_inquiries SET status = ?, updated_at = NOW() WHERE id = ?")->execute([$status, $id]);
    echo json_encode(['success' => true]);
}

// ─── DELETE: Delete inquiry ───
elseif ($method === 'DELETE' && $action === 'delete') {
    validateToken();
    $id = intval($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID required']);
        exit();
    }

    $pdo->prepare("DELETE FROM contact_inquiries WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Unknown action']);
}
?>
