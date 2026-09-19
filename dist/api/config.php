<?php
// ============================================
// GLOBAL CONFIGURATION - Athina Regal Weaves
// ============================================

// Razorpay keys: copy secrets.local.example.php → secrets.local.php on the server (gitignored), or set env RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in Hostinger.
if (is_readable(__DIR__ . '/secrets.local.php')) {
    require __DIR__ . '/secrets.local.php';
}

// Site settings
define('SITE_NAME', 'Athina Regal Weaves');
define('SITE_EMAIL', 'info@athinaregalweaves.com');
define('SITE_URL', 'https://athinaregalweaves.com');

// Upload settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_UPLOAD_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp']);

// Token settings
define('ADMIN_TOKEN_EXPIRY', '+24 hours');
define('CUSTOMER_TOKEN_EXPIRY', '+7 days');
define('OTP_EXPIRY', '+15 minutes');

// Razorpay (overridden by secrets.local.php or environment)
if (!defined('RAZORPAY_KEY_ID')) {
    $rzpKey = getenv('RAZORPAY_KEY_ID');
    define('RAZORPAY_KEY_ID', ($rzpKey !== false && $rzpKey !== '') ? $rzpKey : 'YOUR_RAZORPAY_KEY_ID');
}
if (!defined('RAZORPAY_KEY_SECRET')) {
    $rzpSecret = getenv('RAZORPAY_KEY_SECRET');
    define('RAZORPAY_KEY_SECRET', ($rzpSecret !== false && $rzpSecret !== '') ? $rzpSecret : 'YOUR_RAZORPAY_KEY_SECRET');
}

// Database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'u586955688_athinaregal');
define('DB_USER', 'u586955688_athinaregal');
define('DB_PASS', 'AthinA@23');
?>
