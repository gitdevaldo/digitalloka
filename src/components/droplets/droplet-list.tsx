'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Droplet } from '@/lib/digitalocean';
import { StatusBadge } from './status-badge';

export function DropletList() {
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDroplets();
  }, []);

  const fetchDroplets = async () => {
    try {
      const res = await fetch('/api/droplets');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch droplets');
      }

      setDroplets(data.droplets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border-2 border-border rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-muted rounded-lg w-1/2 mb-4" />
            <div className="h-4 bg-muted rounded-lg w-3/4 mb-3" />
            <div className="h-4 bg-muted rounded-lg w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary/10 border-2 border-secondary rounded-xl p-8 text-center shadow-pop-secondary">
        <div className="w-12 h-12 mx-auto mb-4 bg-secondary rounded-full border-2 border-foreground flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-foreground font-bold mb-4">{error}</p>
        <button
          onClick={fetchDroplets}
          className="px-6 py-2 bg-card border-2 border-foreground rounded-full font-bold shadow-pop hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-pop-hover transition-all duration-300 ease-bounce"
        >
          Try again
        </button>
      </div>
    );
  }

  if (droplets.length === 0) {
    return (
      <div className="bg-card border-2 border-foreground rounded-xl p-12 text-center shadow-pop-soft relative overflow-hidden">
        <div className="absolute top-4 right-4 w-8 h-8 bg-tertiary rounded-full border-2 border-foreground"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 bg-secondary rotate-45 border-2 border-foreground"></div>
        
        <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-full border-2 border-foreground flex items-center justify-center shadow-pop">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="8" rx="2"/>
            <rect x="2" y="14" width="20" height="8" rx="2"/>
          </svg>
        </div>
        <h3 className="text-xl font-bold font-heading mb-2">No droplets assigned</h3>
        <p className="text-muted-foreground">Contact your administrator to get access to droplets.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {droplets.map((droplet, index) => {
        const colors = ['shadow-pop-accent', 'shadow-pop-secondary', 'shadow-pop-tertiary'];
        const shadowColor = colors[index % colors.length];
        
        return (
          <Link
            key={droplet.id}
            href={`/dashboard/droplets/${droplet.id}`}
            className={`group bg-card border-2 border-foreground rounded-xl p-6 ${shadowColor} hover:-translate-x-[2px] hover:-translate-y-[2px] hover:rotate-[-1deg] transition-all duration-300 ease-bounce`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent rounded-full border-2 border-foreground flex items-center justify-center text-white group-hover:animate-wiggle">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="8" rx="2"/>
                    <rect x="2" y="14" width="20" height="8" rx="2"/>
                    <circle cx="19" cy="6" r="1" fill="currentColor"/>
                    <circle cx="19" cy="18" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold font-heading group-hover:text-accent transition-colors">{droplet.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium">#{droplet.id}</p>
                </div>
              </div>
              <StatusBadge status={droplet.status} />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b-2 border-dashed border-border">
                <span className="text-muted-foreground font-medium">IP Address</span>
                <span className="font-bold text-accent">
                  {droplet.networks.v4.find((n) => n.type === 'public')?.ip_address || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b-2 border-dashed border-border">
                <span className="text-muted-foreground font-medium">Region</span>
                <span className="font-bold">{droplet.region.name}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground font-medium">Size</span>
                <span className="font-bold">{droplet.size_slug}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
