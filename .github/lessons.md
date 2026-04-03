# Lessons

- Date: 2026-04-03
- Mistake: Reintroduced `window.prompt/confirm` in admin interactions after the user explicitly required page/modal-based UX.
- Rule: Never use browser dialogs in admin UI flows; always use in-page forms or custom modal components.
- Enforcement: Before completion, grep for `window.prompt` and `window.confirm` in touched admin views and remove all occurrences.

- Date: 2026-04-03
- Mistake: Stock import flow relied on free-form pasted rows and full-row hash duplication, missing file upload and identity-level validation requirements.
- Rule: Stock import must support file upload UX and enforce configured-header matching plus Email/Username uniqueness against both uploaded data and existing stock.
- Enforcement: For stock import changes, validate header equality first, then identity uniqueness, and return explicit invalid-row details (line + reason).

- Date: 2026-04-03
- Mistake: Left action buttons too close to textarea border in stock import form, causing visual overlap.
- Rule: Form action rows must have explicit separation (margin/padding/divider) from field borders, especially after resizable textareas.
- Enforcement: On form UI changes, check border/button clearance in both desktop and mobile breakpoints before finishing.

- Date: 2026-04-03
- Mistake: Hid wishlist action in mobile topbar while trying to reduce crowding.
- Rule: Never hide primary actions on mobile (wishlist/cart); only reduce labels/count text if needed.
- Enforcement: At small breakpoints, keep action buttons visible as icons and verify parity with desktop actions.

- Date: 2026-04-02
- Mistake: Mixed wishlist interaction with cart topbar UI state on homepage.
- Rule: Wishlist actions must only update wishlist state/counter; cart labels/counters must be managed by cart state only.
- Enforcement: For header counters, use dedicated ids/state bindings per feature and avoid broad selectors that can target the wrong button.

- Date: 2026-04-02
- Mistake: Lessons were too generic and did not preserve concrete user UI preferences for tables.
- Rule: Use shared table component layout consistently; do not add custom wrappers that cause per-page spacing differences.
- Rule: Keep Product-related table style proportional (not over-rounded, not over-padded) and visually identical across pages.
- Rule: On stock management page, render stock list first and open form only when `Add Stock` is clicked.
- Enforcement: Validate Product, Product Types, and Product Stocks against the same table shell + wrapper spacing pattern before closing task.

- Date: 2026-04-02
- Mistake: Continued running tools after the user explicitly said "stop" and requested a direct issue summary.
- Rule: When user says stop, halt tool execution immediately and answer only what was asked.
- Enforcement: Check the most recent user message for stop/pause constraints before any tool call.

- Date: 2026-04-02
- Mistake: Did not consistently complete mandatory process steps (lesson update, changelog update, commit, push) during iterative changes.
- Rule: For every implementation cycle, complete: lessons -> changelog -> git status + git diff -> explicit staging -> conventional commit -> immediate push.
- Enforcement: Block completion response until the full chain is complete or a blocker is reported.

- Date: 2026-04-01
- Mistake: Failed to consistently follow instruction-file behavior after loading it; introduced avoidable confusion by creating/renaming extra instruction files.
- Discovered PHP path (verified now): `C:\Users\Administrator\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe`
- Rule: Treat `.github/copilot-instructions.md` as canonical and keep changes tightly scoped to the exact user request.
- Rule: On every user correction, immediately record the lesson and apply it in the next action.

- Date: 2026-04-01
- Mistake: Missed the mandatory post-edit workflow chain after making file changes.
- Rule: Always execute the full chain after edits: verification, changelog update, git status/diff check, explicit staging, conventional commit, then immediate push.
- Enforcement: If any step is skipped, stop and complete it before continuing.

- Date: 2026-04-02
- Mistake: Replied in Indonesian without user requesting it.
- Rule: Default to English for all responses unless the user explicitly requests another language.
- Enforcement: Check response language against the user's latest explicit preference before sending.

- Date: 2026-04-02
- Mistake: Violated explicit English-only user requirement by using Bahasa Indonesia.
- Rule: English-only is a strict requirement in this workspace unless the user explicitly requests another language.
- Enforcement: Block response send if language is not English while English-only preference is active.

- Date: 2026-04-02
- Mistake: Left placeholder/demo data rendering on initial load, causing visible flicker before backend data arrives.
- Rule: Never render demo placeholder records in production admin pages; initialize with empty state and render only authoritative backend data.
- Enforcement: Before finalizing dashboard work, verify no hardcoded demo rows are rendered during first paint.

- Date: 2026-04-02
- Mistake: Used modal/prompt flow for product creation after the user requested page-based UX.
- Rule: If the user requests page-based interaction, implement a dedicated page route/view state, not browser prompts or popups.
- Enforcement: On UX corrections, mirror the requested interaction model exactly and remove prior conflicting UI patterns.

- Date: 2026-04-02
- Mistake: Treated user corrections too narrowly and waited for explicit instruction to update lessons.
- Rule: For every user message, classify whether it is request, feedback, issue, correction, constraint, or question, then proactively decide lesson updates.
- Enforcement: After any correction or recurring issue, update both lesson files without waiting for user reminders.

- Date: 2026-04-02
- Mistake: Implemented only part of a dashboard cleanup request and ignored broader placeholder-data scope.
- Rule: When user says "deep dive" or asks full dashboard cleanup, audit all dashboard sections for placeholder/static artifacts and fix comprehensively in one pass.
- Enforcement: Before finishing, verify overview metrics, sidebar signals, and key admin panels are data-driven and not hardcoded demo values.

- Date: 2026-04-02
- Mistake: Relied only on callback query parameters (`mode`/`next`) for post-OTP redirect, causing admin flow to fall back to `/dashboard` when params were missing.
- Rule: Preserve login intent server-side (cookie/session) during OTP initiation and use it as callback fallback.
- Enforcement: Add regression tests for callback redirect with missing query params and invalid next path.

- Date: 2026-04-02
- Mistake: Did not reconcile Supabase URL Configuration behavior (Site URL fallback) with backend `redirect_to` source, causing root redirects.
- Rule: Ensure backend `email_redirect_to` exactly matches an allowed redirect URL and does not rely on Site URL fallback.
- Enforcement: Verify APP_URL/SUPABASE_AUTH_REDIRECT_URL and Supabase Redirect URL allowlist together whenever auth redirects are debugged.
