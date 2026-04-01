# DigitalLoka Frontend Brand Guidelines

Version: 2026-04-01
Owner: Product + Frontend
Scope: All dashboard UI in this repository

## 1. Brand Personality

DigitalLoka visual language is:
- Friendly but technical
- Bold and geometric, not minimalist-flat
- High-contrast and playful through hard shadows, thick borders, and colorful accent blocks
- Human and approachable through rounded shapes and clear typography

Design keywords:
- Rounded
- Layered
- Punchy
- Lightweight motion
- Clear hierarchy

## 2. Design System Foundations

### 2.1 Color Tokens (Source of truth: src/app/globals.css)

Core semantic tokens:
- `--background`: `#FFFDF5`
- `--foreground`: `#1E293B`
- `--muted`: `#F1F5F9`
- `--muted-foreground`: `#64748B`
- `--accent`: `#8B5CF6`
- `--accent-foreground`: `#FFFFFF`
- `--secondary`: `#F472B6`
- `--tertiary`: `#FBBF24`
- `--quaternary`: `#34D399`
- `--border`: `#E2E8F0`
- `--input`: `#FFFFFF`
- `--card`: `#FFFFFF`
- `--ring`: `#8B5CF6`
- `--shadow`: `#1E293B`

Usage intent:
- `accent` is primary action and identity color.
- `secondary` is destructive or high-alert visual support.
- `tertiary` is warning/attention and decorative pop.
- `quaternary` is success/healthy states.
- `foreground` + `border` are structural anchors for the neo-brutal style.

Color behavior rules:
- Always keep dark structural borders (`border-foreground`) for key surfaces and controls.
- Use tokenized colors only; avoid introducing one-off hex values in components.
- Keep backgrounds light and warm (`background`) unless explicitly designing a contained inverse section.

### 2.2 Typography

Font families (source of truth: src/app/globals.css + tailwind.config.ts):
- Heading: `Outfit`
- Body/UI: `Plus Jakarta Sans`

Type hierarchy:
- Display/Page title: `text-3xl font-bold font-heading`
- Section title: `text-xl font-bold font-heading`
- Card title: `text-base` to `text-lg`, `font-bold`
- Body: `text-sm` or `text-base`, `font-medium` preferred over regular
- Meta/captions: `text-xs`, uppercase + tracking for labels

Tone rules:
- Use sentence case for body and helper text.
- Use all-caps only for compact status labels and overline labels.
- Keep copy concise and operational.

### 2.3 Shape Language

Radii (source of truth: tailwind.config.ts):
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

Applied conventions:
- Primary interactive controls: `rounded-full` or `rounded-lg`
- Cards/panels: `rounded-xl`
- Micro indicators: circles (`rounded-full`) or squares rotated `45deg` for playful accents

### 2.4 Border and Stroke System

Border widths:
- Default component outline is `2px`
- Use `border-foreground` for primary structural surfaces
- Use `border-border` for low-emphasis nested surfaces

SVG icon stroke style:
- `strokeWidth` usually `2` or `2.5`
- Rounded caps/joins where applicable
- Prefer simple geometry over detailed illustrations

## 3. Layout Guidelines

### 3.1 Page Structure

Typical dashboard shell (source: src/app/dashboard/layout.tsx):
- Fixed top bar, 64px height
- Left sidebar, 256px width
- Scrollable main content area
- Dotted background texture (`bg-dots`) behind frame

Spacing rhythm:
- Global content padding: `p-8`
- Card internal padding: `p-6` to `p-8`
- Compact controls: `px-3/4` + `py-1.5/2/3`
- Section spacing: `space-y-6`

### 3.2 Grid and Cards

Card grids:
- Mobile: single column
- Tablet: `md:grid-cols-2`
- Desktop: `lg:grid-cols-3`

Card behavior:
- Always outlined (`border-2`)
- Always include hard shadow (`shadow-pop*`)
- Hover movement is small and directional (`-translate-x-[2px] -translate-y-[2px]`)

## 4. Motion and Interaction

Motion style:
- Snappy, spring-like, short duration
- No cinematic or slow transitions

Transition defaults:
- Duration: `300ms`
- Easing: `ease-bounce` (`cubic-bezier(0.34, 1.56, 0.64, 1)`)

Approved animations (source: src/app/globals.css):
- `animate-wiggle`: small rotational emphasis
- `animate-pop-in`: entry for success/toast moments
- `animate-pulse`: status and loading indicators

Accessibility rule:
- Respect reduced motion (`prefers-reduced-motion: reduce`) by disabling non-essential animations.

## 5. Elevation and Shadow System

Hard-shadow utilities:
- `shadow-pop` (base)
- `shadow-pop-hover` (hover amplification)
- `shadow-pop-active` (pressed)
- `shadow-pop-accent`
- `shadow-pop-secondary`
- `shadow-pop-tertiary`
- `shadow-pop-soft`

Usage rules:
- Keep at least one hard shadow on primary cards/buttons.
- Use colored shadow variants to differentiate cards in repeated grids.
- On active press, always reduce depth (`shadow-pop-active`) with matching positive translate.

## 6. Component Standards

### 6.1 Buttons

Primary button pattern:
- `rounded-full`, `border-2 border-foreground`, `shadow-pop`
- Hover: raise with negative translate + stronger shadow
- Active: depress with positive translate + active shadow
- Disabled: remove movement and hover shadow

Variant mapping:
- Default: neutral surface (`bg-card`)
- Success: `bg-quaternary`
- Warning: `bg-tertiary`
- Danger: `bg-secondary text-white`

### 6.2 Inputs

Input pattern:
- White surface (`bg-input`)
- `border-2 border-border`
- Rounded large corner (`rounded-lg`)
- Focus state uses accent border + accent hard shadow (`focus:shadow-pop-accent`)

### 6.3 Status Badges

Status badge shape:
- Pill container, dark border, hard shadow
- Dot indicator at left
- Small uppercase bold text

Status color map:
- Active/Online: `quaternary`
- Off/Failed: `secondary`
- In progress/Starting: `tertiary`
- Archived/Neutral: `muted`

### 6.4 Cards and Panels

Card baseline:
- `bg-card border-2 rounded-xl`
- Shadow always present
- Include compact visual accent shape for hero/empty/error states when useful

## 7. Decorative Elements and Visual Motifs

Allowed motifs:
- Filled circles with 2px border
- Rotated squares/diamonds with 2px border
- Dotted background pattern (`bg-dots`)
- Simple inline SVG server icon motif (stacked rounded rectangles + status dots)

Placement rules:
- Decoration should never block content hierarchy.
- Use low opacity for background-only ornaments.
- Keep decorative count limited (typically 2-4 per major view).

## 8. Logo Guidelines

Source component:
- `src/components/ui/brand-logo.tsx`

Wordmark treatment:
- Text: `DigitalLoka`
- Container: accent background, 2px foreground border, hard shadow
- Typography: `font-heading`, extra bold, tight tracking
- Highlight: "Loka" in `tertiary`

Logo dos:
- Use the shared `BrandLogo` component directly.
- Keep text lockup unchanged.
- Preserve border and shadow treatment.

Logo don'ts:
- Do not redraw the logo in arbitrary text styles.
- Do not remove border/shadow in primary contexts.
- Do not change the accent/tertiary color relationship without brand review.

## 9. SVG and Iconography Guidelines

Icon style:
- Outline icons first, minimal fill usage
- Stroke width: 2 to 2.5
- Rounded corners and joints
- Geometric primitives favored over complex paths

Brand icon motif:
- The "server stack" icon is the core visual cue for droplets and infrastructure context.

Implementation rules:
- Use inline SVG in components where dynamic color/state is needed.
- Default icon sizing: 20px, 24px, or 32px depending on container.
- Ensure icon foreground/background contrast remains AA-level readable.

## 10. Copy and Messaging Style

Voice:
- Direct, operational, clear
- Positive and supportive in success states
- Calm and actionable in failure states

UI copy examples:
- Good: "No droplets assigned"
- Good: "Try again"
- Good: "Enter your email to receive a magic link"
- Avoid: long, technical error payloads in end-user toasts

## 11. Accessibility Baseline

Required checks for new UI:
- Keyboard navigable controls and focus visible states
- Adequate text contrast against token backgrounds
- Reduced-motion support for animated affordances
- Error states include clear textual message, not color alone

## 12. Implementation Rules for Contributors

When creating or editing UI components:
1. Reuse existing tokens and utilities from globals.css and Tailwind config.
2. Preserve thick-border + hard-shadow language.
3. Keep motion short and springy; avoid long fades.
4. Use `font-heading` for headings and `font-sans` for body/UI.
5. Follow component behavior patterns in:
   - `src/components/auth/login-form.tsx`
   - `src/components/droplets/action-button.tsx`
   - `src/components/droplets/status-badge.tsx`
   - `src/components/droplets/droplet-list.tsx`
   - `src/components/ui/brand-logo.tsx`

## 13. Change Management for Brand System

Any change to brand primitives requires updating both:
- This guideline file
- Source tokens/components in code (`globals.css`, `tailwind.config.ts`, and affected shared components)

Suggested versioning format at top of this file:
- `Version: YYYY-MM-DD`

## 14. Quick Checklist

Before shipping UI changes:
- Uses token colors only
- Uses Outfit for headings, Plus Jakarta Sans for body
- Keeps 2px border language on key surfaces
- Applies hard shadow style consistently
- Includes hover/active states for buttons and interactive cards
- Works on mobile and desktop layouts
- Preserves accessibility and reduced motion behavior
