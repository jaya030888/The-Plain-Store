-- Database: the_plain_store (PostgreSQL version)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    house_flat VARCHAR(255) NOT NULL,
    street VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    category_id INT,
    stock INT NOT NULL DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT DEFAULT NULL,
    address_id INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    coupon_id INT DEFAULT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    order_status VARCHAR(50) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
    tracking_number VARCHAR(100) DEFAULT NULL,
    carrier VARCHAR(100) DEFAULT NULL,
    estimated_delivery DATE DEFAULT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 9. Cart Items (Persistent Cart)
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- 10. Wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- ==========================================
-- INITIAL SEED DATA
-- ==========================================

INSERT INTO categories (name, slug) VALUES 
('Home Decor', 'home-decor'),
('Organization', 'organization'),
('Wellness', 'wellness');

INSERT INTO products (name, slug, description, price, discount_price, category_id, stock, rating, review_count, is_featured) VALUES
('Wooden Jewellery Box', 'wooden-jewellery-box', 'Handcrafted solid wood jewellery box with brass accents. Perfect for organizing rings and small accessories.', 85.00, NULL, 2, 15, 4.8, 24, TRUE),
('Minimalist Desk Organizer', 'minimalist-desk-organizer', 'Sleek matte finish desk organizer to keep your workspace clutter-free.', 45.00, 39.99, 2, 30, 4.5, 12, TRUE),
('Ceramic Vase Set', 'ceramic-vase-set', 'Set of three minimalist ceramic vases in neutral tones. Ideal for dried flowers.', 60.00, NULL, 1, 10, 4.9, 45, TRUE),
('Handcrafted Incense Holder', 'handcrafted-incense-holder', 'Brass and marble incense holder. Adds a touch of zen to any room.', 25.00, NULL, 3, 50, 4.6, 8, TRUE),
('Linen Throw Blanket', 'linen-throw-blanket', 'Premium 100% organic linen throw blanket in beige.', 110.00, 89.99, 1, 5, 5.0, 3, FALSE),
('Concrete Coaster Set', 'concrete-coaster-set', 'Set of four industrial-style concrete coasters with cork bases.', 35.00, NULL, 1, 40, 4.7, 18, FALSE),
('Aromatherapy Diffuser', 'aromatherapy-diffuser', 'Matte ceramic essential oil diffuser with ambient warm light.', 75.00, 65.00, 3, 20, 4.4, 31, FALSE);

INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, '/wooden_jewellery_box.jpg', TRUE),
(2, 'https://images.unsplash.com/photo-1594042898950-c8e4a7c06eb1?ixlib=rb-4.0.3&w=600&q=80', TRUE),
(3, 'https://images.unsplash.com/photo-1613564998797-15d97f80f1d0?ixlib=rb-4.0.3&w=600&q=80', TRUE),
(4, 'https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-4.0.3&w=600&q=80', TRUE),
(5, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&w=600&q=80', TRUE),
(6, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&w=600&q=80', TRUE),
(7, 'https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-4.0.3&w=600&q=80', TRUE);
