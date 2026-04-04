import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_KEY in .env.local');
  process.exit(1);
}

const VPS_STOCK_FIELDS = [
  {
    key: 'provider',
    label: 'VPS Provider',
    type: 'select',
    required: true,
    scope: 'stock',
    options: ['DigitalOcean', 'AWS', 'Google Cloud', 'Azure', 'Linode', 'Vultr', 'Hetzner', 'Other'],
    help_text: 'Cloud provider for this VPS size',
  },
  {
    key: 'slug',
    label: 'Size Slug',
    type: 'text',
    required: true,
    scope: 'stock',
    help_text: 'e.g. s-1vcpu-1gb, t3.micro, cx11',
  },
  {
    key: 'vcpus',
    label: 'vCPUs',
    type: 'number',
    required: true,
    scope: 'stock',
  },
  {
    key: 'memory',
    label: 'Memory (MB)',
    type: 'number',
    required: true,
    scope: 'stock',
  },
  {
    key: 'disk',
    label: 'Disk (GB)',
    type: 'number',
    required: true,
    scope: 'stock',
  },
  {
    key: 'transfer',
    label: 'Transfer (TB)',
    type: 'number',
    required: false,
    scope: 'stock',
  },
  {
    key: 'region',
    label: 'Region / Datacenter',
    type: 'select',
    required: false,
    scope: 'stock',
    options: [],
    options_source: 'provider_data',
    provider_data_type: 'region',
    depends_on: 'provider',
    help_text: 'Datacenter location. Options load from synced provider data, or add manually in product type settings.',
  },
  {
    key: 'os',
    label: 'Operating System',
    type: 'select',
    required: false,
    scope: 'stock',
    options: [],
    options_source: 'provider_data',
    provider_data_type: 'image',
    depends_on: 'provider',
    help_text: 'OS image. Options load from synced provider data, or add manually in product type settings.',
  },
];

async function main() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/product_types?type_key=eq.vps_droplet&select=id,fields`,
    {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    }
  );
  const rows = await res.json();
  if (!rows.length) {
    console.error('vps_droplet product type not found');
    process.exit(1);
  }

  const existing = rows[0];
  const existingFields = existing.fields || [];
  const productFields = existingFields.filter(f => f.scope === 'product' || !f.scope);
  const existingStockKeys = new Set(existingFields.filter(f => f.scope === 'stock').map(f => f.key));

  let stockFields;
  if (existingStockKeys.size === 0) {
    stockFields = VPS_STOCK_FIELDS;
    console.log('No existing stock fields. Adding all VPS stock fields.');
  } else {
    const existingStock = existingFields.filter(f => f.scope === 'stock');
    const newFields = VPS_STOCK_FIELDS.filter(f => !existingStockKeys.has(f.key));
    stockFields = [...existingStock, ...newFields];
    console.log(`Found ${existingStockKeys.size} existing stock fields. Adding ${newFields.length} new fields.`);
  }

  const merged = [...productFields, ...stockFields];

  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/product_types?type_key=eq.vps_droplet`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ fields: merged }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.text();
    console.error('Failed to update:', err);
    process.exit(1);
  }

  const result = await updateRes.json();
  console.log('Updated vps_droplet fields successfully!');
  console.log(`Total fields: ${merged.length} (${productFields.length} product, ${stockFields.length} stock)`);
  console.log('Stock fields:', stockFields.map(f => f.key).join(', '));
}

main().catch(e => { console.error(e); process.exit(1); });
