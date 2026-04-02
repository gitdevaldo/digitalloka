<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DigitalLoka — Digital Products Marketplace</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    /* ===================== TOKENS ===================== */
    :root {
      --background: #FFFDF5;
      --foreground: #1E293B;
      --muted: #F1F5F9;
      --muted-foreground: #64748B;
      --accent: #8B5CF6;
      --accent-foreground: #FFFFFF;
      --secondary: #F472B6;
      --tertiary: #FBBF24;
      --quaternary: #34D399;
      --border: #E2E8F0;
      --input: #FFFFFF;
      --card: #FFFFFF;
      --ring: #8B5CF6;
      --shadow: #1E293B;

      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;

      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-xl: 32px;

      --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* ===================== RESET ===================== */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background-color: var(--background);
      color: var(--foreground);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ===================== BG DOTS ===================== */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 0;
      background-image: radial-gradient(circle, #1E293B22 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
    }

    /* ===================== TOPBAR ===================== */
    .topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 64px;
      background: var(--card);
      border-bottom: 2px solid var(--foreground);
      box-shadow: 0 4px 0 var(--shadow);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      z-index: 100;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0;
      text-decoration: none;
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: -0.03em;
    }
    .brand-logo .box {
      background: var(--accent);
      color: var(--accent-foreground);
      border: 2px solid var(--foreground);
      box-shadow: 3px 3px 0 var(--shadow);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      gap: 0;
    }
    .brand-logo .loka { color: var(--tertiary); }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--input);
      border: 2px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 6px 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .search-bar:focus-within {
      border-color: var(--accent);
      box-shadow: 3px 3px 0 var(--accent);
    }
    .search-bar input {
      border: none;
      outline: none;
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--foreground);
      background: transparent;
      width: 200px;
    }
    .search-bar input::placeholder { color: var(--muted-foreground); }
    .search-icon { color: var(--muted-foreground); width: 16px; height: 16px; }

    .btn {
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.875rem;
      border: 2px solid var(--foreground);
      border-radius: 9999px;
      padding: 8px 18px;
      cursor: pointer;
      transition: transform 0.15s var(--ease-bounce), box-shadow 0.15s var(--ease-bounce);
      box-shadow: 3px 3px 0 var(--shadow);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }
    .btn:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--shadow); }
    .btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--shadow); }

    .btn-accent {
      background: var(--accent);
      color: var(--accent-foreground);
    }
    .btn-ghost {
      background: var(--card);
      color: var(--foreground);
    }

    /* ===================== LAYOUT ===================== */
    .page-wrapper {
      position: relative;
      z-index: 1;
      padding-top: 64px;
      display: flex;
      min-height: 100vh;
    }

    /* ===================== SIDEBAR ===================== */
    .sidebar {
      width: 256px;
      flex-shrink: 0;
      position: sticky;
      top: 64px;
      height: calc(100vh - 64px);
      overflow-y: auto;
      padding: 28px 20px;
      border-right: 2px solid var(--foreground);
      background: var(--background);
    }

    .sidebar-section { margin-bottom: 28px; }
    .sidebar-title {
      font-family: var(--font-heading);
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted-foreground);
      margin-bottom: 10px;
    }

    .filter-chip-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .filter-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: 2px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--card);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--foreground);
      transition: all 0.15s var(--ease-bounce);
      user-select: none;
      box-shadow: 2px 2px 0 transparent;
    }
    .filter-chip:hover {
      border-color: var(--accent);
      box-shadow: 2px 2px 0 var(--accent);
      transform: translate(-1px, -1px);
    }
    .filter-chip.active {
      border-color: var(--foreground);
      background: var(--accent);
      color: var(--accent-foreground);
      box-shadow: 3px 3px 0 var(--shadow);
      transform: translate(-1px, -1px);
    }
    .filter-chip .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid currentColor;
      flex-shrink: 0;
    }
    .filter-chip.active .dot { background: var(--accent-foreground); border-color: var(--accent-foreground); }

    .filter-chip .chip-count {
      margin-left: auto;
      font-size: 0.7rem;
      font-weight: 700;
      background: var(--muted);
      color: var(--muted-foreground);
      border-radius: 999px;
      padding: 1px 7px;
    }
    .filter-chip.active .chip-count {
      background: rgba(255,255,255,0.25);
      color: white;
    }

    .price-range {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .range-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--muted-foreground);
    }
    .range-row span { color: var(--foreground); font-weight: 700; }

    input[type="range"] {
      width: 100%;
      accent-color: var(--accent);
      cursor: pointer;
    }

    .sidebar-divider {
      height: 2px;
      background: var(--border);
      border-radius: 9999px;
      margin: 8px 0 20px;
    }

    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag {
      padding: 4px 10px;
      border: 2px solid var(--border);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      background: var(--card);
      transition: all 0.15s;
    }
    .tag:hover, .tag.active {
      border-color: var(--foreground);
      background: var(--tertiary);
      box-shadow: 2px 2px 0 var(--shadow);
    }

    /* ===================== MAIN CONTENT ===================== */
    .main {
      flex: 1;
      padding: 32px;
      min-width: 0;
    }

    /* Hero Strip */
    .hero-strip {
      background: var(--accent);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      box-shadow: 6px 6px 0 var(--shadow);
      padding: 32px 40px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
    }
    .hero-strip::before {
      content: '';
      position: absolute;
      top: -30px; right: 80px;
      width: 120px; height: 120px;
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 50%;
    }
    .hero-strip::after {
      content: '';
      position: absolute;
      bottom: -20px; right: 40px;
      width: 80px; height: 80px;
      border: 2px solid rgba(255,255,255,0.15);
      border-radius: 50%;
    }
    .hero-text { position: relative; z-index: 1; }
    .hero-text h1 {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 900;
      color: var(--accent-foreground);
      line-height: 1.15;
      margin-bottom: 8px;
    }
    .hero-text h1 span { color: var(--tertiary); }
    .hero-text p {
      color: rgba(255,255,255,0.8);
      font-size: 0.95rem;
      font-weight: 500;
    }
    .hero-badges {
      display: flex;
      gap: 10px;
      position: relative;
      z-index: 1;
    }
    .hero-badge {
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.35);
      border-radius: var(--radius-md);
      padding: 10px 16px;
      text-align: center;
    }
    .hero-badge .num {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 900;
      color: white;
      display: block;
    }
    .hero-badge .label {
      font-size: 0.7rem;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Toolbar row */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .result-count {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--muted-foreground);
    }
    .result-count span { color: var(--foreground); font-weight: 700; }

    .sort-select {
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 6px 10px;
      font-family: var(--font-body);
      font-size: 0.8rem;
      font-weight: 600;
      background: var(--card);
      cursor: pointer;
      color: var(--foreground);
    }
    .sort-select:focus { outline: none; border-color: var(--accent); }

    .view-toggle {
      display: flex;
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }
    .view-btn {
      padding: 6px 10px;
      background: var(--card);
      border: none;
      cursor: pointer;
      color: var(--muted-foreground);
      transition: background 0.15s;
    }
    .view-btn.active {
      background: var(--foreground);
      color: white;
    }

    /* Active filters */
    .active-filters {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .active-filter-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px 4px 12px;
      background: var(--foreground);
      color: white;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 2px solid var(--foreground);
    }
    .active-filter-tag button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      opacity: 0.7;
    }
    .active-filter-tag button:hover { opacity: 1; }
    .clear-all {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--secondary);
      cursor: pointer;
      text-decoration: underline;
      background: none;
      border: none;
    }

    /* ===================== PRODUCT GRID ===================== */
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: var(--card);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 4px 4px 0 var(--shadow);
      transition: transform 0.2s var(--ease-bounce), box-shadow 0.2s var(--ease-bounce);
      cursor: pointer;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .product-card:hover {
      transform: translate(-3px, -3px);
      box-shadow: 7px 7px 0 var(--shadow);
    }
    .product-card:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 var(--shadow);
    }

    .card-thumb {
      position: relative;
      width: 100%;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-bottom: 2px solid var(--foreground);
    }

    .card-thumb-icon {
      font-size: 3rem;
      user-select: none;
    }

    .card-badge-top {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      gap: 6px;
    }

    .badge {
      font-family: var(--font-body);
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 3px 8px;
      border: 2px solid var(--foreground);
      border-radius: 9999px;
      box-shadow: 2px 2px 0 var(--shadow);
    }
    .badge-accent { background: var(--accent); color: white; }
    .badge-tertiary { background: var(--tertiary); color: var(--foreground); }
    .badge-quaternary { background: var(--quaternary); color: var(--foreground); }
    .badge-secondary { background: var(--secondary); color: white; }
    .badge-muted { background: var(--muted); color: var(--muted-foreground); }

    .wishlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      border: 2px solid var(--foreground);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 2px 2px 0 var(--shadow);
      transition: all 0.15s var(--ease-bounce);
      font-size: 0.9rem;
    }
    .wishlist-btn:hover { transform: scale(1.15); }
    .wishlist-btn.active { background: var(--secondary); }

    .card-body {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .card-category {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted-foreground);
    }

    .card-title {
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 700;
      color: var(--foreground);
      line-height: 1.3;
    }

    .card-desc {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--muted-foreground);
      line-height: 1.5;
      flex: 1;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .card-tag {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 2px 7px;
      border: 1.5px solid var(--border);
      border-radius: 9999px;
      color: var(--muted-foreground);
    }

    .card-footer {
      padding: 12px 16px;
      border-top: 2px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .price-block { display: flex; flex-direction: column; }
    .price-main {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--foreground);
    }
    .price-original {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--muted-foreground);
      text-decoration: line-through;
    }

    .card-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--foreground);
    }
    .star { color: var(--tertiary); }

    .buy-btn {
      padding: 7px 14px;
      background: var(--accent);
      color: white;
      border: 2px solid var(--foreground);
      border-radius: 9999px;
      font-family: var(--font-body);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 2px 2px 0 var(--shadow);
      transition: all 0.15s var(--ease-bounce);
    }
    .buy-btn:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--shadow); }
    .buy-btn:active { transform: translate(1px, 1px); box-shadow: 0 0 0 var(--shadow); }

    /* ===================== SCROLLBAR ===================== */
    .sidebar::-webkit-scrollbar { width: 4px; }
    .sidebar::-webkit-scrollbar-track { background: transparent; }
    .sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

    /* ===================== EMPTY STATE ===================== */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 64px 32px;
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: var(--radius-xl);
    }
    .empty-state .icon { font-size: 3rem; margin-bottom: 12px; }
    .empty-state h3 {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .empty-state p { color: var(--muted-foreground); font-size: 0.875rem; }

    /* ===================== FOOTER ===================== */
    .footer {
      border-top: 2px solid var(--foreground);
      padding: 24px 32px;
      margin-top: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--muted-foreground);
      position: relative;
      z-index: 1;
    }

    /* ===================== ANIMATIONS ===================== */
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.92) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .product-card {
      animation: popIn 0.35s var(--ease-bounce) both;
    }
    .product-card:nth-child(1) { animation-delay: 0.04s; }
    .product-card:nth-child(2) { animation-delay: 0.08s; }
    .product-card:nth-child(3) { animation-delay: 0.12s; }
    .product-card:nth-child(4) { animation-delay: 0.16s; }
    .product-card:nth-child(5) { animation-delay: 0.20s; }
    .product-card:nth-child(6) { animation-delay: 0.24s; }
    .product-card:nth-child(7) { animation-delay: 0.28s; }
    .product-card:nth-child(8) { animation-delay: 0.32s; }

    @media (prefers-reduced-motion: reduce) {
      .product-card { animation: none; }
      .btn, .filter-chip, .buy-btn, .wishlist-btn { transition: none; }
    }

    /* ===================== RESPONSIVE ===================== */
    @media (max-width: 768px) {
      .sidebar { display: none; }
      .hero-badges { display: none; }
      .search-bar { display: none; }
      .hero-strip { padding: 24px; }
      .hero-text h1 { font-size: 1.5rem; }
      .main { padding: 20px; }
      .product-grid { grid-template-columns: 1fr; }
    }

    /* ===================== THUMB BG COLORS ===================== */
    .thumb-purple { background: linear-gradient(135deg, #EDE9FE, #DDD6FE); }
    .thumb-pink   { background: linear-gradient(135deg, #FCE7F3, #FBCFE8); }
    .thumb-amber  { background: linear-gradient(135deg, #FEF3C7, #FDE68A); }
    .thumb-green  { background: linear-gradient(135deg, #D1FAE5, #A7F3D0); }
    .thumb-blue   { background: linear-gradient(135deg, #DBEAFE, #BFDBFE); }
    .thumb-red    { background: linear-gradient(135deg, #FEE2E2, #FECACA); }
    .thumb-teal   { background: linear-gradient(135deg, #CCFBF1, #99F6E4); }
    .thumb-orange { background: linear-gradient(135deg, #FFEDD5, #FED7AA); }
  </style>
</head>
<body>

<!-- ===================== TOPBAR ===================== -->
<x-layout.topbar variant="catalog" />

<!-- ===================== PAGE WRAPPER ===================== -->
<div class="page-wrapper">

  <!-- ===================== SIDEBAR ===================== -->
  <x-layout.sidebar-shell id="catalogSidebar" :show-toggle="false">

    <div class="sidebar-section">
      <div class="sidebar-title">Category</div>
      <div class="filter-chip-group" id="categoryFilters">
        <div class="filter-chip active" onclick="toggleCategory(this, 'all')" data-value="all">
          <div class="dot"></div>
          All Products
          <span class="chip-count" id="count-all">12</span>
        </div>
        <div class="filter-chip" onclick="toggleCategory(this, 'template')" data-value="template">
          <div class="dot"></div>
          Templates
          <span class="chip-count">4</span>
        </div>
        <div class="filter-chip" onclick="toggleCategory(this, 'ui-kit')" data-value="ui-kit">
          <div class="dot"></div>
          UI Kits
          <span class="chip-count">3</span>
        </div>
        <div class="filter-chip" onclick="toggleCategory(this, 'plugin')" data-value="plugin">
          <div class="dot"></div>
          Plugins
          <span class="chip-count">2</span>
        </div>
        <div class="filter-chip" onclick="toggleCategory(this, 'ebook')" data-value="ebook">
          <div class="dot"></div>
          eBooks
          <span class="chip-count">2</span>
        </div>
        <div class="filter-chip" onclick="toggleCategory(this, 'course')" data-value="course">
          <div class="dot"></div>
          Courses
          <span class="chip-count">1</span>
        </div>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Price Range</div>
      <div class="price-range">
        <div class="range-row">
          <span id="priceMin">$0</span>
          <span id="priceMax">$200</span>
        </div>
        <input type="range" min="0" max="200" value="200" id="priceRangeMax" oninput="handlePriceFilter(this.value)" />
        <div style="font-size:0.72rem; color:var(--muted-foreground); font-weight:500;">Under <span id="priceLabel" style="font-weight:700;color:var(--foreground);">$200</span></div>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Rating</div>
      <div class="filter-chip-group">
        <div class="filter-chip" onclick="toggleRating(this, 0)" data-rating="0">
          <span style="color:var(--tertiary)">★★★★★</span> Any
        </div>
        <div class="filter-chip" onclick="toggleRating(this, 4)" data-rating="4">
          <span style="color:var(--tertiary)">★★★★</span>+ &amp; up
        </div>
        <div class="filter-chip" onclick="toggleRating(this, 4.5)" data-rating="4.5">
          <span style="color:var(--tertiary)">★★★★½</span> 4.5+
        </div>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Tags</div>
      <div class="tag-cloud" id="tagCloud">
        <div class="tag" onclick="toggleTag(this, 'figma')">Figma</div>
        <div class="tag" onclick="toggleTag(this, 'react')">React</div>
        <div class="tag" onclick="toggleTag(this, 'tailwind')">Tailwind</div>
        <div class="tag" onclick="toggleTag(this, 'nextjs')">Next.js</div>
        <div class="tag" onclick="toggleTag(this, 'wordpress')">WordPress</div>
        <div class="tag" onclick="toggleTag(this, 'notion')">Notion</div>
        <div class="tag" onclick="toggleTag(this, 'ai')">AI</div>
        <div class="tag" onclick="toggleTag(this, 'saas')">SaaS</div>
      </div>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <div class="sidebar-title">Status</div>
      <div class="filter-chip-group">
        <div class="filter-chip" onclick="toggleStatus(this, 'sale')">
          <div class="dot" style="background:var(--secondary);border-color:var(--secondary)"></div>
          On Sale
        </div>
        <div class="filter-chip" onclick="toggleStatus(this, 'new')">
          <div class="dot" style="background:var(--quaternary);border-color:var(--quaternary)"></div>
          New Arrivals
        </div>
        <div class="filter-chip" onclick="toggleStatus(this, 'bestseller')">
          <div class="dot" style="background:var(--tertiary);border-color:var(--tertiary)"></div>
          Bestsellers
        </div>
      </div>
    </div>

    <div style="margin-top: 8px;">
      <button class="btn btn-ghost" style="width:100%; justify-content:center; font-size:0.8rem;" onclick="resetAllFilters()">
        Reset All Filters
      </button>
    </div>

  </x-layout.sidebar-shell>

  <!-- ===================== MAIN ===================== -->
  <main class="main">

    <!-- Hero Strip -->
    <div class="hero-strip">
      <div class="hero-text">
        <h1>Premium Digital<br>Products <span>for Builders</span></h1>
        <p>Templates, UI Kits, Plugins & more — download instantly.</p>
      </div>
      <div class="hero-badges">
        <div class="hero-badge">
          <span class="num">12</span>
          <span class="label">Products</span>
        </div>
        <div class="hero-badge">
          <span class="num">4.8★</span>
          <span class="label">Avg Rating</span>
        </div>
        <div class="hero-badge">
          <span class="num">∞</span>
          <span class="label">Downloads</span>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="result-count">Showing <span id="resultCount">12</span> products</span>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <select class="sort-select" onchange="handleSort(this.value)">
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>

    <!-- Active Filters -->
    <div class="active-filters" id="activeFilters" style="display:none;">
      <!-- dynamically populated -->
    </div>

    <!-- Product Grid -->
    <div class="product-grid" id="productGrid">
      <!-- dynamically rendered -->
    </div>

  </main>
</div>

<!-- Footer -->
<footer class="footer">
  <div>© 2026 <strong>DigitalLoka</strong> — All rights reserved.</div>
  <div style="display:flex;gap:20px;">
    <a href="#" style="color:inherit;text-decoration:none;font-weight:600;">Terms</a>
    <a href="#" style="color:inherit;text-decoration:none;font-weight:600;">Privacy</a>
    <a href="#" style="color:inherit;text-decoration:none;font-weight:600;">Support</a>
  </div>
</footer>

<script>
  // ===================== STATE =====================
  const API_ENDPOINT = '/api/products';
  const THUMBS = ['thumb-purple', 'thumb-pink', 'thumb-amber', 'thumb-green', 'thumb-blue', 'thumb-red', 'thumb-teal', 'thumb-orange'];
  const ICONS = ['🎨', '🚀', '📘', '⚡', '✅', '🤖', '🧩', '📊', '📱', '📕', '✍️', '📈'];

  let allProducts = [];

  let state = {
    category: 'all',
    maxPrice: 200,
    minRating: 0,
    tags: [],
    status: [],
    search: '',
    sort: 'featured',
    wishlist: [],
  };

  function mapSort(sort) {
    const map = {
      featured: 'featured',
      newest: 'newest',
      'price-asc': 'price_asc',
      'price-desc': 'price_desc',
      rating: 'rating',
    };

    return map[sort] ?? 'featured';
  }

  function normalizeProduct(item) {
    const price = Number(item?.prices?.[0]?.amount ?? 0);
    const badges = Array.isArray(item.badges) ? item.badges : [];
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const id = Number(item.id ?? 0);

    return {
      id,
      slug: String(item.slug ?? ''),
      title: String(item.name ?? 'Untitled Product'),
      category: String(item?.category?.slug ?? 'uncategorized'),
      desc: String(item.short_description || item.description || 'No description available.'),
      price,
      originalPrice: badges.includes('sale') ? Number((price * 1.35).toFixed(0)) : null,
      rating: Number(item.rating ?? 0),
      reviews: Number(item.reviews_count ?? 0),
      tags,
      thumb: THUMBS[id % THUMBS.length],
      icon: ICONS[id % ICONS.length],
      badges,
      isNew: badges.includes('new'),
      isSale: badges.includes('sale'),
    };
  }

  function buildQuery(page = 1) {
    const params = new URLSearchParams();
    params.set('per_page', '100');
    params.set('page', String(page));
    params.set('sort', mapSort(state.sort));

    if (state.category !== 'all') params.set('category', state.category);
    if (state.search.trim().length > 0) params.set('search', state.search.trim());
    if (state.maxPrice < 200) params.set('max_price', String(state.maxPrice));
    if (state.minRating > 0) params.set('rating_min', String(state.minRating));
    if (state.tags.length > 0) params.set('tags', state.tags.join(','));
    if (state.status.length > 0) params.set('badges', state.status.join(','));

    return params;
  }

  async function loadProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '<div class="empty-state"><div class="icon">⏳</div><h3>Loading products</h3><p>Fetching latest catalog data...</p></div>';

    try {
      let page = 1;
      let lastPage = 1;
      const merged = [];

      do {
        const params = buildQuery(page);
        const response = await fetch(`${API_ENDPOINT}?${params.toString()}`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const data = Array.isArray(payload.data) ? payload.data : [];
        merged.push(...data.map(normalizeProduct));

        lastPage = Number(payload.last_page ?? 1);
        page += 1;
      } while (page <= lastPage);

      allProducts = merged;
      updateCategoryCounts();
      updateHeroStats();
      render();
    } catch (error) {
      allProducts = [];
      document.getElementById('resultCount').textContent = '0';
      grid.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><h3>Unable to load products</h3><p>Please try again in a moment.</p></div>';
    }
  }

  function updateCategoryCounts() {
    const total = allProducts.length;
    const counts = allProducts.reduce((acc, product) => {
      const key = product.category;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const totalEl = document.getElementById('count-all');
    if (totalEl) {
      totalEl.textContent = String(total);
    }

    document.querySelectorAll('#categoryFilters .filter-chip').forEach((chip) => {
      const value = chip.getAttribute('data-value');
      if (!value || value === 'all') {
        return;
      }

      const countEl = chip.querySelector('.chip-count');
      if (countEl) {
        countEl.textContent = String(counts[value] ?? 0);
      }
    });
  }

  function updateHeroStats() {
    const count = allProducts.length;
    const rating = count > 0
      ? (allProducts.reduce((sum, item) => sum + item.rating, 0) / count).toFixed(1)
      : '0.0';

    const totalReviews = allProducts.reduce((sum, item) => sum + item.reviews, 0);
    const badgeNums = document.querySelectorAll('.hero-badge .num');

    if (badgeNums.length >= 3) {
      badgeNums[0].textContent = String(count);
      badgeNums[1].textContent = `${rating}★`;
      badgeNums[2].textContent = String(totalReviews);
    }
  }

  // ===================== FILTER LOGIC =====================
  function getFiltered() {
    return [...allProducts];
  }

  function render() {
    const filtered = getFiltered();
    const grid = document.getElementById('productGrid');
    document.getElementById('resultCount').textContent = filtered.length;
    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><h3>No products found</h3><p>Try adjusting your filters or search query.</p></div>`;
      return;
    }

    filtered.forEach((p, i) => {
      const isWished = state.wishlist.includes(p.id);
      const badgeHtml = p.badges.map(b => {
        const map = { bestseller: ['badge-tertiary', '🔥 Bestseller'], sale: ['badge-secondary', '🏷 Sale'], new: ['badge-quaternary', '✨ New'] };
        if (!map[b]) {
          return '';
        }
        return `<span class="badge ${map[b][0]}">${map[b][1]}</span>`;
      }).join('');

      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="card-thumb ${p.thumb}">
          <div class="card-thumb-icon">${p.icon}</div>
          <div class="card-badge-top">${badgeHtml}</div>
          <button class="wishlist-btn ${isWished ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${p.id}, this)" title="Wishlist">
            ${isWished ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="card-body">
          <div class="card-category">${p.category.replace('-', ' ')}</div>
          <div class="card-title">${p.title}</div>
          <div class="card-desc">${p.desc}</div>
          <div class="card-tags">${p.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
        </div>
        <div class="card-footer">
          <div class="price-block">
            <div class="price-main">$${p.price}</div>
            ${p.originalPrice ? `<div class="price-original">$${p.originalPrice}</div>` : ''}
          </div>
          <div class="card-rating">
            <span class="star">★</span> ${p.rating} <span style="color:var(--muted-foreground);font-weight:500;">(${p.reviews})</span>
          </div>
          <button class="buy-btn" onclick="event.stopPropagation();">Buy Now</button>
        </div>
      `;
      grid.appendChild(card);
    });

    renderActiveFilters();
  }

  function renderActiveFilters() {
    const container = document.getElementById('activeFilters');
    const chips = [];

    if (state.category !== 'all') chips.push({ label: state.category.replace('-', ' '), key: 'category' });
    if (state.maxPrice < 200) chips.push({ label: `Under $${state.maxPrice}`, key: 'price' });
    if (state.minRating > 0) chips.push({ label: `${state.minRating}+ stars`, key: 'rating' });
    state.tags.forEach(t => chips.push({ label: t, key: 'tag', val: t }));
    state.status.forEach(s => chips.push({ label: s, key: 'status', val: s }));

    if (chips.length === 0) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    container.innerHTML = chips.map(c =>
      `<div class="active-filter-tag">${c.label} <button onclick="removeFilter('${c.key}','${c.val || ''}')">✕</button></div>`
    ).join('') + `<button class="clear-all" onclick="resetAllFilters()">Clear all</button>`;
  }

  function removeFilter(key, val) {
    if (key === 'category') { state.category = 'all'; document.querySelectorAll('#categoryFilters .filter-chip').forEach(el => el.classList.remove('active')); document.querySelector('[data-value="all"]').classList.add('active'); }
    else if (key === 'price') { state.maxPrice = 200; document.getElementById('priceRangeMax').value = 200; document.getElementById('priceMax').textContent = '$200'; document.getElementById('priceLabel').textContent = '$200'; }
    else if (key === 'rating') { state.minRating = 0; document.querySelectorAll('[data-rating]').forEach(el => el.classList.remove('active')); }
    else if (key === 'tag') { state.tags = state.tags.filter(t => t !== val); document.querySelectorAll('#tagCloud .tag').forEach(el => { if (el.dataset.tag === val || el.textContent.toLowerCase() === val) el.classList.remove('active'); }); }
    else if (key === 'status') { state.status = state.status.filter(s => s !== val); document.querySelectorAll('.sidebar .filter-chip').forEach(el => { if ((el.getAttribute('onclick') || '').includes(`'${val}'`)) el.classList.remove('active'); }); }
    loadProducts();
  }

  // ===================== HANDLERS =====================
  function toggleCategory(el, val) {
    state.category = val;
    document.querySelectorAll('#categoryFilters .filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    loadProducts();
  }

  function handlePriceFilter(val) {
    state.maxPrice = parseInt(val);
    document.getElementById('priceMax').textContent = '$' + val;
    document.getElementById('priceLabel').textContent = '$' + val;
    loadProducts();
  }

  function toggleRating(el, val) {
    const prev = state.minRating;
    document.querySelectorAll('[data-rating]').forEach(c => c.classList.remove('active'));
    if (prev === val) { state.minRating = 0; } else { state.minRating = val; el.classList.add('active'); }
    loadProducts();
  }

  function toggleTag(el, val) {
    if (state.tags.includes(val)) {
      state.tags = state.tags.filter(t => t !== val);
      el.classList.remove('active');
    } else {
      state.tags.push(val);
      el.classList.add('active');
    }
    loadProducts();
  }

  function toggleStatus(el, val) {
    if (state.status.includes(val)) {
      state.status = state.status.filter(s => s !== val);
      el.classList.remove('active');
    } else {
      state.status.push(val);
      el.classList.add('active');
    }
    loadProducts();
  }

  function handleSearch(val) {
    state.search = val;
    loadProducts();
  }

  function handleSort(val) {
    state.sort = val;
    loadProducts();
  }

  function toggleWishlist(id, btn) {
    if (state.wishlist.includes(id)) {
      state.wishlist = state.wishlist.filter(w => w !== id);
      btn.classList.remove('active');
      btn.textContent = '🤍';
    } else {
      state.wishlist.push(id);
      btn.classList.add('active');
      btn.textContent = '❤️';
    }
    // Update cart btn label
    document.querySelector('.btn-accent').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>Cart (${state.wishlist.length})`;
  }

  function resetAllFilters() {
    state = { ...state, category: 'all', maxPrice: 200, minRating: 0, tags: [], status: [], search: '' };
    document.getElementById('globalSearch').value = '';
    document.getElementById('priceRangeMax').value = 200;
    document.getElementById('priceMax').textContent = '$200';
    document.getElementById('priceLabel').textContent = '$200';
    document.querySelectorAll('.filter-chip').forEach(el => el.classList.remove('active'));
    document.querySelector('[data-value="all"]').classList.add('active');
    document.querySelectorAll('.tag').forEach(el => el.classList.remove('active'));
    loadProducts();
  }

  async function persistSupabaseSession(accessToken, refreshToken, expiresIn) {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
      }),
    });

    if (!response.ok) {
      throw new Error('Unable to persist session cookie');
    }
  }

  async function handleSupabaseHashAuth() {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hashParams.get('access_token');
    if (!accessToken) {
      return false;
    }

    const refreshToken = hashParams.get('refresh_token');
    const expiresIn = Number(hashParams.get('expires_in') || '3600');
    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get('next');
    const mode = searchParams.get('mode');
    const fallback = mode === 'admin' ? '/admin' : '/dashboard';
    const redirectTarget = next && next.startsWith('/') ? next : fallback;

    try {
      await persistSupabaseSession(accessToken, refreshToken, Number.isFinite(expiresIn) ? expiresIn : 3600);
    } catch (error) {
      console.error('Supabase session persistence failed', error);
      return false;
    }

    window.location.replace(redirectTarget);
    return true;
  }

  // ===================== INIT =====================
  (async () => {
    if (!await handleSupabaseHashAuth()) {
      loadProducts();
    }
  })();
</script>
</body>
</html>
