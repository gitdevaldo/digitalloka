import { NextResponse } from 'next/server';
import { getSession, validateDropletAccess } from '@/lib/auth';
import { digitalOceanApi, RateLimitError, DigitalOceanAPIError } from '@/lib/digitalocean';
import { createSupabaseServer } from '@/lib/supabase/server';

// GET /api/droplets - List all droplets for authenticated user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServer();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('droplet_ids')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.droplet_ids || user.droplet_ids.length === 0) {
      return NextResponse.json({ droplets: [] });
    }

    const droplets = await digitalOceanApi.getDroplets(
      user.droplet_ids,
      session.user.id
    );

    return NextResponse.json({ droplets });
  } catch (error) {
    console.error('Error fetching droplets:', error);

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetAt: error.resetAt },
        { status: 429 }
      );
    }

    if (error instanceof DigitalOceanAPIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
