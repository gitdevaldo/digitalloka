UPDATE product_types 
SET fields = '[{"key":"provider","label":"VPS Provider","type":"select","required":true,"options":["DigitalOcean","AWS","Google Cloud","Azure","Linode","Vultr","Hetzner","Other"]}]'::jsonb 
WHERE type_key = 'vps_droplet';
