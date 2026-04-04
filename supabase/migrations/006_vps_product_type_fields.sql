UPDATE product_types
SET fields = '[]'::jsonb
WHERE type_key = 'vps_droplet';
