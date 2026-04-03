@extends('layouts.app', ['title' => ($product['name'] ?? 'Product') . ' — DigitalLoka'])

@section('content')
<style>
:root {
  --font-h: 'Outfit', sans-serif;
  --font-b: 'Plus Jakarta Sans', sans-serif;
  --r-sm: 8px; --r-md: 16px; --r-lg: 24px; --r-xl: 32px;
  --ease: cubic-bezier(0.34,1.56,0.64,1);
}

.page { position: relative; z-index: 1; }

/* ── BUTTONS ─────────────────────────────────────────────── */
.btn {
  font-family: var(--font-b); font-weight: 700; font-size: 0.85rem;
  border: 2px solid var(--foreground); border-radius: 999px;
  padding: 9px 20px; cursor: pointer;
  transition: all 0.15s var(--ease);
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--card); color: var(--foreground);
  box-shadow: 3px 3px 0 var(--shadow);
  text-decoration: none;
}
.btn:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 var(--shadow); }
.btn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 var(--shadow); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
.btn-accent { background: var(--accent); color: #fff; }
.btn-quaternary { background: var(--quaternary); color: var(--foreground); }
.btn-tertiary { background: var(--tertiary); color: var(--foreground); }
.btn-ghost { background: var(--muted); border-color: var(--border); box-shadow: 2px 2px 0 var(--border); color: var(--muted-foreground); }
.btn-ghost:hover { color: var(--foreground); border-color: var(--foreground); box-shadow: 3px 3px 0 var(--shadow); }
.btn-sm { padding: 5px 13px; font-size: 0.73rem; box-shadow: 2px 2px 0 var(--shadow); }
.btn-sm:hover { box-shadow: 3px 3px 0 var(--shadow); }
.btn-lg { padding: 14px 32px; font-size: 1rem; }
.btn-full { width: 100%; justify-content: center; }

/* ── BADGE ──────────────────────────────────────────────── */
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 999px;
  font-size: 0.62rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.06em; border: 2px solid var(--foreground);
  box-shadow: 2px 2px 0 var(--shadow); white-space: nowrap;
}
.badge .dot { width: 6px; height: 6px; border-radius: 50%; }
.b-green  { background: var(--quaternary); color: var(--foreground); }
.b-green .dot  { background: #065f46; }
.b-amber  { background: var(--tertiary); color: var(--foreground); }
.b-amber .dot  { background: #78350f; }
.b-accent { background: var(--accent); color: #fff; }
.b-accent .dot { background: #ede9fe; }
.b-pink   { background: var(--secondary); color: #fff; }
.b-pink .dot   { background: #9f1239; }
.b-muted  { background: var(--muted); color: var(--muted-foreground); border-color: var(--border); box-shadow: none; }
.b-muted .dot  { background: var(--muted-foreground); }

/* ── HERO ───────────────────────────────────────────────── */
.hero {
  padding: 48px 40px 0;
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 400px; gap: 48px; align-items: start;
}

/* breadcrumb */
.breadcrumb {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground);
  margin-bottom: 16px;
}
.breadcrumb a { color: var(--muted-foreground); text-decoration: none; }
.breadcrumb a:hover { color: var(--accent); }
.breadcrumb .sep { opacity: 0.4; }

.hero-badge-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }

.hero-title {
  font-family: var(--font-h); font-size: 2.6rem; font-weight: 900;
  line-height: 1.08; letter-spacing: -0.03em; margin-bottom: 14px;
}
.hero-title .hl {
  background: var(--accent); color: #fff;
  padding: 1px 8px 3px; border-radius: var(--r-sm);
  border: 2px solid var(--foreground); box-shadow: 3px 3px 0 var(--shadow);
  display: inline-block;
}

.hero-tagline {
  font-size: 1rem; font-weight: 500; color: var(--muted-foreground);
  line-height: 1.65; margin-bottom: 28px; max-width: 500px;
}

/* spec grid */
.spec-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  border: 2px solid var(--foreground); border-radius: var(--r-lg);
  overflow: hidden; box-shadow: 4px 4px 0 var(--shadow);
  margin-bottom: 28px; background: var(--card);
}
.spec-cell {
  padding: 14px 16px; border-right: 2px solid var(--border);
  display: flex; flex-direction: column; gap: 3px;
}
.spec-cell:last-child { border-right: none; }
.spec-label {
  font-size: 0.6rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.09em; color: var(--muted-foreground);
}
.spec-value {
  font-family: var(--font-h); font-size: 1.1rem; font-weight: 900; color: var(--foreground);
}
.spec-sub { font-size: 0.65rem; font-weight: 600; color: var(--muted-foreground); }

/* status row */
.status-row {
  display: flex; align-items: center; gap: 10px; margin-bottom: 28px; flex-wrap: wrap;
}
.uptime-bar {
  flex: 1; min-width: 160px; height: 6px;
  background: var(--border); border-radius: 999px; overflow: hidden;
  border: 1.5px solid var(--foreground);
}
.uptime-fill { height: 100%; background: var(--quaternary); border-radius: 999px; }
.uptime-label { font-size: 0.72rem; font-weight: 700; color: var(--muted-foreground); white-space: nowrap; }

/* includes checklist */
.includes-title {
  font-family: var(--font-h); font-size: 1rem; font-weight: 800; margin-bottom: 12px;
}
.checklist { display: flex; flex-direction: column; gap: 7px; margin-bottom: 32px; }
.check-item {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 0.85rem; font-weight: 600; color: var(--foreground); line-height: 1.4;
}
.check-icon {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; margin-top: 1px;
  border: 2px solid var(--foreground); box-shadow: 2px 2px 0 var(--shadow);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 900;
}

/* ── PURCHASE CARD ──────────────────────────────────────── */
.purchase-card {
  background: var(--card);
  border: 2px solid var(--foreground);
  border-radius: var(--r-xl);
  box-shadow: 6px 6px 0 var(--shadow);
  overflow: hidden;
  position: sticky; top: 80px;
}

/* server visual header */
.card-visual {
  background: linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 60%, #DDD6FE 100%);
  border-bottom: 2px solid var(--foreground);
  padding: 28px 24px 20px;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; gap: 12px;
}
.card-visual::before {
  content: '';
  position: absolute; top: -20px; right: -20px;
  width: 100px; height: 100px; border-radius: 50%;
  border: 2px solid rgba(30,41,59,0.1);
}
.card-visual::after {
  content: '';
  position: absolute; bottom: -14px; left: 16px;
  width: 48px; height: 48px;
  border: 2px solid rgba(30,41,59,0.08); transform: rotate(45deg);
}

/* server stack icon */
.server-stack {
  display: flex; flex-direction: column; gap: 5px; width: 100%; position: relative; z-index: 1;
}
.server-rack {
  background: var(--card); border: 2px solid var(--foreground);
  border-radius: var(--r-sm); padding: 8px 12px;
  display: flex; align-items: center; gap: 10px;
  box-shadow: 3px 3px 0 var(--shadow);
}
.rack-led {
  width: 8px; height: 8px; border-radius: 50%;
  border: 1.5px solid var(--foreground); flex-shrink: 0;
}
.rack-bars {
  display: flex; gap: 3px; flex: 1;
}
.rack-bar {
  height: 4px; border-radius: 2px; background: var(--border);
}
.rack-label {
  font-family: monospace; font-size: 0.65rem; font-weight: 700;
  color: var(--muted-foreground); white-space: nowrap;
}
.rack-status-chip {
  font-size: 0.58rem; font-weight: 800; text-transform: uppercase;
  padding: 2px 6px; border-radius: 4px;
  border: 1.5px solid var(--foreground); letter-spacing: 0.05em;
}

.visual-region-chip {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  background: var(--card); border: 2px solid var(--foreground);
  border-radius: var(--r-sm); box-shadow: 2px 2px 0 var(--shadow);
  padding: 4px 10px;
  font-family: var(--font-h); font-size: 0.68rem; font-weight: 800;
  display: flex; align-items: center; gap: 4px;
}

/* billing toggle */
.billing-toggle {
  display: flex; align-items: center;
  background: var(--muted); border: 2px solid var(--foreground);
  border-radius: 999px; padding: 3px;
  box-shadow: 2px 2px 0 var(--shadow);
  margin-bottom: 18px;
}
.billing-option {
  flex: 1; text-align: center; padding: 7px 12px;
  border-radius: 999px; cursor: pointer;
  font-size: 0.78rem; font-weight: 700; color: var(--muted-foreground);
  transition: all 0.15s var(--ease); user-select: none;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.billing-option.active {
  background: var(--accent); color: #fff;
  border: 2px solid var(--foreground); box-shadow: 2px 2px 0 var(--shadow);
}
.billing-save {
  font-size: 0.6rem; background: var(--tertiary); color: var(--foreground);
  border-radius: 4px; padding: 1px 5px; font-weight: 800;
}

.card-body { padding: 22px; }

.price-area { margin-bottom: 20px; }
.price-from { font-size: 0.72rem; font-weight: 700; color: var(--muted-foreground); margin-bottom: 2px; }
.price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px; }
.price-main { font-family: var(--font-h); font-size: 2.4rem; font-weight: 900; }
.price-period { font-size: 0.8rem; font-weight: 700; color: var(--muted-foreground); }
.price-annual-note {
  font-size: 0.72rem; font-weight: 600; color: var(--muted-foreground);
  display: flex; align-items: center; gap: 4px;
}
.price-annual-note .save { color: var(--quaternary); font-weight: 800; }

.card-cta-stack { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }

.guarantee-strip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(52,211,153,0.1); border: 2px solid var(--quaternary);
  border-radius: var(--r-md); padding: 10px 12px;
  font-size: 0.75rem; font-weight: 700; margin-bottom: 18px;
  box-shadow: 2px 2px 0 var(--shadow);
}

.card-specs { display: flex; flex-direction: column; gap: 8px; padding-top: 16px; border-top: 2px solid var(--border); }
.card-spec-row { display: flex; align-items: center; justify-content: space-between; }
.cs-key { font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); display: flex; align-items: center; gap: 5px; }
.cs-val { font-size: 0.78rem; font-weight: 800; color: var(--foreground); }
.cs-val.mono { font-family: monospace; font-size: 0.72rem; color: var(--accent); }

/* ── PLAN COMPARISON TABLE ──────────────────────────────── */
.plans-section { padding: 56px 40px 0; max-width: 1200px; margin: 0 auto; }
.section-hd { margin-bottom: 24px; }
.section-title { font-family: var(--font-h); font-size: 1.5rem; font-weight: 900; }
.section-sub { font-size: 0.83rem; font-weight: 500; color: var(--muted-foreground); margin-top: 4px; }

.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 0; }
.plan-card {
  background: var(--card); border: 2px solid var(--foreground);
  border-radius: var(--r-xl); overflow: hidden;
  box-shadow: 4px 4px 0 var(--shadow);
  transition: all 0.15s var(--ease); position: relative;
}
.plan-card:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--shadow); }
.plan-card.featured {
  border-color: var(--accent);
  box-shadow: 4px 4px 0 var(--accent);
}
.plan-card.featured:hover { box-shadow: 6px 6px 0 var(--accent); }
.plan-card-header {
  padding: 20px 20px 16px; border-bottom: 2px solid var(--border);
}
.plan-name { font-family: var(--font-h); font-size: 1rem; font-weight: 800; margin-bottom: 4px; }
.plan-desc { font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); }
.plan-price-row { display: flex; align-items: baseline; gap: 4px; margin: 12px 0 4px; }
.plan-price { font-family: var(--font-h); font-size: 1.8rem; font-weight: 900; }
.plan-period { font-size: 0.78rem; font-weight: 700; color: var(--muted-foreground); }
.plan-badge-row { display: flex; gap: 6px; flex-wrap: wrap; }

.plan-specs { padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; border-bottom: 2px solid var(--border); }
.plan-spec { display: flex; align-items: center; justify-content: space-between; }
.ps-key { font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); display: flex; align-items: center; gap: 6px; }
.ps-val { font-size: 0.8rem; font-weight: 800; color: var(--foreground); }

.plan-features { padding: 14px 20px; display: flex; flex-direction: column; gap: 7px; }
.plan-feature { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 600; color: var(--foreground); }
.pf-check { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 900; border: 1.5px solid var(--foreground); }
.pf-x { opacity: 0.3; }

.plan-footer { padding: 14px 20px; }

.featured-ribbon {
  position: absolute; top: 14px; right: -1px;
  background: var(--accent); color: #fff;
  font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
  padding: 3px 10px 3px 12px; border-radius: 4px 0 0 4px;
  border: 2px solid var(--foreground); border-right: none;
  box-shadow: -2px 2px 0 var(--shadow);
}

/* ── FEATURES GRID ──────────────────────────────────────── */
.features-section { padding: 56px 40px 0; max-width: 1200px; margin: 0 auto; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feature-card {
  background: var(--card); border: 2px solid var(--foreground);
  border-radius: var(--r-xl); padding: 22px;
  box-shadow: 4px 4px 0 var(--shadow);
  transition: all 0.15s var(--ease); position: relative; overflow: hidden;
}
.feature-card:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--shadow); }
.feat-icon {
  width: 40px; height: 40px; border-radius: var(--r-sm);
  border: 2px solid var(--foreground); box-shadow: 2px 2px 0 var(--shadow);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; margin-bottom: 12px;
}
.feat-title { font-family: var(--font-h); font-size: 0.95rem; font-weight: 800; margin-bottom: 6px; }
.feat-desc { font-size: 0.8rem; font-weight: 500; color: var(--muted-foreground); line-height: 1.55; }
.feat-deco {
  position: absolute; bottom: -10px; right: -10px;
  width: 36px; height: 36px; border: 2px solid; opacity: 0.1;
  transform: rotate(45deg); border-radius: 4px;
}

/* ── SETUP TIMELINE ─────────────────────────────────────── */
.setup-section { padding: 56px 40px 0; max-width: 1200px; margin: 0 auto; }
.timeline { display: flex; gap: 0; position: relative; }
.timeline::before {
  content: ''; position: absolute; top: 28px; left: 28px; right: 28px; height: 2px;
  background: var(--border); z-index: 0;
}
.timeline-step {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 12px; position: relative; z-index: 1;
}
.step-circle {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--card); border: 2px solid var(--foreground);
  box-shadow: 3px 3px 0 var(--shadow);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-h); font-weight: 900; font-size: 1rem;
}
.step-title { font-family: var(--font-h); font-size: 0.85rem; font-weight: 800; }
.step-desc { font-size: 0.72rem; font-weight: 500; color: var(--muted-foreground); line-height: 1.5; }

/* ── REVIEWS ────────────────────────────────────────────── */
.reviews-section { padding: 56px 40px 0; max-width: 1200px; margin: 0 auto; }
.reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.review-card {
  background: var(--card); border: 2px solid var(--foreground);
  border-radius: var(--r-xl); padding: 20px;
  box-shadow: 4px 4px 0 var(--shadow);
  transition: all 0.15s var(--ease);
}
.review-card:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--shadow); }
.review-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.review-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px solid var(--foreground); box-shadow: 2px 2px 0 var(--shadow);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-h); font-weight: 800; font-size: 0.78rem; color: #fff;
  flex-shrink: 0;
}
.review-name { font-weight: 700; font-size: 0.85rem; }
.review-date { font-size: 0.68rem; color: var(--muted-foreground); font-weight: 600; }
.review-stars { display: flex; gap: 2px; margin-bottom: 8px; }
.rev-star {
  width: 14px; height: 14px; border-radius: 2px;
  background: var(--tertiary); border: 1.5px solid var(--foreground);
  display: flex; align-items: center; justify-content: center; font-size: 0.5rem;
}
.review-text { font-size: 0.8rem; font-weight: 500; color: var(--muted-foreground); line-height: 1.55; }
.review-plan {
  margin-top: 10px; display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--accent);
}

/* ── DETAILS CARD ──────────────────────────────────────── */
.details-card {
  background: var(--card); border: 2px solid var(--foreground);
  border-radius: var(--r-md); padding: 22px;
  box-shadow: 4px 4px 0 var(--shadow);
}
.details-content {
  font-size: 0.9rem; font-weight: 500; color: var(--foreground); line-height: 1.8;
}
.details-content p { margin: 0 0 12px 0; }
.details-content p:last-child { margin-bottom: 0; }
.details-content ul, .details-content ol { margin: 0 0 12px 0; padding-left: 20px; }
.details-content li { margin-bottom: 6px; }

/* ── FAQ ────────────────────────────────────────────────── */
.faq-section { padding: 56px 40px 72px; max-width: 1200px; margin: 0 auto; }
.faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.faq-item {
  background: var(--card); border: 2px solid var(--foreground);
  border-radius: var(--r-md); overflow: hidden;
  box-shadow: 4px 4px 0 var(--shadow);
}
.faq-question {
  padding: 16px 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--font-h); font-size: 0.9rem; font-weight: 800;
  transition: background 0.15s;
}
.faq-question:hover { background: var(--muted); }
.faq-chevron {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--muted); border: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: transform 0.2s var(--ease), background 0.15s;
}
.faq-item.open .faq-chevron { transform: rotate(180deg); background: var(--accent); border-color: var(--accent); }
.faq-item.open .faq-chevron svg { color: #fff; }
.faq-answer {
  max-height: 0; overflow: hidden;
  transition: max-height 0.3s ease;
}
.faq-item.open .faq-answer { max-height: 200px; }
.faq-answer-inner {
  padding: 0 20px 16px;
  font-size: 0.82rem; font-weight: 500; color: var(--muted-foreground); line-height: 1.65;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

/* ── STICKY BOTTOM BAR ──────────────────────────────────── */
.sticky-bar {
  display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  background: var(--card); border-top: 2px solid var(--foreground);
  box-shadow: 0 -4px 0 var(--shadow);
  padding: 12px 20px; align-items: center; justify-content: space-between; gap: 12px;
}

/* ── DIVIDER ────────────────────────────────────────────── */
.divider { height: 2px; background: var(--border); margin: 56px 40px 0; max-width: 1120px; }

/* ── TOAST ──────────────────────────────────────────────── */
#toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  background: var(--foreground); color: #fff;
  border: 2px solid var(--foreground); border-radius: var(--r-md);
  padding: 12px 18px; font-size: 0.82rem; font-weight: 700;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.2);
  display: none; align-items: center; gap: 8px;
}

/* ── ANIMATIONS ─────────────────────────────────────────── */
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes popIn  { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }
@keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

.hero-left  { animation: fadeUp 0.38s var(--ease) both; }
.purchase-card { animation: popIn 0.38s var(--ease) 0.08s both; }
.plan-card:nth-child(1) { animation: fadeUp 0.32s var(--ease) 0.04s both; }
.plan-card:nth-child(2) { animation: fadeUp 0.32s var(--ease) 0.09s both; }
.plan-card:nth-child(3) { animation: fadeUp 0.32s var(--ease) 0.14s both; }
.feature-card:nth-child(1) { animation: fadeUp 0.3s var(--ease) 0.04s both; }
.feature-card:nth-child(2) { animation: fadeUp 0.3s var(--ease) 0.09s both; }
.feature-card:nth-child(3) { animation: fadeUp 0.3s var(--ease) 0.14s both; }
.feature-card:nth-child(4) { animation: fadeUp 0.3s var(--ease) 0.19s both; }
.feature-card:nth-child(5) { animation: fadeUp 0.3s var(--ease) 0.24s both; }
.feature-card:nth-child(6) { animation: fadeUp 0.3s var(--ease) 0.29s both; }
.led-pulse { animation: pulse 2s ease-in-out infinite; }

@media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; } }

@media(max-width:1024px) {
  .hero { grid-template-columns: 1fr; padding: 32px 20px 0; }
  .purchase-card { position: static; }
  .spec-grid { grid-template-columns: repeat(2,1fr); }
  .plans-grid, .features-grid, .reviews-grid { grid-template-columns: 1fr 1fr; }
  .timeline { flex-direction: column; gap: 20px; }
  .timeline::before { display: none; }
  .faq-grid { grid-template-columns: 1fr; }
  .sticky-bar { display: flex; }
  body { padding-bottom: 80px; }
  .plans-section,.features-section,.setup-section,.reviews-section,.faq-section { padding-left:20px;padding-right:20px; }
  .divider { margin-left:20px;margin-right:20px; }
}
@media(max-width:640px) {
  .plans-grid,.features-grid,.reviews-grid { grid-template-columns:1fr; }
  .hero-title { font-size:2rem; }
  .spec-grid { grid-template-columns:repeat(2,1fr); }
}

/* ── DIGITAL PRODUCT SPECIFIC ──────────────────────────── */
.digital-visual {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 60%, #FCD34D 100%);
  border-bottom: 2px solid var(--foreground);
  padding: 28px 24px 20px;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 140px;
}
.digital-pattern {
  display: flex; flex-direction: column; gap: 6px;
}
.pattern-row {
  display: flex; gap: 6px;
}
.pattern-block {
  width: 36px; height: 36px;
  border: 2px solid var(--foreground);
  border-radius: var(--r-sm);
  box-shadow: 3px 3px 0 var(--shadow);
}
.digital-visual .product-type-label {
  margin-top: 14px;
  font-family: var(--font-h); font-size: 0.75rem; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--foreground);
}
</style>

<div class="page">

@if($isDroplet)
  @include('catalog.partials.product-droplet')
@else
  @include('catalog.partials.product-digital')
@endif

</div>

<!-- TOAST -->
<div id="toast"></div>

<script>
function toggleFaq(questionEl) {
  const item = questionEl.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

function showToast(msg, bg) {
  const el = document.getElementById('toast');
  el.style.background = bg || 'var(--foreground)';
  el.style.borderColor = 'var(--foreground)';
  el.style.color = '#fff';
  el.textContent = msg;
  el.style.display = 'flex';
  setTimeout(() => el.style.display = 'none', 3000);
}

@if($isDroplet)
let billing = 'monthly';
function setBilling(type, el) {
  billing = type;
  document.querySelectorAll('.billing-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  const pm = document.getElementById('priceMain');
  const pp = document.getElementById('pricePeriod');
  const pn = document.getElementById('priceNote');
  const sp = document.getElementById('stickyPrice');
  if (type === 'annual') {
    pm.textContent = '{{ $currency }} {{ $annualMonthly }}';
    pp.textContent = '/month';
    pn.style.opacity = '1';
    if (sp) sp.innerHTML = '{{ $currency }} {{ $annualMonthly }}<span style="font-size:0.75rem;font-weight:700;color:var(--muted-foreground)">/mo</span>';
  } else {
    pm.textContent = '{{ $currency }} {{ $formattedAmount }}';
    pp.textContent = '/month';
    pn.style.opacity = '0';
    if (sp) sp.innerHTML = '{{ $currency }} {{ $formattedAmount }}<span style="font-size:0.75rem;font-weight:700;color:var(--muted-foreground)">/mo</span>';
  }
}
@endif
</script>
@endsection
