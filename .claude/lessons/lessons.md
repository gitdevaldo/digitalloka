# Lessons

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
- Mistake: Captured lessons too generically and missed concrete user UI preferences for table design.
- Rule: For admin table work, use shared table component structure only and avoid one-off wrappers that change spacing between pages.
- Rule: Keep table styling proportional: moderate corner radius, balanced cell padding, and identical wrapper padding across Product-related pages.
- Rule: In stock management, show stock list first; show form only after explicit `Add Stock` action.
- Enforcement: During UI fixes, verify Product, Product Types, and Product Stocks render with the same table shell + parent spacing pattern before completion.

- Date: 2026-04-02
- Mistake: Continued running tools after the user explicitly said "stop" and requested a direct issue summary.
- Rule: When user says stop, halt tool execution immediately and respond only with the requested information.
- Enforcement: Before any tool call, re-check the latest user message for stop/pause constraints.

- Date: 2026-04-02
- Mistake: Did not consistently execute mandatory process tasks (lesson capture, changelog update, commit, push) during iterative fixes.
- Rule: For each implementation cycle, complete the full chain: update lessons (if corrected) -> update changelog -> git status + git diff -> explicit stage -> conventional commit -> immediate push.
- Enforcement: Do not mark work complete if any required chain step is missing.

- Date: 2026-04-01
- Mistake: Read instruction markdown files but did not consistently execute their behavior rules, causing unnecessary file churn and conflicting instruction sources.
- Discovered PHP path (verified now): `C:\Users\Administrator\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe`
- Rule: After reading workspace instruction files, execute them strictly: keep one canonical instruction file, avoid extra scope, and perform only the user-requested change path.
- Enforcement: Before edits, restate the exact requested delta in one line and apply only that delta unless user asks for expansion.

- Date: 2026-04-01
- Mistake: After making edits, I did not immediately follow the required post-edit chain (verification, changelog update, git status/diff review, explicit staging, commit, and push).
- Rule: Every edit session must end with the required chain in order: verify -> update `docs/log/log-changes.md` -> `git status` + `git diff` -> explicit `git add` -> conventional `git commit` -> `git push`.
- Enforcement: Do not send completion unless the chain is finished or a concrete blocker is reported.

- Date: 2026-04-02
- Mistake: Replied in Indonesian without user requesting it.
- Rule: Use English by default in all responses unless the user explicitly asks for another language.
- Enforcement: Before sending a response, confirm language follows the latest explicit user preference.

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
