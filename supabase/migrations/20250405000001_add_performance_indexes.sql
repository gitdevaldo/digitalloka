CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON orders (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id_created_at ON entitlements (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_product_stock_items_product_id_status ON product_stock_items (product_id, status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_is_visible_created_at ON products (is_visible, created_at);
