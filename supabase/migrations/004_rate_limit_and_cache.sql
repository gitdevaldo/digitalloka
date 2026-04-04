CREATE TABLE IF NOT EXISTS rate_limit_entries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limit_key_created ON rate_limit_entries (key, created_at DESC);

CREATE TABLE IF NOT EXISTS cache_entries (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE INDEX idx_cache_entries_expires ON cache_entries (expires_at);

ALTER TABLE rate_limit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on rate_limit_entries"
  ON rate_limit_entries FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on cache_entries"
  ON cache_entries FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION check_rate_limit_atomic(
  p_key text,
  p_window_ms bigint,
  p_max_requests int
)
RETURNS TABLE(allowed boolean, current_count int, oldest_ts timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cutoff timestamptz;
  v_count int;
  v_oldest timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_key));

  v_cutoff := now() - (p_window_ms || ' milliseconds')::interval;

  DELETE FROM rate_limit_entries
  WHERE key = p_key AND created_at < v_cutoff;

  SELECT count(*)::int, min(created_at)
  INTO v_count, v_oldest
  FROM rate_limit_entries
  WHERE key = p_key AND created_at >= v_cutoff;

  IF v_count < p_max_requests THEN
    INSERT INTO rate_limit_entries (key) VALUES (p_key);
    allowed := true;
    current_count := v_count + 1;
    oldest_ts := COALESCE(v_oldest, now());
  ELSE
    allowed := false;
    current_count := v_count;
    oldest_ts := v_oldest;
  END IF;

  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION check_rate_limit_atomic(text, bigint, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION check_rate_limit_atomic(text, bigint, int) FROM anon;
REVOKE EXECUTE ON FUNCTION check_rate_limit_atomic(text, bigint, int) FROM authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit_atomic(text, bigint, int) TO service_role;

CREATE OR REPLACE FUNCTION cleanup_rate_limit_entries()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM rate_limit_entries WHERE created_at < now() - interval '5 minutes';
$$;

REVOKE EXECUTE ON FUNCTION cleanup_rate_limit_entries() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION cleanup_rate_limit_entries() FROM anon;
REVOKE EXECUTE ON FUNCTION cleanup_rate_limit_entries() FROM authenticated;
GRANT EXECUTE ON FUNCTION cleanup_rate_limit_entries() TO service_role;

CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM cache_entries WHERE expires_at < now();
$$;

REVOKE EXECUTE ON FUNCTION cleanup_expired_cache() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION cleanup_expired_cache() FROM anon;
REVOKE EXECUTE ON FUNCTION cleanup_expired_cache() FROM authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_cache() TO service_role;
