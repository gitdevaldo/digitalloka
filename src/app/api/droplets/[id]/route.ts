import { NextResponse } from 'next/server';
import { getSession, validateDropletAccess } from '@/lib/auth';
import { digitalOceanApi, RateLimitError, DigitalOceanAPIError } from '@/lib/digitalocean';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/droplets/[id] - Get single droplet
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const dropletId = parseInt(id, 10);
    
    if (isNaN(dropletId)) {
      return NextResponse.json(
        { error: 'Invalid droplet ID' },
        { status: 400 }
      );
    }

    // CRITICAL: Validate ownership
    const hasAccess = await validateDropletAccess(session.user.id, dropletId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const droplet = await digitalOceanApi.getDroplet(dropletId, session.user.id);
    return NextResponse.json({ droplet });
  } catch (error) {
    console.error('Error fetching droplet:', error);

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetAt: error.resetAt },
        { status: 429 }
      );
    }

    if (error instanceof DigitalOceanAPIError) {
      if (error.statusCode === 404) {
        return NextResponse.json(
          { error: 'Droplet not found' },
          { status: 404 }
        );
      }
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
