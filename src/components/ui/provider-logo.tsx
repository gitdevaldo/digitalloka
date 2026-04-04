'use client';

import { useState } from 'react';

const PROVIDER_DOMAINS: Record<string, string> = {
  'DigitalOcean': 'digitalocean.com',
  'digitalocean': 'digitalocean.com',
  'AWS': 'aws.amazon.com',
  'aws': 'aws.amazon.com',
  'Amazon Web Services': 'aws.amazon.com',
  'Google Cloud': 'cloud.google.com',
  'GCP': 'cloud.google.com',
  'Azure': 'azure.microsoft.com',
  'Microsoft Azure': 'azure.microsoft.com',
  'Vultr': 'vultr.com',
  'vultr': 'vultr.com',
  'Hetzner': 'hetzner.com',
  'hetzner': 'hetzner.com',
  'Linode': 'linode.com',
  'linode': 'linode.com',
  'OVH': 'ovhcloud.com',
  'OVHcloud': 'ovhcloud.com',
  'UpCloud': 'upcloud.com',
  'Contabo': 'contabo.com',
  'Kamatera': 'kamatera.com',
};

function getProviderDomain(provider: string): string | null {
  if (PROVIDER_DOMAINS[provider]) return PROVIDER_DOMAINS[provider];
  const lower = provider.toLowerCase();
  for (const [key, domain] of Object.entries(PROVIDER_DOMAINS)) {
    if (key.toLowerCase() === lower) return domain;
  }
  const guess = provider.toLowerCase().replace(/\s+/g, '') + '.com';
  return guess;
}

function getLogoUrl(provider: string): string | null {
  const domain = getProviderDomain(provider);
  if (!domain) return null;
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  if (!token) return null;
  return `https://img.logo.dev/${domain}?token=${token}&size=64&format=png`;
}

export function ProviderLogo({ provider, size = 24 }: { provider: string; size?: number }) {
  const [error, setError] = useState(false);
  const logoUrl = getLogoUrl(provider);

  if (!logoUrl || error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '6px',
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.45,
          fontWeight: 800,
          color: 'var(--muted-foreground)',
          flexShrink: 0,
        }}
      >
        {provider.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${provider} logo`}
      width={size}
      height={size}
      onError={() => setError(true)}
      style={{
        borderRadius: '6px',
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  );
}
