# Shared Components Inventory and Rollout Plan

Date: 2026-04-02
Owner: GitHub Copilot
Status: In progress (initial implementation started on 2026-04-02)

## Goal

Deep-dive all page templates in this repository, list available UI components/blocks, identify what can be shared across pages, and define a safe phased implementation plan to extract shared Blade components without breaking reference-parity layouts.

## Scope

In scope:
- Active Laravel Blade pages under `resources/views/**`.
- Cross-page component reuse opportunities between catalog, user dashboard, and admin dashboard pages.

Out of scope:
- `.archive/legacy/**` (read-only historical Next.js implementation).
- Backend API behavior changes (this plan is UI component extraction only).

## Page Inventory (Active Surface)

Files reviewed:
- `resources/views/layouts/app.blade.php`
- `resources/views/catalog/index.blade.php`
- `resources/views/catalog/show.blade.php`
- `resources/views/dashboard/app.blade.php`
- `resources/views/dashboard/overview.blade.php`
- `resources/views/dashboard/products.blade.php`
- `resources/views/dashboard/droplets.blade.php`
- `resources/views/dashboard/orders.blade.php`
- `resources/views/admin/app.blade.php`
- `resources/views/admin/overview.blade.php`
- `resources/views/admin/products.blade.php`
- `resources/views/admin/orders.blade.php`
- `resources/views/admin/users.blade.php`
- `resources/views/admin/settings.blade.php`

Legacy pages detected (not to modify unless explicitly requested):
- `.archive/legacy/src/app/page.tsx`
- `.archive/legacy/src/app/dashboard/page.tsx`
- `.archive/legacy/src/app/dashboard/droplets/[id]/page.tsx`

## Component Inventory Across Pages

1. Topbar shell
- Appears in: `catalog/index`, `dashboard/app`, `admin/app`, `layouts/app`.
- Includes brand block, search input, right action icons/avatar.

2. Sidebar shell
- Appears in: `catalog/index`, `dashboard/app`, `admin/app`.
- Includes collapse toggle, main nav/filter area, bottom nav area.

3. Search input block
- Appears in: `catalog/index` (`search-bar`), `dashboard/app` (`topbar-search`), `admin/app` (`search-wrap`).

4. Page header block
- Appears in: `dashboard/app`, `admin/app`, catalog content region.
- Includes page title/subtitle and right-side action buttons.

5. Button system
- Appears in all main pages.
- Variants include default, accent, warning, danger, success, small.

6. Panel/card wrapper
- Appears in: `dashboard/app`, `admin/app`, catalog sections.
- Repeated header/body composition.

7. Status badge/chip
- Appears in: `dashboard/app`, `admin/app`, order/product rows.
- Variants for active/running/stopped/pending/expiring/warn/fail.

8. Data table shell
- Appears in: `dashboard/app`, `admin/app`, admin child pages.
- Repeated table styles, spacing, hover, compact status cells.

9. Filter bar
- Appears in: `admin/app` (select/input combo), `catalog/index` (filter chips/tags/range), some admin child pages.

10. Empty-state block
- Appears in: `catalog/index`, `dashboard/app`, `admin/app`.
- Usually icon + title + description.

11. Modal shell
- Appears in: `dashboard/app`, `admin/app`.
- Repeated backdrop/dialog patterns.

12. Toast/notification shell
- Appears in: `dashboard/app`, `admin/app`.
- Repeated fixed-position message pattern.

13. Avatar/account chip
- Appears in topbars (`dashboard/app`, `admin/app`, layout variants).

14. Action button group for droplets/orders
- Appears in `dashboard/app` and admin operational areas.

15. Catalog-only product card
- Appears in `catalog/index`.
- Includes image/thumbnail area, badges, price/rating/tags/actions.

16. Catalog-only hero strip and active-filters tags
- Appears in `catalog/index`.

## Shared Component Candidate Matrix

A. Shared now (high-confidence, low-risk)
- `x-ui.button`
- `x-ui.status-badge`
- `x-ui.empty-state`
- `x-ui.panel`
- `x-ui.table-shell`
- `x-ui.avatar-chip`

B. Shared with variants/slots (medium risk)
- `x-layout.topbar` (variant: catalog|dashboard|admin)
- `x-layout.sidebar` (variant: nav|filters)
- `x-layout.page-header` (slot for actions)
- `x-ui.filter-bar` (slot-driven content)
- `x-ui.modal`
- `x-ui.toast`

C. Keep page-specific (for now)
- Catalog hero strip
- Catalog product card
- Catalog active-filters tags

## Current Duplication Hotspots

1. Topbar search markup and styling exists in multiple forms across catalog/user/admin.
2. Sidebar shell and collapse behavior duplicated across dashboard/admin/catalog.
3. Button and badge classes are redefined in multiple files.
4. Panel and table wrappers are repeatedly hand-written.
5. Empty state, modal, and toast structures are duplicated.

## Phased Implementation Plan

## Phase 1: Foundation and Safety

Tasks:
1. Add new Blade component directories:
- `resources/views/components/layout/`
- `resources/views/components/ui/`

2. Define naming contract for component APIs:
- Props, slots, variant enums, class merge strategy.

3. Add visual verification checklist for parity on:
- `/catalog`
- `/dashboard/*`
- `/admin/*`

Acceptance criteria:
- Shared component API contract documented.
- No page behavior changed yet.

## Phase 2: Extract Low-Risk UI Primitives

Tasks:
1. Implement `x-ui.button`.
2. Implement `x-ui.status-badge`.
3. Implement `x-ui.empty-state`.
4. Implement `x-ui.avatar-chip`.

Replacement targets:
- `resources/views/dashboard/app.blade.php`
- `resources/views/admin/app.blade.php`
- `resources/views/catalog/index.blade.php` (empty state only in this phase)

Acceptance criteria:
- Primitive components render exactly as before.
- No JS behavior regressions.

## Phase 3: Extract Structural Wrappers

Tasks:
1. Implement `x-ui.panel`.
2. Implement `x-ui.table-shell`.
3. Implement `x-layout.page-header`.

Replacement targets:
- Dashboard and admin page sections first.
- Catalog only where structure matches exactly.

Acceptance criteria:
- Repeated wrapper markup is removed from primary app pages.
- Table and panel visuals remain reference-faithful.

## Phase 4: Extract Topbar and Search as Shared Layout

Tasks:
1. Implement `x-layout.topbar` with variants:
- `catalog`
- `dashboard`
- `admin`

2. Include pluggable search placeholder and right action slot.

Replacement targets:
- `catalog/index`
- `dashboard/app`
- `admin/app`

Acceptance criteria:
- One shared topbar component used across all main pages.
- Variant parity preserved (no layout drift).

## Phase 5: Extract Sidebar and Navigation/Filter Variant

Tasks:
1. Implement `x-layout.sidebar` with slot-driven content.
2. Standardize sidebar toggle hook names for shared JS behavior.
3. Move duplicate sidebar scaffolding from catalog/dashboard/admin into component.

Acceptance criteria:
- Shared sidebar shell used in all main pages.
- Collapse behavior remains identical.

## Phase 6: Extract Modal and Toast

Tasks:
1. Implement `x-ui.modal` with id/title/body slots.
2. Implement `x-ui.toast` with type/message variants.
3. Replace duplicated modal/toast markup in admin/dashboard.

Acceptance criteria:
- Admin and dashboard both consume shared modal/toast components.
- Existing interactions still work.

## Phase 7: Cleanup and Guardrails

Tasks:
1. Remove dead duplicated markup after parity confirmation.
2. Add component usage notes and examples.
3. Add test/checklist entries for UI parity regression checks.

Acceptance criteria:
- No duplicate structural blocks remain where a shared component exists.
- Documentation is sufficient for future additions.

## Proposed Extraction Order (Execution Priority)

1. Buttons and badges
2. Empty state and avatar
3. Panel and table shell
4. Page header
5. Topbar search
6. Sidebar shell
7. Modal and toast

Rationale:
- Start with smallest/lowest-risk components, then move to higher-impact layout shells.

## Risks and Mitigation

Risk 1: Reference visual drift
- Mitigation: Replace incrementally and verify each page immediately after each phase.

Risk 2: JS hooks break due to moved markup
- Mitigation: Keep existing ids/data attributes stable in component templates.

Risk 3: Over-generalized components become hard to maintain
- Mitigation: Use explicit variants and slots; avoid excessive conditionals.

## Deliverables for Implementation Step

When implementation starts, expected deliverables:
1. New component files under `resources/views/components/layout/` and `resources/views/components/ui/`.
2. Refactored page templates using those components.
3. A parity checklist update proving unchanged behavior/appearance.
4. Changelog update in `docs/log/log-changes.md`.

## Implementation Progress Update (2026-04-02)

Completed:
- Added shared UI components:
	- `x-ui.button`
	- `x-ui.avatar-chip`
	- `x-ui.status-badge`
	- `x-ui.empty-state`
- Added shared layout components:
	- `x-layout.topbar` (catalog/dashboard/admin variants)
	- `x-layout.page-header` (dashboard/admin variants)
- Added shared structural UI components:
	- `x-ui.panel`
	- `x-ui.table-shell`
- Added shared wrapper components:
	- `x-layout.sidebar-shell`
	- `x-ui.modal`
	- `x-ui.toast`
- Added shared compositional component:
	- `x-ui.filter-bar`
- Replaced duplicated topbar blocks in:
	- `resources/views/catalog/index.blade.php`
	- `resources/views/dashboard/app.blade.php`
	- `resources/views/admin/app.blade.php`
- Replaced duplicated sidebar wrappers in:
	- `resources/views/catalog/index.blade.php` (toggle disabled)
	- `resources/views/dashboard/app.blade.php`
	- `resources/views/admin/app.blade.php`
- Replaced admin modal and dashboard/admin toast wrappers with shared components.
- Replaced repeated admin filter-bar wrappers with shared `x-ui.filter-bar` in orders/users/entitlements/droplets/audit pages.
- Replaced representative repeated status badge and empty state blocks in dashboard/admin with shared components.
- Updated `docs/log/log-changes.md` with implementation entry.

Remaining (next iterations):
- Run full runtime parity checks when PHP runtime is available in shell PATH.

## Approval Gate

Initial implementation is in progress.
Continue iterating through the remaining items until rollout coverage is complete.
