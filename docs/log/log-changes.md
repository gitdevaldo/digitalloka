# Change Log

## 2026-04-03 05:10
- Short description: Applied global API performance improvements (auth/session caching, DigitalOcean caching/timeouts, local concurrency guidance)
- What you do:
  - Increased and made configurable Supabase session user cache TTLs to reduce repeated auth introspection overhead across endpoints.
  - Added configurable DigitalOcean connect/request timeouts and short-lived caching for droplets, droplet detail, and droplet actions.
  - Added cache invalidation for droplet/action cache on mutating droplet actions.
  - Added performance-related environment variables to `.env.example`.
  - Added API performance runtime guidance in `README.md` for concurrent local serving and cache tuning.
- File path that changes:
  - `app/Services/Auth/SupabaseAuthService.php`
  - `app/Services/DigitalOcean/DigitalOceanService.php`
  - `config/services.php`
  - `.env.example`
  - `README.md`
  - `docs/log/log-changes.md`

## 2026-04-03 04:45
- Short description: Fixed admin product edit URL, reduced product page load latency, and removed stale UI refresh behavior
- What you do:
  - Added dedicated admin edit route `/admin/products/{id}/edit` and wired it to a new `productEdit` page initializer.
  - Updated admin SPA navigation and startup flow so edit mode uses `/admin/products/{id}/edit` instead of `/admin/products/create`.
  - Refactored heavy bootstrap loading with promise memoization and page-scoped refresh logic to avoid repeated full-data fetches.
  - Removed droplet API fetch from bootstrap response path and made droplets load lazily only when the droplets page is opened.
  - Added lightweight product refresh flow (`refreshProducts`) used after create/edit/visibility toggle so product list updates immediately without manual page reload.
  - Updated stock/product helpers to keep category/select/product-stock panels in sync after product refresh.
- File path that changes:
  - `app/Http/Controllers/Web/AdminPageController.php`
  - `routes/web.php`
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-03 04:20
- Short description: Added featured field and removed all icons from digital product template
- What you do:
  - Added `featured` JSON field to products table via migration
  - Updated Product model to include `featured` in fillable and casts
  - Updated CatalogPageController to pass featured data to view
  - Modified spec-grid to render dynamic data from featured field instead of hardcoded values
  - Removed geometric pattern visual (colored blocks) from purchase card
  - Removed all emoji icons (⚡🔒📊) from product highlights section
  - Removed entire product highlights section (was using emojis)
  - Removed SVG icons from buttons and card specs
  - Removed checkmark icons from checklist items
- File path that changes:
  - `database/migrations/2026_04_03_041907_add_featured_to_products_table.php` (new)
  - `app/Models/Product.php`
  - `app/Http/Controllers/Web/CatalogPageController.php`
  - `resources/views/catalog/partials/product-digital.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-03 04:10
- Short description: Fixed digital product template - removed duplicates and emoji
- What you do:
  - Replaced duplicate spec grid (Category/Type/Status/Support) with useful info (Delivery/Access/Billing/Security)
  - Removed emoji icons from purchase card visual
  - Added geometric pattern blocks as visual element instead of emoji
  - Simplified card specs to avoid repeating information shown elsewhere
- File path that changes:
  - `resources/views/catalog/show.blade.php`
  - `resources/views/catalog/partials/product-digital.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-03 03:55
- Short description: Rewrote product detail page with server-rendered Blade templates
- What you do:
  - Replaced client-side JavaScript rendering with proper server-side Blade template architecture.
  - Updated CatalogPageController to fetch product data and pass formatted values to views.
  - Created modular partials for different product types: product-droplet.blade.php (VPS) and product-digital.blade.php (accounts/apikeys).
  - Droplet template matches exactly the HTML reference in docs/references/digitalloka-product-vps.html.
  - Digital product template has distinct layout suited for non-VPS products with different specs and visual.
  - Product type detection uses product_type, category name, and slug to determine template.
  - All pricing calculations (annual discount, savings) done server-side in controller.
  - Preserved all brand guidelines: thick borders, hard shadows, Outfit/Plus Jakarta Sans fonts.
- File path that changes:
  - `app/Http/Controllers/Web/CatalogPageController.php`
  - `resources/views/catalog/show.blade.php`
  - `resources/views/catalog/partials/product-droplet.blade.php` (new)
  - `resources/views/catalog/partials/product-digital.blade.php` (new)
  - `docs/log/log-changes.md`

## 2026-04-02 02:40
- Short description: Updated single-product price formatter for IDR display style.
- What you do:
  - Replaced generic no-comma formatter with currency-aware formatter in product detail page script.
  - Added IDR branch to render thousand grouping with dot separator and no decimal tail (example: `150.000`).
  - Kept non-IDR fallback formatting without comma separators.
- File path that changes:
  - `resources/views/catalog/show.blade.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-02 02:30
- Short description: Enforced no-comma price formatting on single product page.
- What you do:
  - Added explicit amount formatter helper in product detail page script to strip comma separators and render fixed decimal output.
  - Updated hero/buy price rendering to use normalized no-comma amount formatting.
- File path that changes:
  - `resources/views/catalog/show.blade.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-02 02:20
- Short description: Reworked single product page into cleaner premium layout with reduced visual noise.
- What you do:
  - Replaced cluttered product detail composition with cleaner hero + buy box + balanced content grid structure.
  - Simplified status/category/type presentation and removed heavy secondary card noise.
  - Refined Product Description and Product Details sections for better readability and whitespace rhythm.
  - Preserved responsive behavior while improving desktop/mobile visual balance.
- File path that changes:
  - `resources/views/catalog/show.blade.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-02 02:05
- Short description: Unified single-product header with homepage catalog header.
- What you do:
  - Switched base catalog layout to use shared `x-layout.topbar` catalog variant.
  - Added catalog topbar style primitives (topbar/search/action row) to base layout so product pages and wishlist inherit the same header look as homepage.
  - Made catalog topbar search handler safe on pages without `handleSearch` function.
- File path that changes:
  - `resources/views/layouts/app.blade.php`
  - `resources/views/components/layout/topbar.blade.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-02 01:50
- Short description: Replaced duplicated hardcoded logos with shared Blade brand-logo component.
- What you do:
  - Added shared `x-ui.brand-logo` component with centralized styling and consistent hover/spacing behavior.
  - Replaced duplicated logo markup in topbar variants (dashboard/admin/catalog) with shared component usage.
  - Replaced base layout header logo with shared component usage.
  - Removed obsolete per-page logo CSS blocks from admin, dashboard, and catalog pages.
- File path that changes:
  - `resources/views/components/ui/brand-logo.blade.php`
  - `resources/views/components/layout/topbar.blade.php`
  - `resources/views/layouts/app.blade.php`
  - `resources/views/admin/app.blade.php`
  - `resources/views/dashboard/app.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-02 01:30
- Short description: Refined product detail lower layout and removed slug from hero meta.
- What you do:
  - Removed slug from single product hero metadata to keep customer-facing context clean.
  - Reworked lower content area with stronger description treatment and more intentional right-side info cards.
  - Upgraded Product Details block visual treatment to better match hero quality and page rhythm.
- File path that changes:
  - `resources/views/catalog/show.blade.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-02 01:15
- Short description: Redesigned single product page into a premium branded layout.
- What you do:
  - Rebuilt product detail page structure from a minimal panel stack into a high-contrast hero + details grid composition.
  - Added stronger hierarchy for product title, price focus, category/status context, and action area.
  - Added responsive styling for desktop/mobile parity while keeping DigitalLoka token palette, border/shadow language, and typography.
  - Improved Product Description and Product Details sections for clearer readability and richer content rendering.
- File path that changes:
  - `resources/views/catalog/show.blade.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-03 00:40
- Short description: Removed admin window dialogs and restored page-based Product edit flow.
- What you do:
  - Replaced Product edit prompt workflow with in-page form editing using the existing create/edit product page.
  - Added reusable action modal UI and replaced all `window.prompt` / `window.confirm` usage in admin page interactions.
  - Updated stock item edit/delete, product type delete, order status update, and entitlement reason input to use non-browser modal UI.
  - Kept API behavior unchanged while removing browser dialogs from admin UX.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-03 00:25
- Short description: Added stock file upload import and strict header/identity validation for Product Stocks.
- What you do:
  - Added Product Stocks file import control in admin UI for CSV/TXT/XLS/XLSX and mapped uploaded data into stock headers/rows inputs.
  - Synced stock header input with configured product stock headers when managing a selected product.
  - Enforced backend rule: imported headers must match configured product stock headers (when configured).
  - Enforced uniqueness validation by Email/Username against both uploaded rows and existing product stock rows.
  - Marked invalid rows in import result payload with line + reasons and prevented insertion for invalid rows.
  - Added/updated feature tests for mismatched headers and duplicate email rows in uploaded payload.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `app/Services/Commerce/ProductStockService.php`
  - `app/Http/Controllers/Admin/ProductStockController.php`
  - `app/Http/Controllers/Admin/ProductController.php`
  - `tests/Feature/AdminProductStockManagementTest.php`
  - `docs/log/log-changes.md`

## 2026-04-03 00:10
- Short description: Fixed Product Stocks import form button spacing overlap.
- What you do:
  - Increased spacing between stock textarea and action buttons.
  - Added dedicated top padding and divider line for action row to avoid visual collision with textarea border.
  - Enabled action-row wrapping and mobile alignment so buttons keep safe spacing on narrow screens.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-03 00:05
- Short description: Restored wishlist icon visibility on mobile topbar.
- What you do:
  - Removed mobile rule that hid wishlist button on narrow screens.
  - Kept compact mobile behavior by hiding wishlist count text while preserving the wishlist icon button.
  - Left cart behavior unchanged.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 23:59
- Short description: Fixed homepage topbar counter mix-up between wishlist and cart.
- What you do:
  - Added dedicated wishlist counter element in catalog topbar button markup.
  - Added stable topbar button ids for wishlist and cart controls to prevent accidental cross-target updates.
  - Updated homepage wishlist toggle logic to update only wishlist count and stop mutating cart label/count.
  - Kept cart counter behavior isolated and unchanged by wishlist interactions.
- File path that changes:
  - `resources/views/components/layout/topbar.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 23:55
- Short description: Completed file-by-file responsive hardening across admin, dashboard, and catalog view surfaces.
- What you do:
  - Added responsive grid-collapse rules for admin Create Product and type-specific schema fields to prevent cramped two-column forms on small screens.
  - Improved admin stock-management panel spacing on narrow devices and reduced overflow risk in import/form sections.
  - Replaced dashboard fixed inline grid layouts with dedicated responsive classes for overview, account, and support sections.
  - Added horizontal-safe table wrapper behavior in dashboard pages and improved filter-action wrapping on smaller screens.
  - Tuned catalog toolbar/card-footer/footer behavior to wrap cleanly, avoid control collisions, and improve small-screen CTA/button ergonomics.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `resources/views/dashboard/app.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 23:35
- Short description: Refined mobile catalog topbar and 400px narrow-width layout behavior.
- What you do:
  - Updated catalog topbar button markup to expose responsive text labels and cart count elements.
  - Tuned catalog mobile breakpoints to reduce topbar crowding and improve control sizing.
  - Added small-screen behavior to hide verbose topbar labels while preserving icon/cart count clarity.
  - Reduced page top offset on small screens to match compact topbar height.
  - Cleared compiled Blade views after updates.
- File path that changes:
  - `resources/views/components/layout/topbar.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 23:20
- Short description: Added cross-page mobile responsiveness for admin dashboard, user dashboard, and catalog/homepage surfaces.
- What you do:
  - Improved admin dashboard mobile behavior with drawer-style sidebar on small screens and auto-close on page content/navigation taps.
  - Improved dashboard mobile behavior with drawer-style sidebar, tighter panel spacing, safer table spacing, and filter-row horizontal scrolling.
  - Improved catalog/homepage mobile behavior with tighter hero/product spacing and horizontal-safe filter chips.
  - Added mobile breakpoints to reduce overflow and improve usability across narrow widths.
  - Cleared compiled Blade views after updates.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `resources/views/dashboard/app.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 22:45
- Short description: Standardized admin table spacing wrappers and fixed stock-management form visibility flow.
- What you do:
  - Unified Products and Product Types table wrapper spacing by introducing shared `table-panel-body` container usage.
  - Removed custom stock table wrapper differences and aligned stock table rendering to shared `x-ui.table-shell` pattern.
  - Tightened table corner radius and cell padding proportions for better visual consistency.
  - Updated stock management page so import form is hidden by default and only appears when `Add Stock` is clicked.
  - Added explicit show/hide handlers for stock form and ensured hidden state on stock page transitions.
  - Repeatedly cleared compiled Blade views to ensure runtime behavior matched latest templates.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `resources/views/components/ui/table-shell.blade.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-02 22:10
- Short description: Moved stock management under Product flow and added dedicated Product Stocks CRUD/import/export with append-only dedupe behavior.
- What you do:
  - Removed fulfillment stock/template inputs from Create Product page as requested.
  - Added Product -> Stocks flow with product-scoped route `/admin/products/{id}/stocks` and Stocks action button on each product row.
  - Added Product Stocks API endpoints for list/create/update/delete/import/export.
  - Added append-only batch import behavior that skips duplicate credentials for the same product instead of replacing old data.
  - Added `credential_hash` storage + unique index `(product_id, credential_hash)` to enforce duplicate protection by credential content.
  - Added Product Stocks feature tests for append+dedupe import and CRUD lifecycle.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `app/Http/Controllers/Web/AdminPageController.php`
  - `routes/web.php`
  - `app/Http/Controllers/Admin/ProductStockController.php`
  - `app/Services/Commerce/ProductStockService.php`
  - `app/Models/ProductStockItem.php`
  - `routes/api.php`
  - `database/migrations/2026_04_02_220000_add_credential_hash_to_product_stock_items_table.php`
  - `app/Http/Requests/Admin/StoreProductStockItemRequest.php`
  - `app/Http/Requests/Admin/UpdateProductStockItemRequest.php`
  - `app/Http/Requests/Admin/ImportProductStocksRequest.php`
  - `tests/Feature/AdminProductStockManagementTest.php`
  - `docs/log/log-changes.md`

## 2026-04-02 19:14
- Short description: Added global API latency optimizations (auth/admin cache + parallel fast/heavy startup fetch).
- What you do:
  - Added short-lived token-to-user cache in Supabase auth service to avoid repeated `/auth/v1/user` lookups on every API request.
  - Added short-lived admin role/access cache in admin access service to avoid repeated DB role checks across rapid calls.
  - Updated admin frontend startup loading to run fast Product Types fetch and heavy bootstrap fetch in parallel when heavy data is required.
  - Kept Product Types-only pages lightweight by avoiding heavy bootstrap blocking.
- File path that changes:
  - `app/Services/Auth/SupabaseAuthService.php`
  - `app/Services/Access/AdminAccessService.php`
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 19:00
- Short description: Improved Product Types perceived load speed by decoupling it from bootstrap.
- What you do:
  - Added fast prefetch flow for Product Types from `/api/admin/product-types` before waiting for heavy bootstrap payload.
  - Applied Product Types data to UI immediately after fast fetch completes.
  - Kept bootstrap/fallback flow as authoritative full-data load and retained compatibility.
  - Adjusted fallback mapping order so users are mapped after entitlements in fallback mode.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 18:48
- Short description: Replaced checkbox controls with dropdown selectors for Product Type status and Create Product visibility.
- What you do:
  - Changed Product Type editor status input from checkbox to dropdown (`active` / `inactive`).
  - Changed Create Product visibility input from checkbox to dropdown (`visible` / `hidden`).
  - Updated frontend create/edit handlers to map dropdown values to boolean payload fields (`is_active`, `is_visible`).
  - Kept backend API contract unchanged.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 18:40
- Short description: Added Product Type active/inactive status and delete capability (API + UI).
- What you do:
  - Added `is_active` support to Product Type schema payload and default type definitions.
  - Added soft-delete semantics for Product Types using `deleted` flag in `site_settings` and filtering in list responses.
  - Added `DELETE /api/admin/product-types/{type}` endpoint with audit logging.
  - Updated Product Types list UI to show Status column and Delete action, and editor UI to include Active toggle.
  - Updated create-product type dropdown to include only active Product Types.
  - Updated bootstrap payload shaping so product type status/deleted flags remain consistent in one-call dashboard load.
  - Extended feature tests to verify `is_active` persistence and delete behavior.
- File path that changes:
  - `app/Http/Controllers/Admin/ProductTypeController.php`
  - `app/Http/Controllers/Admin/BootstrapController.php`
  - `app/Http/Requests/Admin/UpsertProductTypeRequest.php`
  - `routes/api.php`
  - `resources/views/admin/app.blade.php`
  - `tests/Feature/AdminProductTypeManagementTest.php`
  - `docs/log/log-changes.md`

## 2026-04-02 18:20
- Short description: Fixed Product Types spacing with explicit content padding.
- What you do:
  - Added explicit inner padding around Product Types table container to avoid edge-clipped appearance.
  - Increased Product Type editor form padding and vertical spacing for clearer field separation.
  - Kept behavior/routes unchanged and focused only on layout spacing.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 18:15
- Short description: Redesigned Product Types list UI to match Products page pattern.
- What you do:
  - Reworked Product Types list page structure to mirror Products page layout (header actions, filter bar, and tabular list view).
  - Added Product Types table columns: type key, label, description, fields count, and edit action.
  - Added lightweight client-side filtering (all/vps/custom + search by key/label).
  - Preserved dedicated create/edit Product Type page flow introduced earlier.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 18:02
- Short description: Split Product Types into dedicated list page and separate editor pages (create/edit).
- What you do:
  - Removed in-page Product Types editor from the list view and kept list page focused on browsing types.
  - Added dedicated Product Type editor page state to match the create-product style workflow.
  - Added Create and Edit routes for Product Types: `/admin/product-types/create` and `/admin/product-types/{type}/edit`.
  - Added navigation actions from Product Types list to dedicated editor page for both create and edit flows.
  - Preserved existing backend API payload format for `schema.fields`.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `app/Http/Controllers/Web/AdminPageController.php`
  - `routes/web.php`
  - `docs/log/log-changes.md`

## 2026-04-02 17:36
- Short description: Replaced Product Types raw JSON editor with visual schema builder UI.
- What you do:
  - Replaced Product Types "Schema JSON" textarea with a form-based field builder.
  - Added add/remove field interactions with editable key, label, type, required flag, help text, and select options.
  - Added client-side schema normalization/validation before save, including required options for select fields.
  - Kept backend payload format unchanged (`schema.fields`) so API compatibility remains intact.
  - Re-ran Product Types feature tests to confirm save/list behavior remains stable.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 17:10
- Short description: Added VPS OS options, persisted default product types in DB, and accelerated admin dashboard loading with bootstrap API.
- What you do:
  - Added `operating_system` schema field for `vps_droplet` with OS options: Ubuntu 22/24 LTS, Fedora 42/43 x64, Debian 12/13 x64, CentOS 9/10 x64, AlmaLinux 8/9/10, RockyLinux 8/9/10 x64.
  - Added migration to seed default product types directly into Supabase `site_settings` and patch existing `vps_droplet` schema to include the new OS field when missing.
  - Added `GET /api/admin/bootstrap` to fetch admin dashboard datasets in a single request and reduced initial dashboard load waterfall.
  - Updated admin dashboard loader to prefer bootstrap API and keep multi-endpoint fetch as fallback.
  - Extended Product Types feature test to verify the new OS field/options exist.
- File path that changes:
  - `app/Http/Controllers/Admin/ProductTypeController.php`
  - `app/Http/Controllers/Admin/BootstrapController.php`
  - `database/migrations/2026_04_02_171000_seed_default_product_types.php`
  - `routes/api.php`
  - `resources/views/admin/app.blade.php`
  - `tests/Feature/AdminProductTypeManagementTest.php`
  - `docs/log/log-changes.md`

## 2026-04-02 14:02
- Short description: Added Product Types management submenu and schema-driven product type fields for admin create-product flow.
- What you do:
  - Added admin Product Types API with default schemas (including `vps_droplet` provider/region/datacenter/spec fields) and upsert capability.
  - Added Product Types submenu/page under Products in admin dashboard with schema JSON editor and save/refresh actions.
  - Added product `meta` JSON support (migration + model/request updates) to persist type-specific field values.
  - Updated Create Product page to render dynamic type-specific fields from Product Types schema and submit them as `meta`.
  - Added Product Types admin web route and page initialization mapping.
  - Added feature tests for Product Types listing and upsert; re-ran product create tests.
  - Included DigitalOcean regional availability reference link on Product Types page.
- File path that changes:
  - `app/Http/Controllers/Admin/ProductTypeController.php`
  - `app/Http/Requests/Admin/UpsertProductTypeRequest.php`
  - `app/Http/Requests/Admin/StoreProductRequest.php`
  - `app/Http/Controllers/Web/AdminPageController.php`
  - `app/Models/Product.php`
  - `database/migrations/2026_04_02_133000_add_meta_to_products_table.php`
  - `routes/api.php`
  - `routes/web.php`
  - `resources/views/admin/app.blade.php`
  - `tests/Feature/AdminProductTypeManagementTest.php`
  - `docs/log/log-changes.md`

## 2026-04-02 13:24
- Short description: Fixed admin OTP redirect when Supabase returns to root URL.
- What you do:
  - Deep-dived redirect behavior from Supabase verification link and confirmed fallback cases where callback query params are missing and browser returns to `/`.
  - Added `GET /api/auth/intent` endpoint to resolve login intent (`mode` and `next`) from secure intent cookies.
  - Updated root-page hash auth handler to load auth intent fallback before persisting session, ensuring admin logins redirect to `/admin` even when Supabase redirects to root.
  - Hardened intent cookie parsing by adding raw-cookie-header fallback logic.
  - Added regression tests for auth intent endpoint and re-ran callback/middleware redirect suites.
- File path that changes:
  - `app/Http/Controllers/Auth/LoginController.php`
  - `routes/api.php`
  - `resources/views/catalog/index.blade.php`
  - `tests/Feature/AuthIntentEndpointTest.php`
  - `docs/log/log-changes.md`

## 2026-04-02 13:02
- Short description: Fixed admin OTP callback redirect falling back to user dashboard.
- What you do:
  - Added short-lived login-intent cookies (`dl-login-mode`, `dl-login-next`) when sending magic-link OTP.
  - Updated callback controller to recover mode/next from query first, then cookies, with strict safe-path fallback.
  - Updated callback page script to use server-resolved mode/next defaults if query params are missing.
  - Cleared login-intent cookies once session is persisted.
  - Added callback regression tests for missing query params and invalid next-path handling.
  - Re-ran auth-related feature tests and confirmed all pass.
- File path that changes:
  - `app/Http/Controllers/Auth/LoginController.php`
  - `app/Http/Controllers/Auth/CallbackController.php`
  - `resources/views/auth/callback.blade.php`
  - `tests/Feature/AuthCallbackRedirectModeTest.php`
  - `docs/log/log-changes.md`

## 2026-04-02 12:36
- Short description: Deep-cleaned admin dashboard placeholder artifacts and improved create-product page UI.
- What you do:
  - Reworked Create Product page form spacing/layout so fields no longer render clipped against panel border.
  - Replaced hardcoded overview KPI numbers with runtime values derived from loaded backend data.
  - Replaced hardcoded "Critical Audit Events" table rows with dynamic rows from live audit data.
  - Replaced hardcoded high-priority queue counters with live counts from orders/entitlements/droplets data.
  - Replaced static sidebar order badge and entitlement warning dot with dynamic signals.
  - Added lessons for full-scope dashboard deep-dive handling and proactive placeholder cleanup.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-02 12:20
- Short description: Removed dashboard placeholder flicker and moved product creation to dedicated page.
- What you do:
  - Removed hardcoded demo dataset initialization from admin dashboard client state to prevent first-paint placeholder flicker.
  - Removed create-product modal popup flow and switched Create Product to dedicated page state (`/admin/products/create`) with full form UI.
  - Added admin web route and controller mapping for create-product page initialization.
  - Updated product create submit flow to return to products page after successful creation.
  - Expanded lessons with explicit rules about placeholder flicker prevention and honoring page-based UX requests.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `routes/web.php`
  - `app/Http/Controllers/Web/AdminPageController.php`
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-02 12:02
- Short description: Replaced admin product prompt dialogs with proper create-product modal form.
- What you do:
  - Removed browser `window.prompt` flow from admin product creation.
  - Added a dedicated in-page create-product modal with structured fields (name, slug, type, status, short description, visibility).
  - Implemented modal submit handler with API request, button-disable during submit, validation feedback, and success refresh.
  - Added backdrop-close handler for the create-product modal.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 11:42
- Short description: Wired admin dashboard placeholder actions to real APIs and added entitlement expiry extension endpoint.
- What you do:
  - Replaced admin dashboard placeholder button handlers with real API-backed flows for product edit/toggle/view, order view/status update, user view/block-unblock, entitlement status updates, and droplet action logs.
  - Bound settings UI controls to persisted site settings by loading values from `/api/admin/settings` and saving all changes via audited upsert requests.
  - Added support-page action handlers for documentation, provider status, and support ticket/contact links.
  - Added new admin API endpoint `PUT /api/admin/entitlements/{id}/extend` and controller logic to extend entitlement expiry by N days and audit-log the action, enabling working `+30d` entitlement action in dashboard.
  - Added admin droplet action-log endpoint wiring usage in UI through `GET /api/admin/droplets/{id}/actions`.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `app/Http/Controllers/Admin/EntitlementController.php`
  - `routes/api.php`
  - `tests/Feature/AdminAuditCoverageTest.php`
  - `docs/log/log-changes.md`

## 2026-04-02 11:18
- Short description: Fixed admin product creation flow end-to-end.
- What you do:
  - Replaced placeholder create-product button behavior in admin UI with real backend POST `/api/admin/products` flow.
  - Added client-side slug generation helper and validation/error surfacing for failed create attempts.
  - Hardened backend slug validation with regex + unique constraint handling to return 422 validation errors instead of DB-level uniqueness failures.
  - Added feature tests verifying successful product creation and duplicate slug rejection behavior.
- File path that changes:
  - `resources/views/admin/app.blade.php`
  - `app/Http/Requests/Admin/StoreProductRequest.php`
  - `tests/Feature/AdminProductCreateTest.php`
  - `docs/log/log-changes.md`

## 2026-04-02 11:05
- Short description: Implemented full backend integration plan (T1-T7) with tests, security checks, and production hardening.
- What you do:
  - Implemented T1 auth hardening: login rate limiting, auth/session/middleware regression tests, and stable cookie/session behavior.
  - Implemented T2 user surface completion: shared droplet ID validator, queued user product actions with persistence, queue processing job, action status endpoint, and queue storage migrations.
  - Implemented T3 admin completion: stricter site-setting key validation and admin audit coverage tests.
  - Implemented T4 commerce hardening: payment webhook verification service with signature checks and idempotency, enforced paid-transition gating by verified transactions, transaction verification fields, payment events table, and entitlement expiration command/schedule.
  - Implemented T5 security verification: live DB policy verification command (`security:verify-db-policies`), same-origin coverage test for mutating API routes, and deployment security checklist.
  - Implemented T6 observability: structured auth failure logs, DigitalOcean provider correlation logging, and auth/provider observability runbook.
  - Implemented T7 release readiness: smoke integration tests, integration test matrix, and release-readiness checklist.
  - Re-ran targeted feature suites and verified all pass; executed live policy verification command successfully against DATABASE_URL.
  - Applied new migrations directly to live Supabase via `php artisan migrate --force` to create queue/action/payment tables and transaction verification fields.
  - Updated implementation plan tracker statuses to Done across T1-T7.
- File path that changes:
  - `app/Http/Controllers/Auth/LoginController.php`
  - `app/Http/Controllers/User/ProductController.php`
  - `app/Http/Controllers/Droplets/DropletController.php`
  - `app/Http/Controllers/Droplets/DropletActionController.php`
  - `app/Http/Controllers/Admin/DropletController.php`
  - `app/Http/Controllers/Payments/WebhookController.php`
  - `app/Http/Requests/Admin/UpsertSiteSettingRequest.php`
  - `app/Jobs/ProcessUserProductAction.php`
  - `app/Models/Transaction.php`
  - `app/Models/UserProductAction.php`
  - `app/Models/PaymentEvent.php`
  - `app/Services/Auth/SupabaseAuthService.php`
  - `app/Services/Commerce/OrderService.php`
  - `app/Services/Commerce/PaymentVerificationService.php`
  - `app/Services/DigitalOcean/DigitalOceanService.php`
  - `app/Support/DropletIdValidator.php`
  - `config/services.php`
  - `routes/api.php`
  - `routes/console.php`
  - `database/migrations/2026_04_02_101000_create_jobs_table.php`
  - `database/migrations/2026_04_02_101100_create_user_product_actions_table.php`
  - `database/migrations/2026_04_02_102000_add_payment_verification_fields_to_transactions_table.php`
  - `database/migrations/2026_04_02_102100_create_payment_events_table.php`
  - `tests/Feature/AuthLoginRateLimitTest.php`
  - `tests/Feature/AuthSessionCookiesTest.php`
  - `tests/Feature/AuthMiddlewareRedirectTest.php`
  - `tests/Feature/UserProductActionQueueTest.php`
  - `tests/Feature/AdminAuditCoverageTest.php`
  - `tests/Feature/PaymentWebhookAndEntitlementExpiryTest.php`
  - `tests/Feature/SameOriginCoverageTest.php`
  - `tests/Feature/SmokeIntegrationFlowsTest.php`
  - `docs/plans/2026-04-02-backend-integration-implementation-plan.md`
  - `docs/plans/2026-04-02-integration-test-matrix.md`
  - `docs/audits/2026-04-02-backend-deployment-security-checklist.md`
  - `docs/audits/2026-04-02-auth-provider-observability-runbook.md`
  - `docs/audits/2026-04-02-release-readiness-checklist.md`
  - `docs/log/log-changes.md`

## 2026-04-02 10:23
- Short description: Added canonical PHP path and DATABASE_URL-only caution to project instruction files.
- What you do:
  - Added explicit local PHP executable path guidance for command execution consistency.
  - Added strict caution to use direct `DATABASE_URL` PostgreSQL access for live Supabase DB inspection.
  - Added explicit prohibition against using Supabase service URL or service role key for live DB inspection tasks.
- File path that changes:
  - `.github/copilot-instructions.md`
  - `.claude/CLAUDE.md`
  - `docs/log/log-changes.md`

## 2026-04-02 10:15
- Short description: Added full backend implementation plan with top tracker based on PRD and live DATABASE_URL inspection.
- What you do:
  - Connected directly to live Supabase Postgres using `DATABASE_URL` and captured runtime baseline (table inventory, row counts, RLS and policy footprint, helper functions).
  - Created a full detailed implementation plan with tracker status at the top, phased execution tracks, verification criteria, risk register, milestones, and immediate execution tasks.
- File path that changes:
  - `docs/plans/2026-04-02-backend-integration-implementation-plan.md`
  - `docs/log/log-changes.md`

## 2026-04-02 09:41
- Short description: Rewrote backend integration PRD from a fresh top-down deep-dive pass.
- What you do:
  - Re-scanned route, controller, middleware, service, and data-model architecture from the current codebase to avoid fragmented prior context.
  - Replaced the backend integration PRD with a single coherent document covering homepage, user dashboard, admin dashboard, auth/session flow, security controls, service contracts, data model, risks, delivery priorities, and acceptance criteria.
- File path that changes:
  - `docs/prds/2026-04-02-backend-integration-full-deep-dive-prd.md`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Added full detailed backend integration deep-dive PRD.
- What you do:
  - Conducted comprehensive backend integration deep dive coverage across homepage, user dashboard, admin dashboard, auth/session flow, service boundaries, security, data model, error contracts, and integration risks.
  - Produced a complete backend integration PRD with functional requirements, non-functional requirements, phased delivery plan, and acceptance criteria.
- File path that changes:
  - `docs/prds/2026-04-02-backend-integration-full-deep-dive-prd.md`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Re-grouped database URL variables under Supabase section in `.env.example`.
  - Moved `DB_CONNECTION` and `DATABASE_URL` from standalone Database section into Supabase section.
  - Kept all Supabase-related auth and Postgres configuration grouped in one category as requested.
- File path that changes:
  - `.env.example`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Reorganized `.env.example` sections and clarified Supabase TLS/JWT fallback usage.
- What you do:
  - Grouped `.env.example` into clear categories (Application, Logging, Database, Session/Cache/Queue, Mail, Supabase, Provider APIs, Security).
  - Standardized example database URL variable to `DATABASE_URL`.
  - Added explicit production/local guidance comments for `SUPABASE_HTTP_VERIFY_SSL`, `SUPABASE_HTTP_CA_BUNDLE`, and `SUPABASE_LOCAL_JWT_FALLBACK`.
- File path that changes:
  - `.env.example`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Standardized DB connection URL to `DATABASE_URL` and removed duplicate `DB_URL` usage.
- What you do:
  - Removed `DB_URL` from local `.env` to avoid duplicate database URL variables.
  - Updated Laravel database config to read connection URL from `DATABASE_URL` for all supported drivers.
  - Updated `phpunit.xml` to use `DATABASE_URL` in test environment settings.
- File path that changes:
  - `.env`
  - `config/database.php`
  - `phpunit.xml`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Added mode-aware magic-link fallback redirects so admin login defaults to `/admin`.
- What you do:
  - Extended login request payload to include auth mode (`user` or `admin`).
  - Added mode parameter to Supabase callback redirect URL generation.
  - Updated callback and root hash handlers to use mode-aware fallback redirect when `next` is missing.
  - Ensured admin mode falls back to `/admin`, user mode falls back to `/dashboard`.
- File path that changes:
  - `resources/views/auth/login.blade.php`
  - `app/Http/Controllers/Auth/LoginController.php`
  - `app/Services/Auth/SupabaseAuthService.php`
  - `resources/views/auth/callback.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Hardened access-token extraction with raw cookie-header fallback to stop lingering relogin loops.
- What you do:
  - Updated access-token extraction to first use bearer/cookie APIs, then fall back to parsing `sb-access-token` from raw `Cookie` header.
  - Added token normalization for URL-encoded and quoted cookie values.
  - Ensured auth user resolution can continue even when cookie middleware mutates parsed cookie values.
- File path that changes:
  - `app/Services/Auth/SupabaseAuthService.php`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Fixed root cause of localhost login loop by excluding Supabase auth cookies from Laravel cookie encryption.
- What you do:
  - Identified root issue: Supabase auth cookies were set as raw values, while Laravel web middleware attempted to decrypt them and dropped unreadable values.
  - Excluded `sb-access-token` and `sb-refresh-token` from Laravel cookie encryption/decryption middleware.
  - Preserved existing backend session-persistence flow and middleware guards.
- File path that changes:
  - `bootstrap/app.php`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Fixed localhost login loop by adding local JWT fallback for session user resolution.
- What you do:
  - Updated Supabase session user resolution to fall back to local access-token JWT payload parsing when remote `/auth/v1/user` introspection fails.
  - Added expiration check (`exp`) and subject extraction (`sub`) in fallback parser.
  - Added configurable flag `SUPABASE_LOCAL_JWT_FALLBACK` with local-environment default enabled.
  - Enabled local fallback in `.env` and documented it in `.env.example`.
- File path that changes:
  - `app/Services/Auth/SupabaseAuthService.php`
  - `config/services.php`
  - `.env`
  - `.env.example`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Fixed post-magic-link relogin loop by persisting session cookies through backend endpoint.
- What you do:
  - Added `/api/auth/session` endpoint to persist Supabase access/refresh tokens into server-set cookies.
  - Updated root-page hash handler and callback page to call backend session endpoint before redirecting to dashboard.
  - Updated logout endpoint to clear auth cookies server-side.
  - Kept same-origin protection on session persistence endpoint.
- File path that changes:
  - `app/Http/Controllers/Auth/LoginController.php`
  - `app/Http/Controllers/Auth/LogoutController.php`
  - `routes/api.php`
  - `resources/views/auth/callback.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Fixed magic-link login persistence when Supabase redirects to localhost root.
- What you do:
  - Added hash-token handling on catalog root page to process Supabase magic-link fragments (`access_token`, `refresh_token`, `expires_in`).
  - Persisted auth cookies (`sb-access-token`, `sb-refresh-token`) from root-page hash callback flow.
  - Added automatic redirect to dashboard (or `next` query path when provided) after token persistence so protected routes keep session state.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Added dev-safe Supabase TLS configuration to unblock localhost magic-link login.
- What you do:
  - Added configurable Supabase HTTP TLS options (`SUPABASE_HTTP_VERIFY_SSL`, `SUPABASE_HTTP_CA_BUNDLE`) in service config.
  - Refactored Supabase auth HTTP calls to use a shared client that applies CA bundle path when provided, or verify toggle otherwise.
  - Set local `.env` to disable SSL verification for development (`SUPABASE_HTTP_VERIFY_SSL=false`) so local login no longer fails with cURL error 60.
  - Updated `.env.example` to document the new TLS env variables for local setup.
- File path that changes:
  - `config/services.php`
  - `app/Services/Auth/SupabaseAuthService.php`
  - `.env.example`
  - `.env`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Removed extra login-page navigation and added sticky logout action in dashboard sidebars.
- What you do:
  - Removed additional link navigation from auth login form so only the login form remains visible.
  - Added sticky `Logout` button at sidebar bottom in user dashboard layout.
  - Added sticky `Logout` button at sidebar bottom in admin dashboard layout.
  - Implemented frontend logout handler in both dashboard pages to call `/api/auth/logout`, clear auth cookies, and redirect to the relevant login page.
- File path that changes:
  - `resources/views/auth/login.blade.php`
  - `resources/views/dashboard/app.blade.php`
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Added dedicated user/admin authentication pages with protected dashboard route guards.
- What you do:
  - Added dedicated web login pages for user dashboard (`/login`) and admin dashboard (`/admin/login`) with magic-link submission to `/api/auth/login`.
  - Implemented callback page flow to parse Supabase access token from URL hash, persist auth cookies, and redirect to sanitized `next` path.
  - Added route middleware guards for dashboard and admin web routes to enforce authenticated and admin-authenticated access.
  - Added middleware aliases in application bootstrap for user and admin Supabase auth guards.
  - Extended login API/service flow to accept optional `next` path and include it in Supabase `email_redirect_to` callback URL.
- File path that changes:
  - `app/Http/Controllers/Web/AuthPageController.php`
  - `app/Http/Middleware/EnsureSupabaseAuthenticated.php`
  - `app/Http/Middleware/EnsureSupabaseAdminAuthenticated.php`
  - `app/Http/Controllers/Auth/LoginController.php`
  - `app/Http/Controllers/Auth/CallbackController.php`
  - `app/Services/Auth/SupabaseAuthService.php`
  - `routes/web.php`
  - `bootstrap/app.php`
  - `resources/views/auth/login.blade.php`
  - `resources/views/auth/callback.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Added live actor-behavior verification evidence for Supabase RLS/RBAC hardening.
- What you do:
  - Executed direct PostgreSQL actor simulation checks for `anon`, `authenticated`, and simulated `admin` paths.
  - Verified denial cases for anonymous order access and authenticated site-settings writes.
  - Verified cross-user isolation for order visibility.
  - Verified admin-path access on `site_settings` with temporary in-transaction role elevation and rollback.
  - Added pass/fail evidence matrix to Supabase audit documentation.
- File path that changes:
  - `docs/audits/2026-04-02-supabase-policy-matrix.md`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Implemented Supabase database hardening with RLS/RBAC policy pack and verification artifacts.
- What you do:
  - Created and executed a Supabase SQL hardening script that defines RBAC helper functions, enables RLS on all app tables, recreates policy coverage, and tightens grants for `anon` and `authenticated` roles.
  - Added a dedicated SQL verification script for RLS flags, policy inventory, policy coverage, grant matrix, and helper-function checks.
  - Added a policy matrix document describing actor-level access intent by table.
  - Added an execution runbook including command sequence, rollback strategy, and validation checklist.
  - Verified post-apply database state: RLS enabled on all target tables with policy coverage present across target datasets.
- File path that changes:
  - `docs/sql/2026-04-02-supabase-rls-rbac.sql`
  - `docs/sql/2026-04-02-supabase-rls-rbac-verify.sql`
  - `docs/audits/2026-04-02-supabase-policy-matrix.md`
  - `docs/audits/2026-04-02-supabase-rls-rbac-runbook.md`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Added implementation plan for Supabase database hardening (RBAC + RLS).
- What you do:
  - Created a dedicated implementation plan for Supabase database security enhancement.
  - Documented current live baseline, target actor model, table access intent, and phased rollout.
  - Defined execution phases for RLS enablement, policy implementation, privilege hardening, and verification.
  - Added deliverables and acceptance criteria for SQL migration scripts, policy matrix, and verification runbook.
- File path that changes:
  - `docs/plans/2026-04-02-supabase-database-rbac-rls-enhancement-plan.md`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Started shared Blade component rollout and replaced duplicated topbar/badge/empty-state blocks.
- What you do:
  - Added reusable Blade UI components for buttons, avatar chips, status badges, and empty states.
  - Added shared layout topbar component with catalog, dashboard, and admin variants.
  - Added shared page-header layout component with dashboard/admin variants and action slots.
  - Added shared panel and table-shell UI components and wired representative overview sections to use them.
  - Replaced duplicated topbar markup in catalog, user dashboard, and admin dashboard with the shared topbar component.
  - Replaced representative repeated status-badge blocks in dashboard and admin sections with the shared status-badge component.
  - Replaced dashboard support empty-state block with the shared empty-state component variant.
  - Added shared sidebar shell component and adopted it in catalog/dashboard/admin (catalog toggle disabled).
  - Added shared modal and toast components and replaced duplicated admin modal and dashboard/admin toast wrappers.
  - Added shared filter-bar component and replaced repeated admin filter bar wrappers in orders/users/entitlements/droplets/audit sections.
  - Replaced representative dashboard/admin static action buttons with shared `x-ui.button` in overview and panel action areas.
  - Completed bulk conversion of remaining dashboard/admin page headers to shared `x-layout.page-header`.
  - Completed bulk conversion of remaining dashboard/admin table-panel sections to shared `x-ui.panel` and `x-ui.table-shell` wrappers.
  - Replaced remaining admin products filter wrapper with shared `x-ui.filter-bar`.
  - Ran workspace error checks on all modified Blade component and page files.
  - Attempted to run Laravel tests, but `php` is not available in this shell PATH.
- File path that changes:
  - `resources/views/components/ui/button.blade.php`
  - `resources/views/components/ui/avatar-chip.blade.php`
  - `resources/views/components/ui/status-badge.blade.php`
  - `resources/views/components/ui/empty-state.blade.php`
  - `resources/views/components/ui/panel.blade.php`
  - `resources/views/components/ui/table-shell.blade.php`
  - `resources/views/components/layout/topbar.blade.php`
  - `resources/views/components/layout/page-header.blade.php`
  - `resources/views/components/layout/sidebar-shell.blade.php`
  - `resources/views/components/ui/modal.blade.php`
  - `resources/views/components/ui/toast.blade.php`
  - `resources/views/components/ui/filter-bar.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `resources/views/dashboard/app.blade.php`
  - `resources/views/admin/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-02 00:00
- Short description: Wired admin dashboard to the exact provided reference layout with backend integration.
- What you do:
  - Added the provided admin reference HTML file under docs references.
  - Copied reference layout into `resources/views/admin/app.blade.php` as the primary admin dashboard view.
  - Routed all admin web pages to the single reference-based dashboard view with route-driven initial page state.
  - Added missing admin web routes for entitlements, droplets, audit logs, account, and support.
  - Added admin API endpoints for droplets and audit logs and wired them to new controllers.
  - Updated dashboard client-side logic to fetch live backend data for products, orders, users, entitlements, droplets, and audit logs.
  - Wired droplet actions to backend endpoint `/api/admin/droplets/{id}/actions`.
- File path that changes:
  - `docs/references/digitalloka-admin-light.html`
  - `resources/views/admin/app.blade.php`
  - `app/Http/Controllers/Web/AdminPageController.php`
  - `app/Http/Controllers/Admin/DropletController.php`
  - `app/Http/Controllers/Admin/AuditLogController.php`
  - `routes/web.php`
  - `routes/api.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added dashboard HTML reference file to repository tracking.
- What you do:
  - Staged and included the provided user dashboard reference HTML file under docs references.
  - Ensured the reference artifact is now part of git history and available on remote.
- File path that changes:
  - `docs/references/digitalloka-dashboard.html`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Wired user dashboard routes to the provided reference HTML layout.
- What you do:
  - Copied `docs/references/digitalloka-dashboard.html` into a new Blade entry view at `resources/views/dashboard/app.blade.php`.
  - Wired all user dashboard controller endpoints to render the reference-based view with route-specific initial page state.
  - Added support for direct route access to nested dashboard sections, including `/dashboard/products/droplets`, `/dashboard/account`, and `/dashboard/support`.
  - Added URL synchronization in dashboard navigation so each section updates browser path while preserving the reference layout behavior.
- File path that changes:
  - `resources/views/dashboard/app.blade.php`
  - `app/Http/Controllers/Web/DashboardPageController.php`
  - `routes/web.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added admin dashboard IA PRD with all modules required now.
- What you do:
  - Created a dedicated admin dashboard requirements document with no optional scope.
  - Defined required admin navigation, including Products, Orders, Users, Entitlements, Droplets, Audit Logs, and Settings.
  - Required bottom-sticky Admin Account and Support navigation.
  - Declared required now-available admin routes including `/admin/entitlements`, `/admin/droplets`, and `/admin/audit-logs`.
  - Added module-level requirements, route requirements, data contracts, security rules, UX states, and acceptance criteria.
- File path that changes:
  - `docs/prds/2026-04-01-admin-dashboard-information-architecture-prd.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Tightened user dashboard IA PRD to remove optional scope and enforce bottom-sticky nav.
- What you do:
  - Removed optional wording from dashboard route/navigation scope.
  - Required Products > VPS Droplets route to be available now at `/dashboard/products/droplets`.
  - Defined Account and Support as bottom-sticky navigation items.
  - Added acceptance criteria for bottom-sticky nav and required droplet submenu route.
- File path that changes:
  - `docs/prds/2026-04-01-user-dashboard-information-architecture-prd.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added user dashboard IA PRD with Products-parent and Droplets-submenu rules.
- What you do:
  - Created a dedicated requirements document for user dashboard information architecture.
  - Defined Droplets as a product subtype under Products, not a top-level navigation item.
  - Added submenu requirements for Products > VPS Droplets and mapped ownership/action rules.
  - Included route guidance, data contract requirements, permissions, UX states, and acceptance criteria.
- File path that changes:
  - `docs/prds/2026-04-01-user-dashboard-information-architecture-prd.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Wired exact reference catalog UI to live backend filters and added regression guards.
- What you do:
  - Added product catalog metadata fields (`rating`, `reviews_count`, `tags`, `badges`) and migration support.
  - Extended catalog request validation and service filtering for `search`, `rating_min`, `tags`, `badges`, and `rating` sort.
  - Replaced static sample-data logic in catalog page script with live `/api/products` fetching while preserving reference HTML/CSS layout.
  - Added feature tests for API filtering/sorting and a reference checksum guard to detect catalog UI drift.
  - Could not execute Laravel tests in this shell because `php` is unavailable on PATH.
- File path that changes:
  - `app/Models/Product.php`
  - `app/Http/Requests/Catalog/ListProductsRequest.php`
  - `app/Services/Catalog/CatalogService.php`
  - `database/migrations/2026_04_01_000200_add_catalog_metadata_to_products_table.php`
  - `resources/views/catalog/index.blade.php`
  - `tests/Feature/CatalogProductsApiTest.php`
  - `tests/Feature/CatalogReferenceGuardTest.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Rebuilt catalog sidebar to match reference structure directly.
- What you do:
  - Replaced catalog page with reference-equivalent composition including sidebar sections: Category, Price Range, Rating, Tags, Status, and Reset All Filters.
  - Restored reference toolbar/active-filters/product-card pattern and matched interaction flow.
  - Swapped static sample data with backend-loaded products from `/api/products` while preserving reference UI behavior.
  - Verified tests still pass.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Removed non-reference right-side hero info from catalog header.
- What you do:
  - Removed the catalog hero right-side stats block that displayed dynamic product/sort values.
  - Kept result count in toolbar only, matching reference intent to avoid active-filter info in hero area.
  - Verified tests still pass.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Replaced catalog page with direct reference-style marketplace layout.
- What you do:
  - Rebuilt `catalog/index` to follow provided UI reference structure closely (fixed topbar, left filter rail, hero strip, toolbar, product card grid).
  - Removed previous partial interpretation layout and switched to full-page reference composition.
  - Kept live backend integration by fetching products from `/api/products` with query params for category, availability, price, type, and sort.
  - Preserved search and empty/error states in the new layout.
  - Verified tests still pass.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Converted catalog page to marketplace-style layout from provided UI reference.
- What you do:
  - Rebuilt catalog Blade page into top-level marketplace composition with side filter rail and dynamic product card grid.
  - Wired UI filters and sorting to backend API query parameters (`category`, `type`, `availability`, `min_price`, `max_price`, `sort`).
  - Added client-side search within returned backend results and dynamic category filter chips from live API data.
  - Updated empty/error states to match new visual system while preserving live backend integration.
  - Verified tests still pass.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Redesigned catalog header panel and empty-result state.
- What you do:
  - Reworked catalog title/header block with stronger hierarchy, subtitle, and emphasized visual treatment.
  - Replaced basic "no products found" panel with guided empty state including actionable reset and recommendation actions.
  - Kept filter behavior and API contract unchanged.
  - Verified tests still pass.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Improved category filter UX and kept slug conversion internal.
- What you do:
  - Removed slug-centric wording from category filter input.
  - Added category suggestion datalist for easier selection.
  - Normalized category input to slug format internally before API request to preserve backend compatibility.
  - Verified tests still pass.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Moved homepage filters to side rail and prioritized product results.
- What you do:
  - Replaced top-heavy homepage filter block with a dedicated side filter rail.
  - Kept product list as the primary visual focus area in the main column.
  - Added sticky desktop behavior for filter rail with responsive fallback on smaller screens.
  - Verified tests still pass.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Replaced oversized homepage cards with compact catalog toolbar.
- What you do:
  - Removed the two large top cards from catalog homepage.
  - Introduced a single compact toolbar section with title, filter controls, and concise status chips.
  - Kept product rows as full-width cards to prioritize listing visibility.
  - Verified tests still pass.
- File path that changes:
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Improved production UI hierarchy and interaction quality across key Blade screens.
- What you do:
  - Refined shared layout with stronger typography rhythm, utility classes, metric blocks, and polished action styles.
  - Redesigned catalog page with clearer section hierarchy, labeled filter controls, KPI row, reset action, and improved result row composition.
  - Upgraded dashboard and admin overview pages with structured hero/metric sections and cleaner module cards.
  - Preserved full-width layout and header minimality as requested.
- File path that changes:
  - `resources/views/layouts/app.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `resources/views/dashboard/overview.blade.php`
  - `resources/views/admin/overview.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Restored full-width card layout while keeping header minimal.
- What you do:
  - Restored card and panel visual treatments in shared Blade layout after flattening pass.
  - Kept layout full-width and single-column so cards remain full-width instead of centered/tiled.
  - Updated catalog result rows to use card styling while preserving full-width stacking.
- File path that changes:
  - `resources/views/layouts/app.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Removed all header navigation buttons and kept header minimal.
- What you do:
  - Removed global header navigation links from shared Blade layout.
  - Kept brand mark only in header to reduce distraction and focus on page-specific controls.
  - Verified test suite still passes after layout update.
- File path that changes:
  - `resources/views/layouts/app.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Aligned Laravel Blade UI to brand guideline and removed public admin header link.
- What you do:
  - Reworked shared Blade layout styling to match brand tokens, typography, border/shadow language, and interaction patterns.
  - Upgraded catalog, dashboard, and admin page presentation to branded cards, controls, and hierarchy while preserving existing data logic.
  - Restricted admin navigation link visibility in header to admin route context instead of showing it globally.
  - Re-ran automated tests after UI updates.
- File path that changes:
  - `resources/views/layouts/app.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `resources/views/catalog/show.blade.php`
  - `resources/views/dashboard/overview.blade.php`
  - `resources/views/dashboard/products.blade.php`
  - `resources/views/dashboard/orders.blade.php`
  - `resources/views/admin/overview.blade.php`
  - `resources/views/admin/products.blade.php`
  - `resources/views/admin/users.blade.php`
  - `resources/views/admin/orders.blade.php`
  - `resources/views/admin/settings.blade.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Updated Laravel migration PRD status to completed.
- What you do:
  - Changed migration PRD status from Draft to Completed to reflect completed implementation state.
  - Kept document content intact; status metadata only.
- File path that changes:
  - `docs/prds/2026-04-01-laravel-migration-prd.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added Laravel runtime scaffold and validated migrations/tests locally.
- What you do:
  - Imported required Laravel runtime files and directories (artisan, bootstrap, public, storage, tests, and framework config set).
  - Aligned bootstrap and service configuration with project-specific Supabase and DigitalOcean settings.
  - Updated composer metadata/scripts and environment template for local Laravel execution.
  - Ran package discovery, `migrate:fresh`, and `artisan test` successfully after generating app key and enabling sqlite extensions.
- File path that changes:
  - `artisan`
  - `bootstrap/app.php`
  - `bootstrap/providers.php`
  - `bootstrap/cache/.gitignore`
  - `config/app.php`
  - `config/auth.php`
  - `config/cache.php`
  - `config/database.php`
  - `config/filesystems.php`
  - `config/logging.php`
  - `config/mail.php`
  - `config/queue.php`
  - `config/services.php`
  - `config/session.php`
  - `public/.htaccess`
  - `public/index.php`
  - `public/robots.txt`
  - `routes/console.php`
  - `tests/CreatesApplication.php`
  - `tests/Feature/ExampleTest.php`
  - `tests/TestCase.php`
  - `tests/Unit/ExampleTest.php`
  - `app/Providers/AppServiceProvider.php`
  - `database/factories/UserFactory.php`
  - `database/seeders/DatabaseSeeder.php`
  - `phpunit.xml`
  - `.env.example`
  - `composer.json`
  - `composer.lock`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Installed PHP/Composer runtime and generated dependency lockfile.
- What you do:
  - Installed PHP 8.2 runtime on Windows via winget.
  - Installed Composer and configured PHP extensions required for secure package downloads.
  - Ran composer install for the Laravel workspace and generated `composer.lock`.
  - Removed temporary installer artifact from repository root.
- File path that changes:
  - `composer.lock`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Implemented Laravel product expansion core for homepage, user dashboard, and admin dashboard.
- What you do:
  - Added product/order/admin schema migrations and user role/status extension.
  - Added domain models and services for catalog listing, order lifecycle, entitlement management, site settings, admin access checks, and audit logging.
  - Implemented public/user/admin API controllers with request validation and security checks.
  - Implemented web page controllers and Blade views for homepage catalog, user dashboard modules, and admin dashboard modules.
  - Wired API and web routes for product listing/filtering, user order/product flows, and admin operations.
- File path that changes:
  - `database/migrations/2026_04_01_000100_add_role_and_status_to_users_table.php`
  - `database/migrations/2026_04_01_000110_create_product_categories_table.php`
  - `database/migrations/2026_04_01_000120_create_products_table.php`
  - `database/migrations/2026_04_01_000130_create_product_prices_table.php`
  - `database/migrations/2026_04_01_000140_create_orders_table.php`
  - `database/migrations/2026_04_01_000150_create_order_items_table.php`
  - `database/migrations/2026_04_01_000160_create_transactions_table.php`
  - `database/migrations/2026_04_01_000170_create_entitlements_table.php`
  - `database/migrations/2026_04_01_000180_create_site_settings_table.php`
  - `database/migrations/2026_04_01_000190_create_audit_logs_table.php`
  - `app/Models/User.php`
  - `app/Models/ProductCategory.php`
  - `app/Models/Product.php`
  - `app/Models/ProductPrice.php`
  - `app/Models/Order.php`
  - `app/Models/OrderItem.php`
  - `app/Models/Transaction.php`
  - `app/Models/Entitlement.php`
  - `app/Models/SiteSetting.php`
  - `app/Models/AuditLog.php`
  - `app/Services/Access/AdminAccessService.php`
  - `app/Services/Access/EntitlementService.php`
  - `app/Services/Audit/AuditLogService.php`
  - `app/Services/Catalog/CatalogService.php`
  - `app/Services/Commerce/OrderService.php`
  - `app/Services/Settings/SiteSettingService.php`
  - `app/Http/Requests/Catalog/ListProductsRequest.php`
  - `app/Http/Requests/User/CreateCheckoutRequest.php`
  - `app/Http/Requests/User/ProductActionRequest.php`
  - `app/Http/Requests/Admin/StoreProductRequest.php`
  - `app/Http/Requests/Admin/UpdateOrderStatusRequest.php`
  - `app/Http/Requests/Admin/UpdateUserAccessRequest.php`
  - `app/Http/Requests/Admin/UpdateEntitlementStatusRequest.php`
  - `app/Http/Requests/Admin/UpsertSiteSettingRequest.php`
  - `app/Http/Controllers/Catalog/ProductController.php`
  - `app/Http/Controllers/User/CheckoutController.php`
  - `app/Http/Controllers/User/ProductController.php`
  - `app/Http/Controllers/User/OrderController.php`
  - `app/Http/Controllers/Admin/ProductController.php`
  - `app/Http/Controllers/Admin/OrderController.php`
  - `app/Http/Controllers/Admin/UserController.php`
  - `app/Http/Controllers/Admin/EntitlementController.php`
  - `app/Http/Controllers/Admin/SiteSettingController.php`
  - `app/Http/Controllers/Web/CatalogPageController.php`
  - `app/Http/Controllers/Web/DashboardPageController.php`
  - `app/Http/Controllers/Web/AdminPageController.php`
  - `resources/views/layouts/app.blade.php`
  - `resources/views/catalog/index.blade.php`
  - `resources/views/catalog/show.blade.php`
  - `resources/views/dashboard/overview.blade.php`
  - `resources/views/dashboard/droplets.blade.php`
  - `resources/views/dashboard/products.blade.php`
  - `resources/views/dashboard/orders.blade.php`
  - `resources/views/admin/overview.blade.php`
  - `resources/views/admin/products.blade.php`
  - `resources/views/admin/users.blade.php`
  - `resources/views/admin/orders.blade.php`
  - `resources/views/admin/settings.blade.php`
  - `routes/api.php`
  - `routes/web.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added implementation plan for Laravel product expansion PRD.
- What you do:
  - Created a comprehensive phase-based implementation plan for homepage product discovery, user dashboard expansion, and admin dashboard delivery.
  - Included work breakdown structure, dependency map, testing plan, definition of done, and sprint execution sequence.
  - Aligned plan to existing Laravel migration baseline and droplet continuity constraints.
- File path that changes:
  - `docs/plans/2026-04-01-laravel-product-expansion-implementation-plan.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added Laravel product expansion PRD for homepage, user dashboard, and admin dashboard.
- What you do:
  - Created a new PRD for product expansion on top of Laravel migration baseline.
  - Defined scope, functional requirements, IA, APIs, security, non-functional requirements, rollout phases, acceptance criteria, risks, and open decisions.
  - Kept PRD independent from Digicart parity direction.
- File path that changes:
  - `docs/prds/2026-04-01-laravel-product-expansion-prd.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Refreshed stack and spec sections in instruction files to match current Laravel-first repository state.
- What you do:
  - Updated architecture, commands, tech stack, and conventions in instruction files to Laravel-first runtime.
  - Removed stale Next.js-specific stack/spec assumptions from instruction sections.
  - Preserved behavior/principles sections while aligning active/legacy codebase notes.
- File path that changes:
  - `.claude/CLAUDE.md`
  - `.github/copilot-instructions.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Updated instruction stack/spec sections to Laravel-first architecture.
- What you do:
  - Replaced outdated Next.js stack/spec content with current Laravel-root architecture and service boundaries.
  - Updated command and tech stack sections to Laravel/PHP workflow.
  - Added explicit note that `.archive/legacy/` is historical and read-only unless explicitly requested.
- File path that changes:
  - `.claude/CLAUDE.md`
  - `.github/copilot-instructions.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Relocated Laravel project from `laravel/` subdirectory to repository root.
- What you do:
  - Moved all Laravel runtime files and directories to root (`app/`, `routes/`, `config/`, `database/`, `composer.json`, `.env.example`, `README.md`).
  - Removed old nested `laravel/` path references by moving file structure instead of duplicating content.
- File path that changes:
  - `app/` (moved)
  - `routes/` (moved)
  - `config/` (moved)
  - `database/` (moved)
  - `composer.json` (moved)
  - `.env.example` (moved)
  - `README.md` (moved)
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Completed Laravel service/controller implementation slice and archived Next.js legacy code.
- What you do:
  - Implemented Supabase magic-link initiation and session user resolution service logic.
  - Implemented database-backed droplet access checks using `users.droplet_ids`.
  - Implemented DigitalOcean API integration methods and controller-level error mapping.
  - Added base Laravel model/controller and initial users migration.
  - Archived Next.js app/config and legacy docs into `.archive/legacy/` with archive README.
  - Expanded `.gitignore` with Laravel runtime artifacts.
- File path that changes:
  - `laravel/app/Services/Auth/SupabaseAuthService.php`
  - `laravel/app/Services/Access/DropletAccessService.php`
  - `laravel/app/Services/DigitalOcean/DigitalOceanService.php`
  - `laravel/app/Http/Controllers/Auth/LoginController.php`
  - `laravel/app/Http/Controllers/Droplets/DropletController.php`
  - `laravel/app/Http/Controllers/Droplets/DropletActionController.php`
  - `laravel/app/Http/Controllers/Controller.php`
  - `laravel/app/Models/User.php`
  - `laravel/database/migrations/2026_04_01_000000_create_users_table.php`
  - `.archive/legacy/README.md`
  - `.archive/legacy/src/` (moved)
  - `.archive/legacy/next.config.js` (moved)
  - `.archive/legacy/package.json` (moved)
  - `.archive/legacy/package-lock.json` (moved)
  - `.archive/legacy/postcss.config.js` (moved)
  - `.archive/legacy/tailwind.config.ts` (moved)
  - `.archive/legacy/tsconfig.json` (moved)
  - `.archive/legacy/dashboard.html` (moved)
  - `.archive/legacy/prd.md` (moved)
  - `.gitignore`
  - `docs/plans/2026-04-01-laravel-migration-implementation-plan.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Implemented Laravel migration Phase 1 scaffold with route and service parity skeleton.
- What you do:
  - Created a Laravel workspace scaffold under `laravel/` including composer metadata, env template, service config, route definitions, middleware, request validation, controllers, and service boundaries.
  - Added migration implementation plan for phased execution under `docs/plans/`.
  - Added setup and next-step notes for enabling runnable Laravel bootstrap once PHP/Composer are available.
- File path that changes:
  - `docs/plans/2026-04-01-laravel-migration-implementation-plan.md`
  - `laravel/README.md`
  - `laravel/composer.json`
  - `laravel/.env.example`
  - `laravel/config/services.php`
  - `laravel/routes/api.php`
  - `laravel/routes/web.php`
  - `laravel/app/Http/Middleware/EnsureSameOrigin.php`
  - `laravel/app/Http/Requests/StoreDropletActionRequest.php`
  - `laravel/app/Http/Controllers/Auth/LoginController.php`
  - `laravel/app/Http/Controllers/Auth/LogoutController.php`
  - `laravel/app/Http/Controllers/Auth/CallbackController.php`
  - `laravel/app/Http/Controllers/Droplets/DropletController.php`
  - `laravel/app/Http/Controllers/Droplets/DropletActionController.php`
  - `laravel/app/Services/Auth/SupabaseAuthService.php`
  - `laravel/app/Services/Access/DropletAccessService.php`
  - `laravel/app/Services/DigitalOcean/DigitalOceanService.php`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added explicit post-edit workflow mistakes and enforcement rules to lessons files.
- What you do:
  - Appended a concrete mistake entry describing missed post-edit chain execution.
  - Added enforcement rules requiring verification, changelog, status/diff review, explicit staging, commit, and push.
- File path that changes:
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Added PRD for migrating DigitalLoka from Next.js to Laravel.
- What you do:
  - Created a detailed migration PRD covering scope, objectives, functional and non-functional requirements, target Laravel architecture, phased migration plan, cutover strategy, acceptance criteria, risks, and route parity.
- File path that changes:
  - `docs/prds/2026-04-01-laravel-migration-prd.md`
  - `docs/log/log-changes.md`

## 2026-04-01 00:00
- Short description: Normalize instruction sources, add frontend brand guideline, and align behavior rules/lesson paths.
- What you do:
  - Replaced conflicting IDE instruction file usage and kept canonical workspace instruction file in `.github/copilot-instructions.md`.
  - Updated instruction behavior rules for generated-doc directories and self-improvement lesson paths.
  - Added comprehensive UI brand guideline document based on implemented frontend style system.
  - Added lessons tracking files required by instruction rules.
- File path that changes:
  - `.claude/CLAUDE.md`
  - `.github/copilot-instructions.md`
  - `.github/copilot-instructions-ide.md` (deleted)
  - `.claude/lessons/lessons.md`
  - `.github/lessons.md`
  - `docs/projects/frontend-brand-guidelines.md`
  - `docs/log/log-changes.md`
