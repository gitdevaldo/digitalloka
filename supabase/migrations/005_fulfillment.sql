BEGIN;

ALTER TABLE product_stock_items
  ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE product_stock_items
  DROP CONSTRAINT IF EXISTS product_stock_items_status_check;

ALTER TABLE product_stock_items
  ADD CONSTRAINT product_stock_items_status_check
  CHECK (status IN ('unsold', 'sold', 'disabled'));

CREATE OR REPLACE FUNCTION assign_stock_item_atomic(
  p_product_id BIGINT,
  p_order_item_id BIGINT,
  p_user_id UUID,
  p_stock_item_id BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stock RECORD;
  v_result JSONB;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('stock_assign_' || p_product_id::text));

  IF p_stock_item_id IS NOT NULL THEN
    SELECT * INTO v_stock
    FROM product_stock_items
    WHERE id = p_stock_item_id
      AND product_id = p_product_id
      AND (status = 'unsold' OR (status = 'sold' AND is_unlimited = TRUE))
    FOR UPDATE;
  ELSE
    SELECT * INTO v_stock
    FROM product_stock_items
    WHERE product_id = p_product_id
      AND (status = 'unsold' OR (status = 'sold' AND is_unlimited = TRUE))
    ORDER BY
      CASE WHEN is_unlimited THEN 1 ELSE 0 END,
      created_at ASC
    LIMIT 1
    FOR UPDATE;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_stock_available');
  END IF;

  IF v_stock.is_unlimited THEN
    v_result := jsonb_build_object(
      'success', true,
      'stock_item_id', v_stock.id,
      'credential_data', v_stock.credential_data,
      'is_unlimited', true
    );
  ELSE
    UPDATE product_stock_items
    SET status = 'sold',
        sold_order_item_id = p_order_item_id,
        sold_user_id = p_user_id,
        sold_at = now()
    WHERE id = v_stock.id;

    v_result := jsonb_build_object(
      'success', true,
      'stock_item_id', v_stock.id,
      'credential_data', v_stock.credential_data,
      'is_unlimited', false
    );
  END IF;

  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION assign_stock_item_atomic(BIGINT, BIGINT, UUID, BIGINT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION assign_stock_item_atomic(BIGINT, BIGINT, UUID, BIGINT) FROM anon;
REVOKE EXECUTE ON FUNCTION assign_stock_item_atomic(BIGINT, BIGINT, UUID, BIGINT) FROM authenticated;
GRANT EXECUTE ON FUNCTION assign_stock_item_atomic(BIGINT, BIGINT, UUID, BIGINT) TO service_role;

COMMIT;
