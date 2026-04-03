CREATE TABLE IF NOT EXISTS product_stock_items (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  credential_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  credential_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unsold' CHECK (status IN ('unsold', 'sold')),
  sold_order_item_id BIGINT REFERENCES order_items(id) ON DELETE SET NULL,
  sold_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sold_at TIMESTAMPTZ,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_stock_items_product_id ON product_stock_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_items_status ON product_stock_items(product_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_stock_items_hash ON product_stock_items(product_id, credential_hash);
