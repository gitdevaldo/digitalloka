{{-- VPS/Droplet Product Template - Matches digitalloka-product-vps.html exactly --}}

<!-- ── HERO ─────────────────────────────────────────── -->
<section class="hero">

  <!-- LEFT -->
  <div class="hero-left">
    <div class="breadcrumb">
      <a href="/">Home</a><span class="sep">/</span>
      <a href="/">VPS</a><span class="sep">/</span>
      <span style="color:var(--foreground);font-weight:700">{{ $product['name'] ?? 'VPS Product' }}</span>
    </div>

    <div class="hero-badge-row">
      <span class="badge b-green"><span class="dot"></span>{{ $status }}</span>
      <span class="badge b-accent"><span class="dot"></span>🖥️ VPS Account</span>
      <span class="badge b-amber"><span class="dot"></span>🔥 Most popular</span>
    </div>

    <h1 class="hero-title">
      Your cloud server,<br>
      ready in <span class="hl">60 seconds.</span>
    </h1>

    <p class="hero-tagline">
      {{ $product['short_description'] ?? 'A fully managed VPS account with root access, a dedicated IP, pre-installed stack, and a control panel dashboard — instantly after checkout. No setup fees, no contracts.' }}
    </p>

    <!-- Spec strip -->
    <div class="spec-grid">
      <div class="spec-cell">
        <div class="spec-label">vCPU</div>
        <div class="spec-value">{{ $specs['vcpu'] }} Core</div>
        <div class="spec-sub">Dedicated</div>
      </div>
      <div class="spec-cell">
        <div class="spec-label">RAM</div>
        <div class="spec-value">{{ $specs['ram'] }} GB</div>
        <div class="spec-sub">DDR4 ECC</div>
      </div>
      <div class="spec-cell">
        <div class="spec-label">SSD</div>
        <div class="spec-value">{{ $specs['storage'] }} GB</div>
        <div class="spec-sub">NVMe</div>
      </div>
      <div class="spec-cell" style="border-right:none">
        <div class="spec-label">Bandwidth</div>
        <div class="spec-value">{{ $specs['bandwidth'] }} TB</div>
        <div class="spec-sub">per month</div>
      </div>
    </div>

    <!-- Uptime / status -->
    <div class="status-row">
      <span class="badge b-green" style="font-size:0.68rem"><span class="dot led-pulse"></span>99.99% uptime SLA</span>
      <div class="uptime-bar"><div class="uptime-fill" style="width:99.9%"></div></div>
      <span class="uptime-label">Last 90 days</span>
    </div>

    <!-- What's included -->
    <div class="includes-title">What you get with your account</div>
    <div class="checklist">
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Dedicated public IPv4 address — yours for the subscription lifetime
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Root SSH access + web-based terminal in the dashboard
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Choice of OS: Ubuntu 24.04, Debian 12, or Rocky Linux 9
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        One-click Power On / Off / Reboot from your dashboard
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Private network and firewall rules included
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Weekly automated snapshots — restore in one click
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        24/7 infrastructure monitoring with email alerts
      </div>
    </div>
  </div>

  <!-- RIGHT: PURCHASE CARD -->
  <div class="purchase-card">

    <!-- Server visual -->
    <div class="card-visual">
      <div class="visual-region-chip">🇸🇬 {{ $specs['datacenter'] }} · {{ $specs['region'] }}</div>
      <div class="server-stack">
        <div class="server-rack">
          <div class="rack-led led-pulse" style="background:var(--quaternary)"></div>
          <div class="rack-bars">
            <div class="rack-bar" style="flex:3;background:var(--accent)"></div>
            <div class="rack-bar" style="flex:2;background:var(--quaternary)"></div>
            <div class="rack-bar" style="flex:1"></div>
          </div>
          <div class="rack-label">cpu</div>
          <div class="rack-status-chip" style="background:var(--quaternary)">Active</div>
        </div>
        <div class="server-rack">
          <div class="rack-led" style="background:var(--tertiary)"></div>
          <div class="rack-bars">
            <div class="rack-bar" style="flex:2;background:var(--tertiary)"></div>
            <div class="rack-bar" style="flex:4"></div>
          </div>
          <div class="rack-label">mem</div>
          <div class="rack-status-chip" style="background:var(--muted);color:var(--muted-foreground)">48%</div>
        </div>
        <div class="server-rack">
          <div class="rack-led" style="background:var(--accent)"></div>
          <div class="rack-bars">
            <div class="rack-bar" style="flex:1;background:var(--accent)"></div>
            <div class="rack-bar" style="flex:5"></div>
          </div>
          <div class="rack-label">disk</div>
          <div class="rack-status-chip" style="background:var(--muted);color:var(--muted-foreground)">12%</div>
        </div>
      </div>
    </div>

    <!-- Billing toggle -->
    <div style="padding:18px 22px 0">
      <div class="billing-toggle" id="billingToggle">
        <div class="billing-option active" onclick="setBilling('monthly', this)">Monthly</div>
        <div class="billing-option" onclick="setBilling('annual', this)">
          Annual
          <span class="billing-save">–20%</span>
        </div>
      </div>
    </div>

    <div class="card-body">
      <div class="price-area">
        <div class="price-from">Starting from</div>
        <div class="price-row">
          <div class="price-main" id="priceMain">{{ $currency }} {{ $formattedAmount }}</div>
          <div class="price-period" id="pricePeriod">/month</div>
        </div>
        <div class="price-annual-note" id="priceNote" style="opacity:0">
          Billed as <span class="save" id="priceAnnual">{{ $currency }} {{ $annualTotal }}/year</span> · You save {{ $currency }} {{ $savings }}
        </div>
      </div>

      <div class="card-cta-stack">
        <button class="btn btn-accent btn-lg btn-full" onclick="showToast('🚀 Redirecting to checkout — almost there!', 'var(--accent)')">
          <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
          Deploy my server
        </button>
        <button class="btn btn-ghost btn-full" onclick="showToast('🔧 Launching live demo console…', 'var(--foreground)')">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          Try demo console
        </button>
      </div>

      <div class="guarantee-strip">
        <span style="font-size:1.1rem">🛡️</span>
        <span>7-day full refund if you're not satisfied.</span>
      </div>

      <div class="card-specs">
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Setup time
          </span>
          <span class="cs-val">~60 seconds</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Region
          </span>
          <span class="cs-val">{{ $specs['region'] }} ({{ $specs['datacenter'] }})</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Contract
          </span>
          <span class="cs-val">No lock-in</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Access
          </span>
          <span class="cs-val mono">root SSH + dashboard</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Renewal
          </span>
          <span class="cs-val">Auto-renews, cancel anytime</span>
        </div>
      </div>
    </div>
  </div>

</section>

<!-- ── PLAN COMPARISON ──────────────────────────────── -->
<div class="divider"></div>
<section class="plans-section">
  <div class="section-hd">
    <div class="section-title">Compare plans</div>
    <div class="section-sub">All plans include root access, dedicated IP, and 24/7 monitoring. Upgrade or downgrade anytime.</div>
  </div>
  <div class="plans-grid">

    <!-- Starter -->
    <div class="plan-card">
      <div class="plan-card-header">
        <div class="plan-name">Starter</div>
        <div class="plan-desc">For personal projects & learning</div>
        <div class="plan-price-row">
          <div class="plan-price">{{ $currency }} 90.000</div>
          <div class="plan-period">/month</div>
        </div>
        <div class="plan-badge-row"><span class="badge b-muted" style="font-size:0.58rem">1 vCPU · 1 GB RAM</span></div>
      </div>
      <div class="plan-specs">
        <div class="plan-spec"><span class="ps-key">💾 Storage</span><span class="ps-val">25 GB NVMe</span></div>
        <div class="plan-spec"><span class="ps-key">🌐 Bandwidth</span><span class="ps-val">1 TB/mo</span></div>
        <div class="plan-spec"><span class="ps-key">🌍 Regions</span><span class="ps-val">1 region</span></div>
        <div class="plan-spec"><span class="ps-key">📸 Snapshots</span><span class="ps-val">1 included</span></div>
      </div>
      <div class="plan-features">
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Root SSH access</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Dedicated IPv4</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Web dashboard</div>
        <div class="plan-feature pf-x"><div class="pf-check" style="background:var(--muted)">✕</div>Private networking</div>
        <div class="plan-feature pf-x"><div class="pf-check" style="background:var(--muted)">✕</div>Weekly backups</div>
      </div>
      <div class="plan-footer">
        <button class="btn btn-full btn-sm" onclick="showToast('🚀 Redirecting to Starter checkout…','var(--quaternary)')">Get Starter</button>
      </div>
    </div>

    <!-- Developer Pro (featured) - Current product -->
    <div class="plan-card featured">
      <div class="featured-ribbon">Most Popular</div>
      <div class="plan-card-header">
        <div class="plan-name">{{ $product['name'] ?? 'Developer Pro' }}</div>
        <div class="plan-desc">For production apps & teams</div>
        <div class="plan-price-row">
          <div class="plan-price" style="color:var(--accent)">{{ $currency }} {{ $formattedAmount }}</div>
          <div class="plan-period">/month</div>
        </div>
        <div class="plan-badge-row">
          <span class="badge b-accent" style="font-size:0.58rem">{{ $specs['vcpu'] }} vCPU · {{ $specs['ram'] }} GB RAM</span>
          <span class="badge b-amber" style="font-size:0.58rem">⭐ You're here</span>
        </div>
      </div>
      <div class="plan-specs">
        <div class="plan-spec"><span class="ps-key">💾 Storage</span><span class="ps-val">{{ $specs['storage'] }} GB NVMe</span></div>
        <div class="plan-spec"><span class="ps-key">🌐 Bandwidth</span><span class="ps-val">{{ $specs['bandwidth'] }} TB/mo</span></div>
        <div class="plan-spec"><span class="ps-key">🌍 Regions</span><span class="ps-val">3 regions</span></div>
        <div class="plan-spec"><span class="ps-key">📸 Snapshots</span><span class="ps-val">5 included</span></div>
      </div>
      <div class="plan-features">
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Root SSH access</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Dedicated IPv4</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Web dashboard</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Private networking</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Weekly backups</div>
      </div>
      <div class="plan-footer">
        <button class="btn btn-accent btn-full btn-sm" onclick="showToast('🚀 Redirecting to checkout…','var(--accent)')">Deploy Now</button>
      </div>
    </div>

    <!-- Business -->
    <div class="plan-card">
      <div class="plan-card-header">
        <div class="plan-name">Business</div>
        <div class="plan-desc">High-traffic apps and databases</div>
        <div class="plan-price-row">
          <div class="plan-price">{{ $currency }} 320.000</div>
          <div class="plan-period">/month</div>
        </div>
        <div class="plan-badge-row"><span class="badge b-muted" style="font-size:0.58rem">4 vCPU · 8 GB RAM</span></div>
      </div>
      <div class="plan-specs">
        <div class="plan-spec"><span class="ps-key">💾 Storage</span><span class="ps-val">160 GB NVMe</span></div>
        <div class="plan-spec"><span class="ps-key">🌐 Bandwidth</span><span class="ps-val">8 TB/mo</span></div>
        <div class="plan-spec"><span class="ps-key">🌍 Regions</span><span class="ps-val">All regions</span></div>
        <div class="plan-spec"><span class="ps-key">📸 Snapshots</span><span class="ps-val">Unlimited</span></div>
      </div>
      <div class="plan-features">
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Root SSH access</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Dedicated IPv4</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Web dashboard</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Private networking</div>
        <div class="plan-feature"><div class="pf-check" style="background:var(--quaternary)">✓</div>Daily backups</div>
      </div>
      <div class="plan-footer">
        <button class="btn btn-full btn-sm btn-tertiary" onclick="showToast('🚀 Redirecting to Business checkout…','var(--tertiary)')">Get Business</button>
      </div>
    </div>

  </div>
</section>

<!-- ── FEATURES ──────────────────────────────────────── -->
<div class="divider"></div>
<section class="features-section">
  <div class="section-hd">
    <div class="section-title">Everything in your account</div>
    <div class="section-sub">Managed for you — you just build on top of it</div>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(139,92,246,0.1)">⚡</div>
      <div class="feat-title">Instant provisioning</div>
      <div class="feat-desc">Server spins up in under 60 seconds after checkout. Credentials delivered to your email and dashboard immediately.</div>
      <div class="feat-deco" style="color:var(--accent)"></div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(52,211,153,0.12)">🖥️</div>
      <div class="feat-title">Full control dashboard</div>
      <div class="feat-desc">Power on, off, reboot, rebuild OS, resize — all from your DigitalLoka account dashboard. No SSH required for management.</div>
      <div class="feat-deco" style="color:var(--quaternary)"></div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(251,191,36,0.15)">🔑</div>
      <div class="feat-title">Root SSH + web terminal</div>
      <div class="feat-desc">Full root access over SSH with your own key pair. Plus a browser-based web terminal for quick commands without a local client.</div>
      <div class="feat-deco" style="color:var(--tertiary)"></div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(244,114,182,0.12)">📸</div>
      <div class="feat-title">Snapshots & backups</div>
      <div class="feat-desc">Weekly automated snapshots included. Restore your server state in one click. Manual snapshots available on demand anytime.</div>
      <div class="feat-deco" style="color:var(--secondary)"></div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(139,92,246,0.1)">🌐</div>
      <div class="feat-title">Private networking</div>
      <div class="feat-desc">Connect multiple servers on an internal VLAN. Zero-cost private traffic between your servers within the same region.</div>
      <div class="feat-deco" style="color:var(--accent)"></div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(52,211,153,0.12)">📊</div>
      <div class="feat-title">Live monitoring</div>
      <div class="feat-desc">CPU, RAM, disk, and bandwidth usage charts in real time. Set alert thresholds and get email notifications before you hit limits.</div>
      <div class="feat-deco" style="color:var(--quaternary)"></div>
    </div>
  </div>
</section>

<!-- ── SETUP TIMELINE ────────────────────────────────── -->
<div class="divider"></div>
<section class="setup-section">
  <div class="section-hd">
    <div class="section-title">Up and running in 4 steps</div>
    <div class="section-sub">From checkout to a live server — under 5 minutes</div>
  </div>
  <div class="timeline">
    <div class="timeline-step">
      <div class="step-circle" style="background:rgba(139,92,246,0.1)">1</div>
      <div class="step-title">Choose your plan</div>
      <div class="step-desc">Pick a plan and region. Monthly or annual billing, cancel any time.</div>
    </div>
    <div class="timeline-step">
      <div class="step-circle" style="background:rgba(251,191,36,0.15)">2</div>
      <div class="step-title">Complete checkout</div>
      <div class="step-desc">Pay securely. Your account and server entitlement is created instantly.</div>
    </div>
    <div class="timeline-step">
      <div class="step-circle" style="background:rgba(52,211,153,0.12)">3</div>
      <div class="step-title">Server provisioned</div>
      <div class="step-desc">Your VPS spins up in ~60s. OS, IP, and SSH credentials ready in your dashboard.</div>
    </div>
    <div class="timeline-step">
      <div class="step-circle" style="background:rgba(244,114,182,0.12)">4</div>
      <div class="step-title">Start building</div>
      <div class="step-desc">SSH in or use the web terminal. Full root access from the moment you log in.</div>
    </div>
  </div>
</section>

<!-- ── REVIEWS ───────────────────────────────────────── -->
<div class="divider"></div>
<section class="reviews-section">
  <div class="section-hd" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div>
      <div class="section-title">What customers say</div>
      <div class="section-sub"><span style="font-family:var(--font-h);font-weight:900;color:var(--foreground)">{{ number_format($product['rating'] ?? 4.8, 1) }}</span> out of 5 · {{ $product['reviews_count'] ?? 184 }} verified reviews</div>
    </div>
    <button class="btn btn-ghost btn-sm">Write a review</button>
  </div>
  <div class="reviews-grid">
    <div class="review-card">
      <div class="review-top">
        <div class="review-avatar" style="background:linear-gradient(135deg,var(--accent),var(--secondary))">BI</div>
        <div><div class="review-name">Budi I.</div><div class="review-date">Apr 1, 2026</div></div>
      </div>
      <div class="review-stars">
        <div class="rev-star">★</div><div class="rev-star">★</div><div class="rev-star">★</div><div class="rev-star">★</div><div class="rev-star">★</div>
      </div>
      <div class="review-text">Server was live in literally 50 seconds. I've used 4 different VPS providers — the dashboard here is the cleanest by far. The one-click reboot actually works instantly unlike some others I won't name.</div>
      <div class="review-plan">📦 {{ $product['name'] ?? 'Developer Pro' }} plan</div>
    </div>
    <div class="review-card">
      <div class="review-top">
        <div class="review-avatar" style="background:linear-gradient(135deg,var(--quaternary),var(--accent))">DS</div>
        <div><div class="review-name">Dewi S.</div><div class="review-date">Mar 20, 2026</div></div>
      </div>
      <div class="review-stars">
        <div class="rev-star">★</div><div class="rev-star">★</div><div class="rev-star">★</div><div class="rev-star">★</div><div class="rev-star">★</div>
      </div>
      <div class="review-text">Finally a VPS that's not just sold as a raw droplet. Having the full dashboard in my account page, with power controls and monitoring charts, means my clients can self-serve without calling me.</div>
      <div class="review-plan">📦 Business plan</div>
    </div>
    <div class="review-card">
      <div class="review-top">
        <div class="review-avatar" style="background:linear-gradient(135deg,var(--tertiary),var(--secondary))">RH</div>
        <div><div class="review-name">Rafi H.</div><div class="review-date">Mar 8, 2026</div></div>
      </div>
      <div class="review-stars">
        <div class="rev-star">★</div><div class="rev-star">★</div><div class="rev-star">★</div><div class="rev-star">★</div><div class="rev-star">★</div>
      </div>
      <div class="review-text">Migrated from another provider — zero downtime, IP transferred same day. SGP1 latency from Jakarta is consistently under 8ms. The weekly snapshot saved me once already when I broke a config.</div>
      <div class="review-plan">📦 {{ $product['name'] ?? 'Developer Pro' }} plan</div>
    </div>
  </div>
</section>

<!-- ── FAQ ───────────────────────────────────────────── -->
<div class="divider"></div>
<section class="faq-section">
  <div class="section-hd">
    <div class="section-title">Frequently asked questions</div>
    <div class="section-sub">Everything you need to know before deploying</div>
  </div>
  <div class="faq-grid" id="faqGrid">

    @if(!empty($product['faq_items']) && is_array($product['faq_items']))
      @foreach($product['faq_items'] as $faq)
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          {{ $faq['question'] ?? '' }}
          <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
        <div class="faq-answer"><div class="faq-answer-inner">{{ $faq['answer'] ?? '' }}</div></div>
      </div>
      @endforeach
    @else
      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          What happens right after I pay?
          <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
        <div class="faq-answer"><div class="faq-answer-inner">Your order is fulfilled instantly. Your server entitlement is created, a VPS is provisioned in {{ $specs['datacenter'] }}, and your dashboard unlocks the server controls — all within ~60 seconds. You'll also receive an email with your IP and SSH instructions.</div></div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          Can I upgrade or downgrade my plan later?
          <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
        <div class="faq-answer"><div class="faq-answer-inner">Yes. You can upgrade your plan at any time from your dashboard — the difference is prorated to the current billing cycle. Downgrades take effect at the next renewal date. Your data and IP are preserved across all plan changes.</div></div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          Do I get a dedicated IP address?
          <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
        <div class="faq-answer"><div class="faq-answer-inner">Yes, every VPS account includes one dedicated public IPv4 address. The IP is assigned at provisioning and stays with your server for the duration of your subscription. Additional IPs can be purchased separately.</div></div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          What OS options are available?
          <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
        <div class="faq-answer"><div class="faq-answer-inner">You can choose Ubuntu 24.04 LTS, Debian 12, or Rocky Linux 9 at checkout. You can also rebuild with a different OS at any time from your dashboard — note this wipes all server data, so snapshot first.</div></div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          How does the refund policy work?
          <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
        <div class="faq-answer"><div class="faq-answer-inner">We offer a 7-day full refund — no questions asked. If you request a refund within 7 days of your first payment, we'll process it immediately. Refunds for renewal cycles are not available, only for new subscriptions.</div></div>
      </div>

      <div class="faq-item">
        <div class="faq-question" onclick="toggleFaq(this)">
          Is this managed or unmanaged hosting?
          <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
        </div>
        <div class="faq-answer"><div class="faq-answer-inner">The infrastructure is fully managed — hardware, hypervisor, network, and backups are our responsibility. The OS and everything above it is yours to configure. You have full root access. We manage the metal; you manage your stack.</div></div>
      </div>
    @endif

  </div>
</section>

<!-- STICKY BOTTOM BAR -->
<div class="sticky-bar" id="stickyBar">
  <div>
    <div style="font-family:var(--font-h);font-weight:900;font-size:1.2rem" id="stickyPrice">{{ $currency }} {{ $formattedAmount }}<span style="font-size:0.75rem;font-weight:700;color:var(--muted-foreground)">/mo</span></div>
    <div style="font-size:0.68rem;font-weight:600;color:var(--muted-foreground)">{{ $product['name'] ?? 'Developer Pro' }} · {{ $specs['datacenter'] }}</div>
  </div>
  <button class="btn btn-accent" style="flex:1;max-width:220px;justify-content:center" onclick="showToast('🚀 Redirecting to checkout…','var(--accent)')">
    Deploy my server
  </button>
</div>
