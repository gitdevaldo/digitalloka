import pg from 'pg';
import { readFileSync } from 'fs';
const envContent = readFileSync('.env.local', 'utf-8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
const client = new pg.Client({ connectionString: dbUrlMatch[1].trim(), ssl: { rejectUnauthorized: false } });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS vps_provider_data (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    available BOOLEAN NOT NULL DEFAULT true,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, resource_type, slug)
  );
`);
console.log('vps_provider_data table created');

await client.query(`CREATE INDEX IF NOT EXISTS idx_vpd_provider_type ON vps_provider_data(provider, resource_type);`);
await client.query(`CREATE INDEX IF NOT EXISTS idx_vpd_available ON vps_provider_data(available);`);
console.log('Indexes created');

await client.query(`ALTER TABLE vps_provider_data ENABLE ROW LEVEL SECURITY;`);
try {
  await client.query(`CREATE POLICY "Public can read provider data" ON vps_provider_data FOR SELECT USING (true);`);
  console.log('RLS public read policy added');
} catch (e) {
  if (e.message.includes('already exists')) console.log('Policy already exists');
  else console.log('Policy error:', e.message);
}

await client.end();
console.log('Done');
