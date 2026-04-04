UPDATE product_types
SET fields = '[
  {"key": "server_provider", "type": "select", "label": "Server Provider", "options": ["DigitalOcean", "AWS", "Google Cloud", "Azure", "Alibaba", "Vultr"], "required": true},
  {"key": "region_country", "type": "select", "label": "Region", "options": ["Singapore", "Indonesia", "United States", "United Kingdom", "India", "Germany", "Netherlands", "Canada", "Australia", "Japan"], "required": true},
  {"key": "datacenter", "type": "text", "label": "Datacenter Code", "help": "e.g. SGP1, NYC1, ap-southeast-1", "required": true},
  {"key": "operating_system", "type": "select", "label": "Operating System", "options": ["Ubuntu 22 LTS", "Ubuntu 24 LTS", "Fedora 42 x64", "Fedora 43 x64", "Debian 12 x64", "Debian 13 x64", "CentOS 9 x64", "CentOS 10 x64", "AlmaLinux 8", "AlmaLinux 9", "AlmaLinux 10", "RockyLinux 8 x64", "RockyLinux 9 x64", "RockyLinux 10 x64"], "required": true}
]'::jsonb
WHERE type_key = 'vps_droplet';
