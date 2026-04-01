import { NextResponse } from 'next/server';
import { getSession, validateDropletAccess } from '@/lib/auth';
import { digitalOceanApi, RateLimitError, DigitalOceanAPIError, ActionType } from '@/lib/digitalocean';
import { isSameOrigin } from '@/lib/security';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const actionSchema = z.object({
  type: z.enum(['power_on', 'power_off', 'shutdown', 'reboot', 'power_cycle']),
});

// POST /api/droplets/[id]/actions - Perform action on droplet
export async function POST(request: Request, { params }: RouteParams) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json(
        { error: 'Request origin is not allowed' },
        { status: 403 }
      );
    }

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

    // Validate request body
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid action type', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const action = await digitalOceanApi.performAction(
      dropletId,
      parsed.data.type as ActionType,
      session.user.id
    );

    return NextResponse.json({ action }, { status: 201 });
  } catch (error) {
    console.error('Error performing action:', error);

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

// GET /api/droplets/[id]/actions - List actions for droplet
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

    const actions = await digitalOceanApi.listActions(dropletId, session.user.id);
    return NextResponse.json({ actions });
  } catch (error) {
    console.error('Error fetching actions:', error);

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
