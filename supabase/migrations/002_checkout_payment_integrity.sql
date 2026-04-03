ALTER TABLE orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_idempotency_key
  ON transactions (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_idempotency_key
  ON payment_events (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE OR REPLACE FUNCTION create_checkout_order_atomic(
  p_user_id UUID,
  p_order_number TEXT,
  p_currency TEXT,
  p_subtotal NUMERIC,
  p_total NUMERIC,
  p_meta JSONB,
  p_items JSONB,
  p_provider TEXT DEFAULT 'manual'
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id BIGINT;
  v_item JSONB;
BEGIN
  INSERT INTO orders (user_id, order_number, status, payment_status, subtotal_amount, total_amount, currency, meta)
  VALUES (p_user_id, p_order_number, 'pending', 'pending', p_subtotal, p_total, p_currency, p_meta)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_id, item_name, quantity, unit_price, line_total, meta)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::BIGINT,
      v_item->>'item_name',
      (v_item->>'quantity')::INT,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'line_total')::NUMERIC,
      COALESCE(v_item->'meta', '{}'::JSONB)
    );
  END LOOP;

  INSERT INTO transactions (order_id, provider, status, amount, currency)
  VALUES (v_order_id, p_provider, 'pending', p_total, p_currency);

  RETURN v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_entitlements_for_order(
  p_order_id BIGINT,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
  v_existing_count INT;
BEGIN
  FOR v_item IN SELECT id, product_id FROM order_items WHERE order_id = p_order_id
  LOOP
    SELECT COUNT(*) INTO v_existing_count
    FROM entitlements
    WHERE order_item_id = v_item.id AND user_id = p_user_id;

    IF v_existing_count = 0 THEN
      INSERT INTO entitlements (user_id, product_id, order_item_id, status, starts_at, meta)
      VALUES (p_user_id, v_item.product_id, v_item.id, 'active', now(), jsonb_build_object('source_order_id', p_order_id));
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION process_payment_atomic(
  p_order_id BIGINT,
  p_user_id UUID,
  p_provider TEXT,
  p_provider_ref TEXT,
  p_idempotency_key TEXT,
  p_amount NUMERIC,
  p_currency TEXT,
  p_payload JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO transactions (order_id, provider, provider_ref, idempotency_key, status, amount, currency, paid_at, verified_at, payload)
  VALUES (p_order_id, p_provider, p_provider_ref, p_idempotency_key, 'paid', p_amount, p_currency, now(), now(), p_payload)
  ON CONFLICT (idempotency_key) WHERE idempotency_key IS NOT NULL DO UPDATE SET
    status = 'paid',
    paid_at = now(),
    verified_at = now(),
    payload = EXCLUDED.payload;

  UPDATE orders SET status = 'paid', payment_status = 'paid' WHERE id = p_order_id;

  PERFORM create_entitlements_for_order(p_order_id, p_user_id);

  UPDATE payment_events
  SET status = 'processed', processed_at = now()
  WHERE idempotency_key = p_idempotency_key;
END;
$$;
