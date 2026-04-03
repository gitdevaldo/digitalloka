{{-- Digital Product Template - For accounts, apikeys, and other non-VPS products --}}

<!-- ── HERO ─────────────────────────────────────────── -->
<section class="hero">

  <!-- LEFT -->
  <div class="hero-left">
    <div class="breadcrumb">
      <a href="/">Home</a><span class="sep">/</span>
      <a href="/">{{ $category }}</a><span class="sep">/</span>
      <span style="color:var(--foreground);font-weight:700">{{ $product['name'] ?? 'Digital Product' }}</span>
    </div>

    <div class="hero-badge-row">
      <span class="badge b-green"><span class="dot"></span>{{ $status }}</span>
      <span class="badge b-accent"><span class="dot"></span>{{ $productType }}</span>
      <span class="badge b-amber"><span class="dot"></span>{{ $category }}</span>
    </div>

    <h1 class="hero-title">
      {{ $product['name'] ?? 'Digital Product' }}<br>
      <span class="hl">ready now.</span>
    </h1>

    <p class="hero-tagline">
      {{ $product['short_description'] ?? 'A digital product with instant delivery and clear lifecycle management. Purchase securely and access immediately from your dashboard.' }}
    </p>

    <!-- Spec strip -->
    <div class="spec-grid">
      <div class="spec-cell">
        <div class="spec-label">Category</div>
        <div class="spec-value">{{ $category }}</div>
        <div class="spec-sub">Catalog group</div>
      </div>
      <div class="spec-cell">
        <div class="spec-label">Type</div>
        <div class="spec-value">{{ $productType }}</div>
        <div class="spec-sub">Digital delivery</div>
      </div>
      <div class="spec-cell">
        <div class="spec-label">Status</div>
        <div class="spec-value">{{ $status }}</div>
        <div class="spec-sub">Availability</div>
      </div>
      <div class="spec-cell" style="border-right:none">
        <div class="spec-label">Support</div>
        <div class="spec-value">Included</div>
        <div class="spec-sub">Account lifecycle</div>
      </div>
    </div>

    <!-- What's included -->
    <div class="includes-title">What you get with your purchase</div>
    <div class="checklist">
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Instant delivery after checkout — access from your dashboard immediately
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Clear ownership and entitlement tracking in your account
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Status and renewal information always visible
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Secure credential handling and storage
      </div>
      <div class="check-item">
        <div class="check-icon" style="background:var(--quaternary)">✓</div>
        Customer support included for product lifecycle
      </div>
    </div>
  </div>

  <!-- RIGHT: PURCHASE CARD -->
  <div class="purchase-card">

    <!-- Digital product visual -->
    <div class="digital-visual">
      <div class="product-icon">
        @if(str_contains(strtolower($productType), 'account'))
          👤
        @elseif(str_contains(strtolower($productType), 'api'))
          🔑
        @elseif(str_contains(strtolower($productType), 'license'))
          📄
        @elseif(str_contains(strtolower($productType), 'subscription'))
          🔄
        @else
          📦
        @endif
      </div>
      <div class="product-type-label">{{ $productType }}</div>
    </div>

    <div class="card-body">
      <div class="price-area">
        <div class="price-from">Price</div>
        <div class="price-row">
          <div class="price-main">{{ $currency }} {{ $formattedAmount }}</div>
          <div class="price-period">/ {{ $billingPeriod }}</div>
        </div>
      </div>

      <div class="card-cta-stack">
        <a class="btn btn-accent btn-lg btn-full" href="/wishlist">
          <svg width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Add to wishlist
        </a>
        <a class="btn btn-ghost btn-full" href="/">
          <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Back to catalog
        </a>
      </div>

      <div class="card-specs">
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Delivery
          </span>
          <span class="cs-val">Instant</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Access
          </span>
          <span class="cs-val">Dashboard</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Security
          </span>
          <span class="cs-val">Encrypted</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Support
          </span>
          <span class="cs-val">Included</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Billing
          </span>
          <span class="cs-val">{{ ucfirst($billingPeriod) }}</span>
        </div>
      </div>
    </div>
  </div>

</section>

<!-- ── PRODUCT HIGHLIGHTS ──────────────────────────────── -->
<div class="divider"></div>
<section class="features-section">
  <div class="section-hd">
    <div class="section-title">Product highlights</div>
    <div class="section-sub">Core capabilities and what you can expect</div>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(139,92,246,0.1)">⚡</div>
      <div class="feat-title">Instant delivery</div>
      <div class="feat-desc">Your product is activated immediately after checkout. No waiting — access it directly from your DigitalLoka dashboard.</div>
      <div class="feat-deco" style="color:var(--accent)"></div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(52,211,153,0.12)">🔒</div>
      <div class="feat-title">Secure storage</div>
      <div class="feat-desc">All credentials and access details are stored securely. View them anytime from your account with proper authentication.</div>
      <div class="feat-deco" style="color:var(--quaternary)"></div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:rgba(251,191,36,0.15)">📊</div>
      <div class="feat-title">Usage tracking</div>
      <div class="feat-desc">Monitor your product status, renewal dates, and any usage metrics directly from your dashboard.</div>
      <div class="feat-deco" style="color:var(--tertiary)"></div>
    </div>
  </div>
</section>

<!-- ── PRODUCT DESCRIPTION ──────────────────────────────── -->
@if(!empty($product['description']))
<div class="divider"></div>
<section class="features-section">
  <div class="section-hd">
    <div class="section-title">Product details</div>
    <div class="section-sub">Full description and specifications</div>
  </div>
  <div class="feature-card" style="max-width:none">
    <div class="feat-desc" style="font-size:0.9rem;line-height:1.8">
      {!! nl2br(e($product['description'])) !!}
    </div>
  </div>
</section>
@endif

<!-- ── FAQ ───────────────────────────────────────────── -->
@if(!empty($product['faq_items']) && is_array($product['faq_items']))
<div class="divider"></div>
<section class="faq-section">
  <div class="section-hd">
    <div class="section-title">Frequently asked questions</div>
    <div class="section-sub">Common questions about this product</div>
  </div>
  <div class="faq-grid" id="faqGrid">
    @foreach($product['faq_items'] as $faq)
    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)">
        {{ $faq['question'] ?? '' }}
        <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
      <div class="faq-answer"><div class="faq-answer-inner">{{ $faq['answer'] ?? '' }}</div></div>
    </div>
    @endforeach
  </div>
</section>
@else
<div class="divider"></div>
<section class="faq-section">
  <div class="section-hd">
    <div class="section-title">Frequently asked questions</div>
    <div class="section-sub">Common questions about digital products</div>
  </div>
  <div class="faq-grid" id="faqGrid">
    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)">
        How do I access my product after purchase?
        <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
      <div class="faq-answer"><div class="faq-answer-inner">After completing checkout, your product will appear immediately in your DigitalLoka dashboard under "My Products". All credentials and access information will be available there.</div></div>
    </div>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)">
        What payment methods are accepted?
        <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
      <div class="faq-answer"><div class="faq-answer-inner">We accept various payment methods including credit cards, bank transfers, and digital wallets. All payments are processed securely through our payment partner.</div></div>
    </div>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)">
        Can I get a refund?
        <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
      <div class="faq-answer"><div class="faq-answer-inner">Refund policies vary by product type. For most digital products, we offer support to resolve any issues. Contact our support team for specific refund inquiries.</div></div>
    </div>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)">
        How do renewals work?
        <div class="faq-chevron"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
      <div class="faq-answer"><div class="faq-answer-inner">Depending on the product billing period, renewals are processed automatically. You can manage auto-renewal settings and view upcoming renewal dates in your dashboard.</div></div>
    </div>
  </div>
</section>
@endif
