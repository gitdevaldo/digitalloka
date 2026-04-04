BEGIN;

-- ============================================================
-- 1. Convert json columns to jsonb (15 columns)
-- ============================================================

ALTER TABLE audit_logs       ALTER COLUMN changes        TYPE jsonb USING changes::jsonb;
ALTER TABLE entitlements      ALTER COLUMN meta           TYPE jsonb USING meta::jsonb;
ALTER TABLE order_items       ALTER COLUMN meta           TYPE jsonb USING meta::jsonb;
ALTER TABLE orders            ALTER COLUMN meta           TYPE jsonb USING meta::jsonb;
ALTER TABLE payment_events    ALTER COLUMN payload        TYPE jsonb USING payload::jsonb;
ALTER TABLE product_stock_items ALTER COLUMN meta         TYPE jsonb USING meta::jsonb;
ALTER TABLE product_stock_items ALTER COLUMN credential_data TYPE jsonb USING credential_data::jsonb;
ALTER TABLE products          ALTER COLUMN tags           TYPE jsonb USING tags::jsonb;
ALTER TABLE products          ALTER COLUMN faq_items      TYPE jsonb USING faq_items::jsonb;
ALTER TABLE products          ALTER COLUMN badges         TYPE jsonb USING badges::jsonb;
ALTER TABLE products          ALTER COLUMN meta           TYPE jsonb USING meta::jsonb;
ALTER TABLE products          ALTER COLUMN featured       TYPE jsonb USING featured::jsonb;
ALTER TABLE site_settings     ALTER COLUMN setting_value  TYPE jsonb USING setting_value::jsonb;
ALTER TABLE transactions      ALTER COLUMN payload        TYPE jsonb USING payload::jsonb;
ALTER TABLE users             ALTER COLUMN droplet_ids    TYPE jsonb USING droplet_ids::jsonb;

-- ============================================================
-- 2. Drop duplicate unconditional unique indexes
--    Keep the conditional idx_* variants from migration 002.
-- ============================================================

DROP INDEX IF EXISTS payment_events_idempotency_key_unique;
DROP INDEX IF EXISTS transactions_idempotency_key_unique;

-- ============================================================
-- 3. Create or replace the updated_at trigger function
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. Bind update_updated_at_column trigger to all tables
--    with an updated_at column
-- ============================================================

DROP TRIGGER IF EXISTS trg_updated_at ON users;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON products;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON orders;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON order_items;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON transactions;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON entitlements;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON entitlements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON audit_logs;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON payment_events;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON payment_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON product_stock_items;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON product_stock_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON site_settings;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON product_categories;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_updated_at ON product_types;
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON product_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 5. Add DEFAULT now() to created_at columns that lack it
-- ============================================================

ALTER TABLE users              ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE products           ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE orders             ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE order_items        ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE transactions       ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE entitlements       ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE audit_logs         ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE payment_events     ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE product_categories ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE product_types      ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE site_settings      ALTER COLUMN created_at SET DEFAULT now();

-- ============================================================
-- 6. Add DEFAULT now() to updated_at columns that lack it
-- ============================================================

ALTER TABLE users              ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE products           ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE orders             ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE order_items        ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE transactions       ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE entitlements       ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE audit_logs         ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE payment_events     ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE product_stock_items ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE site_settings      ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE product_categories ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE product_types      ALTER COLUMN updated_at SET DEFAULT now();

COMMIT;
