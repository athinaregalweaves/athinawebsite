<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$user = validateToken();

// Support common multipart field names and also be defensive about empty/array payloads.
$file = $_FILES['image'] ?? $_FILES['file'] ?? null;
if (!$file && !empty($_FILES)) {
    $file = array_values($_FILES)[0];
}

if (!$file || empty($file['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No image uploaded']);
    exit();
}

// If multiple files were posted accidentally, take the first.
if (is_array($file['tmp_name'])) {
    $file = [
        'name' => $file['name'][0] ?? 'upload',
        'type' => $file['type'][0] ?? '',
        'tmp_name' => $file['tmp_name'][0] ?? '',
        'error' => $file['error'][0] ?? 0,
        'size' => $file['size'][0] ?? 0,
    ];
}

if (!empty($file['error']) && (int)$file['error'] !== 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload error (code ' . (int)$file['error'] . ')']);
    exit();
}

if (isset($file['size']) && (int)$file['size'] > MAX_UPLOAD_SIZE) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large (max 5MB)']);
    exit();
}

// Validate the actual image contents (MIME from browsers can be unreliable).
$imageInfo = @getimagesize($file['tmp_name']);
if ($imageInfo === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid image file']);
    exit();
}

$mime = $imageInfo['mime'] ?? ($file['type'] ?? '');
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($mime, $allowedMimes, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Only JPG, PNG, WEBP allowed']);
    exit();
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!$ext) {
    $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $ext = $extMap[$mime] ?? 'jpg';
}
if ($ext === 'jpeg') $ext = 'jpg';

$uploadDir = rtrim(UPLOAD_DIR, "/\\") . DIRECTORY_SEPARATOR;
if (!is_dir($uploadDir)) {
    // Create upload dir if it doesn't exist.
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Upload directory missing and could not be created', 'uploadDir' => $uploadDir]);
        exit();
    }
}

if (!is_writable($uploadDir)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Upload directory is not writable',
        'uploadDir' => $uploadDir,
    ]);
    exit();
}

$filename = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$path = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $path)) {
    http_response_code(500);
    echo json_encode(['error' => 'Upload failed']);
    exit();
}

// Always return URL rooted at site webroot.
// This avoids broken paths like `/api/../uploads/...` on some hosts.
$urlPath = "/uploads/" . $filename;
$width = $imageInfo[0] ?? 0;
$height = $imageInfo[1] ?? 0;

echo json_encode([
    'url' => $urlPath,
    'width' => $width,
    'height' => $height
]);
?>
