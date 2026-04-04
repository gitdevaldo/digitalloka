# DigitalLoka - DigitalOcean Panel & Digital Product Marketplace

## Overview
DigitalLoka is a Next.js application built with a Neo-Brutalist UI. It serves as both a DigitalOcean droplet management panel and a digital product marketplace. Key functionalities include comprehensive user dashboards, an administrative panel for product and user management, a full-fledged commerce system with secure checkout, and post-payment fulfillment automation. The project aims to provide a robust platform for selling and managing digital products and VPS services.

## User Preferences
- **CRITICAL: Git & Replit Rules — READ THIS BEFORE ANY GIT OPERATION**
  - **Replit only has a SHALLOW copy of the git history.** It does NOT have the full commit history from GitHub. The local repo may only have the most recent commits (e.g. 14 out of 188).
  - **NEVER run `git filter-branch`, `git rebase`, or any history-rewriting command on Replit.** The local repo only has recent commits, so rewriting + force-pushing will DESTROY the full history on GitHub. This already happened once and nearly wiped 188 commits.
  - **NEVER run `git push --force` from Replit.** Force-push from a shallow repo replaces the full GitHub history with only the shallow local commits. This is catastrophic and irreversible without GitHub reflog recovery.
  - **NEVER suggest or run `git rebase -i` to drop commits on Replit.** Dropping commits via interactive rebase also removes the file changes from the working directory, destroying code that was in those commits. This already happened and wiped all Mayar integration files from disk.
  - **To remove secrets from git history:** The user MUST do this from a full local clone on their own machine. Never attempt it from Replit. Tell the user to clone, clean, and force-push from their machine.
  - **To push new commits from Replit:** Use ONLY regular `git push`. If it fails with "non-fast-forward", use `git pull origin main --rebase` first, then `git push`. Never force-push.
  - **Checkpoints are precious.** Replit checkpoints capture all file changes. Do not run any git command that could cause checkpoint data to be lost. If unsure whether a command is safe, DO NOT RUN IT.

## System Architecture
The application is built with Next.js 14 (App Router) using TypeScript and styled with Tailwind CSS 3.4, adhering to a Neo-Brutalist design system. Supabase handles database operations and magic link authentication.

**Key Features:**
- **Catalog/Marketplace:** Public browsing with search, sort, and filter functionality.
- **Magic Link Authentication:** Passwordless login for users and administrators using a PKCE flow.
- **User Dashboard:** Provides an overview of stats, DigitalOcean droplet management (power actions), product entitlements, order history, and account settings.
- **Admin Panel:** Comprehensive CRUD operations for products, product types (with schema builder), stock items, users (with role/block management), orders (fulfillment), entitlements, DigitalOcean droplets, and site settings. Includes an audit log with CSV export.
- **Commerce System:** Features an atomic checkout flow, idempotent payment webhook processing, collision-resistant order numbers, and shared entitlement provisioning logic.
- **Route Protection:** Middleware secures dashboard, admin, and API routes, with admin role checks implemented at the middleware level.
- **Rate Limiting:** A sliding window rate limiter protects authentication, webhooks, and checkout endpoints, supporting in-memory or Supabase-backed storage.
- **Post-Payment Fulfillment:** Automates provisioning for VPS droplets (via DigitalOcean API) and digital products (assigning stock items).
- **VPS Size Synchronization:** Admin functionality to sync DigitalOcean sizes as stock items.
- **Email Notifications:** Neo-Brutalist styled HTML email confirmations are sent after fulfillment, queued asynchronously.

**UI/UX Design:**
The Neo-Brutalist design system is characterized by:
- Warm cream background (`#FFFDF5`) with a dot grid pattern.
- Prominent `border-2 border-foreground` for all elements.
- `shadow-pop` (4px 4px 0) for depth, with hover states pushing shadows further.
- Rounded corners: `rounded-[32px]` for catalog cards, `rounded-[var(--radius-xl)]` (32px) for dashboard cards, and `rounded-[14px]` to `rounded-[var(--r-xl)]` (20px) for admin panels.
- Distinct color palette: Purple (accent), Pink (secondary), Amber (tertiary), Green (quaternary).
- A shared `Topbar` component across all sections and a `FloatingBar` component for context-sensitive actions, adapting for mobile views.
- Dedicated pages for Wishlist, Cart, and a 3-step checkout wizard.

**Technical Implementations:**
- **Database:** Supabase PostgreSQL is used, with all application tables residing in the `public` schema. JSON columns are `JSONB`. `created_at` and `updated_at` fields are automatically managed with triggers. Critical RLS policies and performance indexes are applied for security and efficiency.
- **API Endpoints:** Structured API routes for authentication, public catalog, DigitalOcean droplet management, user-scoped operations, admin CRUD, and payment webhooks.
- **Pagination:** Cursor-based pagination (`created_at` + `id`) is implemented for large datasets, with support for offset-based pagination as a fallback.

## External Dependencies
- **Supabase:** Used for PostgreSQL database, authentication (magic link), and real-time capabilities.
- **DigitalOcean API v2:** Integrates for droplet management functionalities.
- **Mayar (Sandbox):** Indonesian payment gateway for processing payments, utilizing `createInvoice()` and `createPayment()` APIs, and handling webhooks for payment status updates.
- **Next.js:** The primary React framework for building the application.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **Lucide React:** Icon library.
- **Outfit & Plus Jakarta Sans:** Custom fonts used for headings and body text, respectively.