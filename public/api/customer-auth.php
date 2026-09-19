<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

// ─── ADMIN: LIST REGISTERED CUSTOMERS (no passwords) ───
if ($method === 'GET' && $action === 'admin-list') {
    validateToken();
    $stmt = $pdo->query('SELECT id, name, email, phone, address, city, state, pincode, is_verified, created_at, updated_at FROM customers ORDER BY created_at DESC');
    $customers = $stmt->fetchAll();
    foreach ($customers as &$c) {
        $c['id'] = (int) $c['id'];
        $c['is_verified'] = (bool) $c['is_verified'];
        $c['phone'] = $c['phone'] ?? '';
        $c['address'] = $c['address'] ?? '';
        $c['city'] = $c['city'] ?? '';
        $c['state'] = $c['state'] ?? '';
        $c['pincode'] = $c['pincode'] ?? '';
    }
    unset($c);
    echo json_encode(['customers' => $customers]);
    exit();
}

if ($method === 'POST') {

    // ─── REGISTER ───
    if ($action === 'register') {
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $password = $input['password'] ?? '';

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Name, email and password are required']);
            exit();
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address']);
            exit();
        }
        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT id FROM customers WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already registered']);
            exit();
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpiry = date('Y-m-d H:i:s', strtotime(OTP_EXPIRY));

        $stmt = $pdo->prepare("INSERT INTO customers (name, email, phone, password_hash, otp_code, otp_expiry, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)");
        $stmt->execute([$name, $email, $phone, $hash, $otp, $otpExpiry]);

        sendOTPEmail($email, $name, $otp);

        echo json_encode(['success' => true, 'message' => 'Registration successful. Please verify your email.', 'email' => $email]);
    }

    // ─── LOGIN ───
    elseif ($action === 'login') {
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM customers WHERE email = ?");
        $stmt->execute([$email]);
        $customer = $stmt->fetch();

        if (!$customer || !password_verify($password, $customer['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            exit();
        }

        if (!$customer['is_verified']) {
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $otpExpiry = date('Y-m-d H:i:s', strtotime(OTP_EXPIRY));
            $stmt = $pdo->prepare("UPDATE customers SET otp_code = ?, otp_expiry = ? WHERE id = ?");
            $stmt->execute([$otp, $otpExpiry, $customer['id']]);
            sendOTPEmail($email, $customer['name'], $otp);

            http_response_code(403);
            echo json_encode(['error' => 'Email not verified. A new OTP has been sent.', 'needsVerification' => true, 'email' => $email]);
            exit();
        }

        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime(CUSTOMER_TOKEN_EXPIRY));
        $stmt = $pdo->prepare("UPDATE customers SET token = ?, token_expiry = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$token, $expiry, $customer['id']]);

        $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
        $stmt->execute([$customer['id']]);
        $fresh = $stmt->fetch();

        echo json_encode([
            'token' => $token,
            'user' => customerToJson($fresh ?: $customer)
        ]);
    }

    // ─── VERIFY OTP ───
    elseif ($action === 'verify-otp') {
        $email = trim($input['email'] ?? '');
        $otp = trim($input['otp'] ?? '');

        if (!$email || !$otp) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and OTP required']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM customers WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()");
        $stmt->execute([$email, $otp]);
        $customer = $stmt->fetch();

        if (!$customer) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or expired OTP']);
            exit();
        }

        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime(CUSTOMER_TOKEN_EXPIRY));

        $stmt = $pdo->prepare("UPDATE customers SET is_verified = 1, otp_code = NULL, otp_expiry = NULL, token = ?, token_expiry = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$token, $expiry, $customer['id']]);

        $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
        $stmt->execute([$customer['id']]);
        $fresh = $stmt->fetch();

        echo json_encode([
            'token' => $token,
            'user' => customerToJson($fresh ?: array_merge($customer, ['is_verified' => 1]))
        ]);
    }

    // ─── RESEND OTP ───
    elseif ($action === 'resend-otp') {
        $email = trim($input['email'] ?? '');
        if (!$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Email required']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM customers WHERE email = ?");
        $stmt->execute([$email]);
        $customer = $stmt->fetch();

        if (!$customer) {
            http_response_code(404);
            echo json_encode(['error' => 'Account not found']);
            exit();
        }

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpiry = date('Y-m-d H:i:s', strtotime(OTP_EXPIRY));
        $stmt = $pdo->prepare("UPDATE customers SET otp_code = ?, otp_expiry = ? WHERE id = ?");
        $stmt->execute([$otp, $otpExpiry, $customer['id']]);

        sendOTPEmail($email, $customer['name'], $otp);
        echo json_encode(['success' => true, 'message' => 'OTP sent to your email']);
    }

    // ─── UPDATE PROFILE ───
    elseif ($action === 'update-profile') {
        $customer = validateCustomerToken();
        $name = trim($input['name'] ?? $customer['name']);
        $phone = trim($input['phone'] ?? $customer['phone']);
        $address = trim($input['address'] ?? $customer['address'] ?? '');
        $city = trim($input['city'] ?? $customer['city'] ?? '');
        $state = trim($input['state'] ?? $customer['state'] ?? '');
        $pincode = trim($input['pincode'] ?? $customer['pincode'] ?? '');

        $stmt = $pdo->prepare("UPDATE customers SET name = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$name, $phone, $address, $city, $state, $pincode, $customer['id']]);

        $customer['name'] = $name;
        $customer['phone'] = $phone;
        $customer['address'] = $address;
        $customer['city'] = $city;
        $customer['state'] = $state;
        $customer['pincode'] = $pincode;

        echo json_encode(['success' => true, 'user' => customerToJson($customer)]);
    }

    // ─── GET PROFILE ───
    elseif ($action === 'profile') {
        $customer = validateCustomerToken();
        echo json_encode(['user' => customerToJson($customer)]);
    }

    // ─── LOGOUT ───
    elseif ($action === 'logout') {
        $customer = validateCustomerToken();
        $stmt = $pdo->prepare("UPDATE customers SET token = NULL, token_expiry = NULL WHERE id = ?");
        $stmt->execute([$customer['id']]);
        echo json_encode(['success' => true]);
    }

    // ─── FORGOT PASSWORD ───
    elseif ($action === 'forgot-password') {
        $email = trim($input['email'] ?? '');
        if (!$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Email required']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM customers WHERE email = ?");
        $stmt->execute([$email]);
        $customer = $stmt->fetch();

        if ($customer) {
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $otpExpiry = date('Y-m-d H:i:s', strtotime(OTP_EXPIRY));
            $stmt = $pdo->prepare("UPDATE customers SET otp_code = ?, otp_expiry = ? WHERE id = ?");
            $stmt->execute([$otp, $otpExpiry, $customer['id']]);
            sendOTPEmail($email, $customer['name'], $otp, 'reset');
        }

        echo json_encode(['success' => true, 'message' => 'If the email exists, an OTP has been sent']);
    }

    // ─── RESET PASSWORD ───
    elseif ($action === 'reset-password') {
        $email = trim($input['email'] ?? '');
        $otp = trim($input['otp'] ?? '');
        $newPassword = $input['newPassword'] ?? '';

        if (!$email || !$otp || !$newPassword) {
            http_response_code(400);
            echo json_encode(['error' => 'Email, OTP and new password required']);
            exit();
        }
        if (strlen($newPassword) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            exit();
        }

        $stmt = $pdo->prepare("SELECT * FROM customers WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()");
        $stmt->execute([$email, $otp]);
        $customer = $stmt->fetch();

        if (!$customer) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or expired OTP']);
            exit();
        }

        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE customers SET password_hash = ?, otp_code = NULL, otp_expiry = NULL, is_verified = 1 WHERE id = ?");
        $stmt->execute([$hash, $customer['id']]);

        echo json_encode(['success' => true, 'message' => 'Password reset successful']);
    }
}

// ─── HELPERS ───

function validateCustomerToken() {
    $auth = getRawAuthorizationHeader();
    if (!preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }

    global $pdo;
    $token = $matches[1];
    $stmt = $pdo->prepare("SELECT * FROM customers WHERE token = ? AND token_expiry > NOW()");
    $stmt->execute([$token]);
    $customer = $stmt->fetch();

    if (!$customer) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired session']);
        exit();
    }

    return $customer;
}

function customerToJson($c) {
    return [
        'id' => (int)$c['id'],
        'name' => $c['name'],
        'email' => $c['email'],
        'phone' => $c['phone'] ?? '',
        'address' => $c['address'] ?? '',
        'city' => $c['city'] ?? '',
        'state' => $c['state'] ?? '',
        'pincode' => $c['pincode'] ?? '',
        'is_verified' => (bool)$c['is_verified'],
    ];
}

function sendOTPEmail($to, $name, $otp, $type = 'verify') {
    $subject = $type === 'reset'
        ? SITE_NAME . ' - Password Reset OTP'
        : SITE_NAME . ' - Verify Your Email';

    $heading = $type === 'reset' ? 'Password Reset' : 'Verify Your Email';
    $message = $type === 'reset'
        ? 'Use the code below to reset your password.'
        : 'Thank you for registering! Use the code below to verify your email.';

    $html = '<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#FAF8F5;padding:40px 20px;">
    <div style="max-width:500px;margin:0 auto;background:#fff;border:1px solid #e8e0d8;padding:40px;">
        <div style="text-align:center;margin-bottom:30px;">
            <div style="display:inline-block;border-left:3px solid #C4A265;padding-left:12px;">
                <div style="font-size:20px;letter-spacing:0.25em;font-weight:bold;color:#1a1a1a;">ATHINA</div>
                <div style="font-size:9px;letter-spacing:0.4em;color:#C4A265;margin-top:4px;">REGAL WEAVES</div>
            </div>
        </div>
        <h2 style="text-align:center;color:#722F37;font-size:22px;margin:0 0 10px;">' . $heading . '</h2>
        <p style="text-align:center;color:#555;font-size:14px;">Dear ' . htmlspecialchars($name) . ',</p>
        <p style="text-align:center;color:#555;font-size:14px;">' . $message . '</p>
        <div style="text-align:center;margin:30px 0;">
            <div style="display:inline-block;background:#722F37;color:#FAF8F5;font-size:32px;letter-spacing:0.5em;padding:15px 30px;font-weight:bold;">' . $otp . '</div>
        </div>
        <p style="text-align:center;color:#999;font-size:12px;">This code expires in 15 minutes.</p>
        <hr style="border:none;border-top:1px solid #e8e0d8;margin:30px 0;">
        <p style="text-align:center;color:#999;font-size:11px;">' . SITE_NAME . ' · Hyderabad · Heritage Handloom</p>
    </div></body></html>';

    $headers = "From: " . SITE_NAME . " <" . SITE_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . SITE_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    mail($to, $subject, $html, $headers);
}
?>
