-- ============================================
-- Athina Regal Weaves - Complete Database Schema
-- Run this ONCE in phpMyAdmin on Hostinger
-- Last Updated: March 2026
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+05:30";

-- ============================================
-- 1. Admin Users
-- ============================================
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) DEFAULT '',
    `token` VARCHAR(255) DEFAULT NULL,
    `token_expiry` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_admin_token` (`token`, `token_expiry`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Homepage Sections
-- ============================================
CREATE TABLE IF NOT EXISTS `homepage_sections` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `section_key` VARCHAR(50) NOT NULL UNIQUE,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) DEFAULT '',
    `description` TEXT DEFAULT NULL,
    `image_url` VARCHAR(500) DEFAULT '',
    `video_url` TEXT NULL DEFAULT NULL,
    `image_width` INT DEFAULT 1920,
    `image_height` INT DEFAULT 1080,
    `redirect_page` VARCHAR(100) DEFAULT '/collections',
    `button_text` VARCHAR(100) DEFAULT 'Explore',
    `caption` VARCHAR(255) DEFAULT '',
    `is_active` TINYINT(1) DEFAULT 1,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Customers
-- ============================================
CREATE TABLE IF NOT EXISTS `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `phone` VARCHAR(20) DEFAULT '',
    `password_hash` VARCHAR(255) NOT NULL,
    `address` TEXT DEFAULT NULL,
    `city` VARCHAR(100) DEFAULT '',
    `state` VARCHAR(100) DEFAULT '',
    `pincode` VARCHAR(10) DEFAULT '',
    `is_verified` TINYINT(1) DEFAULT 0,
    `otp_code` VARCHAR(6) DEFAULT NULL,
    `otp_expiry` DATETIME DEFAULT NULL,
    `token` VARCHAR(255) DEFAULT NULL,
    `token_expiry` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_customer_token` (`token`, `token_expiry`),
    INDEX `idx_customer_otp` (`email`, `otp_code`, `otp_expiry`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Orders
-- ============================================
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_number` VARCHAR(20) NOT NULL UNIQUE,
    `customer_id` INT DEFAULT NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_email` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `pincode` VARCHAR(10) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pending','confirmed','processing','shipped','delivery','delivered','cancelled') DEFAULT 'pending',
    `payment_status` ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
    `razorpay_order_id` VARCHAR(255) DEFAULT NULL,
    `razorpay_payment_id` VARCHAR(255) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_order_customer` (`customer_id`),
    INDEX `idx_order_status` (`status`),
    INDEX `idx_order_created` (`created_at`),
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Order Items
-- ============================================
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `product_sku` VARCHAR(100) DEFAULT '',
    `price` DECIMAL(10, 2) NOT NULL,
    `quantity` INT DEFAULT 1,
    INDEX `idx_orderitems_order` (`order_id`),
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Edit History (audit log)
-- ============================================
CREATE TABLE IF NOT EXISTS `edit_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `page` VARCHAR(50) NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `item_name` VARCHAR(255) DEFAULT '',
    `image_url` VARCHAR(500) DEFAULT '',
    `old_data` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_history_page` (`page`),
    INDEX `idx_history_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6b. Site page content (Heritage, Store/Atelier, Contact)
-- ============================================
CREATE TABLE IF NOT EXISTS `site_page_content` (
    `page_key` VARCHAR(32) NOT NULL PRIMARY KEY,
    `content_json` LONGTEXT NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Blog Posts
-- ============================================
CREATE TABLE IF NOT EXISTS `blogs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(255) NOT NULL UNIQUE,
    `headline` VARCHAR(500) NOT NULL,
    `excerpt` TEXT DEFAULT NULL,
    `category` VARCHAR(100) DEFAULT '',
    `date` VARCHAR(50) DEFAULT '',
    `read_time` VARCHAR(20) DEFAULT '',
    `author` VARCHAR(255) DEFAULT '',
    `image` VARCHAR(1000) DEFAULT '',
    `body` JSON DEFAULT NULL,
    `images` JSON DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_blog_active` (`is_active`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Contact Inquiries
-- ============================================
CREATE TABLE IF NOT EXISTS `contact_inquiries` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT '',
    `email` VARCHAR(255) NOT NULL,
    `preferred_date` VARCHAR(50) DEFAULT '',
    `message` TEXT DEFAULT NULL,
    `status` ENUM('new','contacted','resolved') DEFAULT 'new',
    `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_inquiry_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. Collection Assignments (product <-> collection)
-- ============================================
CREATE TABLE IF NOT EXISTS `collection_meta` (
    `collection_key` VARCHAR(64) NOT NULL,
    `display_name` VARCHAR(200) NOT NULL,
    `icon_key` VARCHAR(32) NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`collection_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `collection_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` VARCHAR(100) NOT NULL,
    `collection_type` VARCHAR(80) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_assignment` (`product_id`, `collection_type`),
    INDEX `idx_collection_type` (`collection_type`),
    INDEX `idx_collection_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. Admin Products (custom/edited product data)
-- ============================================
CREATE TABLE IF NOT EXISTS `admin_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` VARCHAR(50) NOT NULL UNIQUE,
    `item_name` VARCHAR(500) NOT NULL,
    `sku` VARCHAR(100) DEFAULT '',
    `price` DECIMAL(10, 2) DEFAULT 0,
    `original_price` DECIMAL(10, 2) DEFAULT 0,
    `category` VARCHAR(100) DEFAULT '',
    `fabric` VARCHAR(100) DEFAULT '',
    `description` TEXT DEFAULT NULL,
    `long_description` TEXT DEFAULT NULL,
    `item_note` TEXT DEFAULT NULL,
    `images` JSON DEFAULT NULL,
    `offer_percent` INT DEFAULT 0,
    `map_location` VARCHAR(255) DEFAULT '',
    `weight` VARCHAR(50) DEFAULT '',
    `length` VARCHAR(50) DEFAULT '',
    `blouse_included` VARCHAR(100) DEFAULT '',
    `care_instructions` TEXT DEFAULT NULL,
    `tags` TEXT DEFAULT NULL,
    `origin_story` TEXT DEFAULT NULL,
    `weaving_process` TEXT DEFAULT NULL,
    `quality_assurance` TEXT DEFAULT NULL,
    `story_image_origin` VARCHAR(1000) DEFAULT '',
    `story_image_weaving` VARCHAR(1000) DEFAULT '',
    `story_image_quality` VARCHAR(1000) DEFAULT '',
    `story_image_banner` VARCHAR(1000) DEFAULT '',
    `weave` VARCHAR(100) DEFAULT '',
    `width` VARCHAR(50) DEFAULT '',
    `draping_style` VARCHAR(100) DEFAULT '',
    `certification` VARCHAR(255) DEFAULT '',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_product_category` (`category`),
    INDEX `idx_product_updated` (`updated_at`),
    INDEX `idx_product_sku` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Default Data
-- ============================================

-- Default homepage sections
INSERT INTO `homepage_sections` (`section_key`, `title`, `subtitle`, `description`, `caption`, `redirect_page`, `button_text`) VALUES
('hero', 'Timeless Sarees', 'Crafted for Legacy', 'Discover curated handloom sarees designed for modern royalty. Each piece, a masterwork of Indian artistry.', 'Hyderabad · Heritage Handloom', '/collections', 'Explore Collection'),
('bridal', 'Bridal Sarees', 'for Grand Celebrations', 'Sarees crafted for the most celebrated moments. Each bridal piece is a masterwork of heritage weaving and timeless beauty.', 'Bridal Couture', '/bridal', 'View Bridal Collection'),
('tissue', 'Tissue &', 'Organza', 'Luminous tissue weaves and delicate organza sarees that capture light and movement with every drape.', 'Ethereal Elegance', '/collections', 'Explore Tissue'),
('linen', 'Linen &', 'Cotton', 'Everyday luxury in breathable linen and cotton weaves. Perfect for the modern woman who values comfort and craft.', 'Contemporary Heritage', '/collections', 'Explore Linen')
ON DUPLICATE KEY UPDATE `section_key` = `section_key`;

-- Default admin user (email: athina@gmail.com / password: athina123)
-- Generate a proper hash: Run this PHP once on your server:
-- echo password_hash('athina123', PASSWORD_DEFAULT);
-- Then replace the hash below with the output.
INSERT INTO `admin_users` (`email`, `password_hash`, `name`) VALUES
('athina@gmail.com', '$2y$10$YJ8mM7bHXFZ1qKx5kDvJxOQgE3Z1n5F7vN8mR9pL2wX4tY6uI0S3a', 'Athina Admin')
ON DUPLICATE KEY UPDATE `email` = `email`;

COMMIT;
