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

    <!-- Spec strip - dynamic from featured field -->
    @if(!empty($featured))
    <div class="spec-grid">
      @foreach(array_slice($featured, 0, 4) as $index => $item)
      <div class="spec-cell"@if($index === 3) style="border-right:none"@endif>
        <div class="spec-label">{{ $item['label'] ?? '' }}</div>
        <div class="spec-value">{{ $item['value'] ?? '' }}</div>
        <div class="spec-sub">{{ $item['sub'] ?? '' }}</div>
      </div>
      @endforeach
    </div>
    @endif

    <!-- What's included -->
    <div class="includes-title">What you get with your purchase</div>
    <div class="checklist">
      <div class="check-item">
        <span class="check-mark"></span>
        Instant delivery after checkout — access from your dashboard immediately
      </div>
      <div class="check-item">
        <span class="check-mark"></span>
        Clear ownership and entitlement tracking in your account
      </div>
      <div class="check-item">
        <span class="check-mark"></span>
        Status and renewal information always visible
      </div>
      <div class="check-item">
        <span class="check-mark"></span>
        Secure credential handling and storage
      </div>
      <div class="check-item">
        <span class="check-mark"></span>
        Customer support included for product lifecycle
      </div>
    </div>
  </div>

  <!-- RIGHT: PURCHASE CARD -->
  <div class="purchase-card">

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
          Add to wishlist
        </a>
        <a class="btn btn-ghost btn-full" href="/">
          Back to catalog
        </a>
      </div>

      <div class="card-specs">
        <div class="card-spec-row">
          <span class="cs-key">Setup time</span>
          <span class="cs-val">Instant</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">Contract</span>
          <span class="cs-val">No lock-in</span>
        </div>
        <div class="card-spec-row">
          <span class="cs-key">Renewal</span>
          <span class="cs-val">Auto-renews</span>
        </div>
      </div>
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
  <div class="details-card">
    <div class="details-content">
      {!! $product['description'] !!}
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
