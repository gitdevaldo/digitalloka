# DigitalOcean Panel - Product Requirements Document

## Overview

A customer-facing dashboard for VPS resellers to provide their buyers with self-service droplet management. Users authenticate via Magic OTP (email link) and can manage only the droplets assigned to them.

**Key Principle:** 
- Single shared DigitalOcean API token (stored in environment variable)
- Internal scoping via database — users can ONLY access droplets in their `droplet_ids` array
- No admin panel needed — all admin operations done directly in Supabase

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **UI:** Tailwind CSS + shadcn/ui (dark theme based on reference)
- **Auth:** Supabase Auth (Magic Link OTP)
- **Database:** Supabase PostgreSQL
- **API:** DigitalOcean API v2

---

## Database Schema

### Single Table: `users`

Simple table — admin manages everything via Supabase directly:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  droplet_ids BIGINT[] NOT NULL DEFAULT '{}', -- Array of allowed droplet IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only read their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Index for faster lookups
CREATE INDEX idx_users_email ON users(email);
```

**Environment Variables:**
```env
DIGITALOCEAN_TOKEN=dop_v1_xxxxx  # Single shared token (server-side only)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Admin Workflow:**
1. User signs up or admin creates account in Supabase Auth
2. Admin inserts/updates row in `users` table with their `droplet_ids`
3. User can now log in and manage ONLY their assigned droplets

**Security Model:**
- DO token stored as env var, never in database
- API routes check `droplet_ids` array before ANY operation
- User cannot access droplets not in their list

---

## Pages & Routes

### Auth Routes (`/`)

| Route | Description |
|-------|-------------|
| `/` | Landing/Login page with Magic OTP form |
| `/auth/callback` | Supabase auth callback handler |

### Dashboard Routes (`/dashboard`)

| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard - list all assigned droplets |
| `/dashboard/droplets/[id]` | Single droplet detail & actions |

---

## UI Design (Based on Reference)

### Design System (Dark Theme)

**Colors:**
```css
--bg0: #0a0b0e;        /* Page background */
--bg1: #111318;        /* Cards, sidebar */
--bg2: #191c24;        /* Hover states, inputs */
--bg3: #222631;        /* Borders, dividers */
--accent: #00d4ff;     /* Primary accent (cyan) */
--green: #00e676;      /* Online/Success */
--red: #ff4444;        /* Offline/Error */
--orange: #ff9800;     /* Warning/In-progress */
--yellow: #ffd600;     /* Disk usage */
--purple: #a78bfa;     /* Memory usage */
--text0: #f0f4ff;      /* Primary text */
--text1: #9ba3ba;      /* Secondary text */
--text2: #5a6179;      /* Muted text */
```

**Typography:**
- Primary: Syne (headings, UI)
- Mono: IBM Plex Mono (values, IPs, IDs)

**Components (from reference):**
- Top bar with logo, status pill, action buttons
- Sidebar navigation (Overview, Actions, Network, Logs)
- Server header card with droplet info
- Stats grid (CPU, RAM, Disk, Uptime) — *display only, from DO API if available*
- Action cards with icons and descriptions
- Action log with status dots
- Modal dialogs for confirmations
- Toast notifications for feedback

---

## Features

### 1. Authentication (Magic OTP)

- Email-based passwordless authentication
- User enters email → receives magic link → clicks to login
- Session persisted via Supabase Auth cookies
- Redirect to `/dashboard` after successful auth

**Flow:**
```
1. User enters email on login page
2. Supabase sends magic link to email
3. User clicks link → redirected to /auth/callback
4. Callback exchanges code for session
5. Redirect to /dashboard
```

### 2. Dashboard - Droplet List

Display all droplets assigned to the user (filtered by `droplet_ids`).

**Data shown per droplet:**
- Name
- Status (active, off, new, archive) with colored indicator
- IP Address (public IPv4)
- Region
- Size (vCPUs, Memory, Disk)
- OS/Image

**Visual indicators:**
- Green dot + "ONLINE" = active/running
- Red dot + "OFFLINE" = off
- Orange dot + "BUSY" = in-progress action

### 3. Droplet Detail Page (Single Droplet View)

Based on reference design with tabs:

**Overview Tab:**
- Server header card (name, ID, region, plan, image, IP)
- Stats grid (if metrics available from DO API)
- Recent actions log
- Network info (IPv4, IPv6, private IP)

**Actions Tab:**

| Category | Action | DO API Type | Description |
|----------|--------|-------------|-------------|
| Power & State | Reboot | `reboot` | Graceful OS restart |
| Power & State | Power Cycle | `power_cycle` | Hard reset |
| Power & State | Shutdown | `shutdown` | Graceful ACPI shutdown |
| Power & State | Power On | `power_on` | Boot stopped droplet |
| Power & State | Power Off | `power_off` | Hard power off |

**Network Tab:**
- IP configuration display (IPv4, IPv6, VPC, Gateway)
- Bandwidth stats (if available)

**Action Log Tab:**
- Full action history for this droplet

### 4. Action Confirmations

Modal dialog for each action with:
- Warning message (info/danger based on action type)
- Droplet name and ID
- Cancel and Confirm buttons

**Danger actions (red warning):**
- Power Off, Power Cycle, Shutdown

**Safe actions (blue info):**
- Reboot, Power On

### 5. Real-time Feedback

- Toast notifications for action status
- Loading states on buttons during action
- Poll for action completion (every 5s when action in progress)
- Auto-refresh droplet status after action completes

---

## DigitalOcean API Integration

### Authentication

Single shared token stored as environment variable:
```typescript
const DO_TOKEN = process.env.DIGITALOCEAN_TOKEN;
const headers = {
  'Authorization': `Bearer ${DO_TOKEN}`,
  'Content-Type': 'application/json'
};
```

### Required Endpoints

#### Get Single Droplet
```
GET /v2/droplets/{droplet_id}
```

Response contains:
- `id`, `name`, `status` (active, off, new, archive)
- `networks.v4[].ip_address` (public IP where type="public")
- `networks.v6[].ip_address` (IPv6 if enabled)
- `region.name`, `region.slug`
- `size.vcpus`, `size.memory`, `size.disk`, `size.slug`
- `image.name`, `image.distribution`
- `created_at`

#### Initiate Droplet Action
```
POST /v2/droplets/{droplet_id}/actions
Content-Type: application/json

{
  "type": "power_on" | "power_off" | "reboot" | "power_cycle" | "shutdown"
}
```

Response contains action object with:
- `id` (action ID)
- `status`: "in-progress" | "completed" | "errored"
- `type`: action type
- `started_at`, `completed_at`

#### Get Action Status
```
GET /v2/droplets/{droplet_id}/actions/{action_id}
```

Used to poll for action completion.

#### List Actions for Droplet
```
GET /v2/droplets/{droplet_id}/actions?per_page=20
```

Returns recent action history.

### Required Token Scopes

The shared DO token must have:
- `droplet:read` — View droplet details
- `droplet:update` — Perform actions (power on/off, reboot, etc.)

**NOT needed:**
- `droplet:create` — Users cannot create droplets
- `droplet:delete` — Users cannot destroy droplets

### Rate Limiting

- DO API: 5,000 requests/hour, 250 requests/minute
- Cache droplet data for 30 seconds minimum
- Batch requests where possible

---

## Security Considerations

### Internal Scoping (Critical)

Since all users share one DO token, access control is enforced at the API route level:

```typescript
// lib/auth.ts
async function validateDropletAccess(userId: string, dropletId: number): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('droplet_ids')
    .eq('id', userId)
    .single();
  
  return user?.droplet_ids?.includes(dropletId) ?? false;
}

// In API route
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();
  
  const dropletId = parseInt(params.id);
  const hasAccess = await validateDropletAccess(session.user.id, dropletId);
  if (!hasAccess) return forbidden();
  
  // Proceed with DO API call...
}
```

**Every API route MUST:**
1. Verify user is authenticated
2. Check droplet ID is in user's `droplet_ids` array
3. Only then make the DO API call

### Token Security
- DO token stored ONLY in `DIGITALOCEAN_TOKEN` env var
- Never sent to client, never stored in database
- All DO API calls happen server-side only

### RLS (Row Level Security)
- Users can only read their own row from `users` table
- Admin manages users directly in Supabase

---

## UI/UX Guidelines

### Design Principles (Based on Reference)
- Dark theme with cyan accent
- Clean, minimal interface
- Mobile-responsive
- Clear action feedback with toast notifications
- Modal confirmation for destructive actions

### Color Scheme (from reference)
```css
--bg0: #0a0b0e;        /* Page background */
--bg1: #111318;        /* Cards, sidebar */
--accent: #00d4ff;     /* Primary accent */
--green: #00e676;      /* Online/Success */
--red: #ff4444;        /* Offline/Error/Danger */
--orange: #ff9800;     /* Warning/In-progress */
```

### Components Needed
- `LoginForm` — Email input + submit for magic link
- `TopBar` — Logo, status pill, action buttons
- `Sidebar` — Navigation (Overview, Actions, Network, Logs)
- `ServerHeader` — Droplet info card with quick actions
- `StatsGrid` — CPU, RAM, Disk, Uptime cards
- `ActionCard` — Action button with icon and description
- `ActionLog` — List of recent actions with status dots
- `Modal` — Confirmation dialogs
- `Toast` — Notification feedback

---

## API Routes (Next.js)

### `GET /api/droplets`
Returns all droplets for authenticated user (fetches each droplet in `droplet_ids`).

### `GET /api/droplets/[id]`
Returns single droplet detail (validates ownership first).

### `POST /api/droplets/[id]/actions`
Initiates droplet action (validates ownership first).

Body: `{ "type": "power_on" | "power_off" | "reboot" | "power_cycle" | "shutdown" }`

### `GET /api/droplets/[id]/actions`
Returns action history for droplet (validates ownership first).

### `GET /api/droplets/[id]/actions/[actionId]`
Gets status of specific action (validates ownership first).

---

## Error Handling

### User-Facing Errors
- "Invalid email address" — Validation error
- "Droplet not found" — 404 or not in allowed list
- "Access denied" — Droplet not in user's `droplet_ids`
- "Action failed" — DO API returned error
- "Rate limit exceeded" — Too many requests

### Technical Errors
- Log all errors server-side
- Return generic messages to client
- Never expose DO token or internal details

---

## Implementation Phases

### Phase 1: Foundation
1. Project setup (Next.js 14, Supabase, Tailwind, shadcn/ui)
2. Database schema & RLS policies
3. Supabase Auth with Magic Link
4. Basic layout (dark theme from reference)

### Phase 2: Core Features
5. Login page with Magic OTP
6. Dashboard with droplet list (fetches assigned droplets)
7. Droplet detail page with tabs
8. Power actions (on/off, reboot, shutdown, power cycle)

### Phase 3: Polish
9. Action confirmations (modals)
10. Toast notifications
11. Action status polling
12. Action history log
13. Mobile responsiveness

---

## Out of Scope (V1)

- Admin dashboard (use Supabase directly)
- Droplet creation/deletion
- Resize functionality
- Snapshot/backup management
- Rebuild/restore actions
- Console access
- Billing information
- Multiple droplet tokens (single shared token)
- Password reset action
- Rename droplet action
- Floating IP management
