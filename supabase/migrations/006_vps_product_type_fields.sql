UPDATE product_types
SET fields = '[
  {"key": "do_size_slug", "label": "Default DO Size Slug", "type": "text", "required": false},
  {"key": "do_region", "label": "Default DO Region", "type": "text", "required": false},
  {"key": "do_image", "label": "Default DO Image", "type": "text", "required": false}
]'::jsonb
WHERE type_key = 'vps_droplet';
