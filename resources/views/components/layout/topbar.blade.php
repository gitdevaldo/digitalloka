@props([
    'variant' => 'dashboard',
])

@if ($variant === 'dashboard')
    <header class="topbar" id="topbar">
        <div class="topbar-brand" id="topbarBrand">
            <a href="#" class="brand-logo">
                <div class="box">Digital<span class="loka">Loka</span></div>
            </a>
        </div>

        <div class="topbar-right" style="flex:1;padding-left:20px;">
            <div class="topbar-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search products, orders..." />
            </div>
        </div>

        <div class="topbar-right">
            <button class="icon-btn" title="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="notif-dot"></div>
            </button>
            <x-ui.avatar-chip label="AL" title="Account" />
        </div>
    </header>
@elseif ($variant === 'admin')
    <header class="topbar">
        <div class="topbar-brand" id="tbBrand">
            <a href="#" class="brand-logo">
                <div class="brand-box">Digital<span class="loka">Loka</span></div>
            </a>
            <span class="admin-pill">Admin</span>
        </div>
        <div class="topbar-center">
            <div class="search-wrap">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search users, orders, products..."/>
            </div>
        </div>
        <div class="topbar-right">
            <button class="icon-btn">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="notif-dot"></div>
            </button>
            <x-ui.avatar-chip label="AL" title="Admin Account" />
        </div>
    </header>
@elseif ($variant === 'catalog')
    <header class="topbar">
        <a href="#" class="brand-logo">
            <div class="box">Digital<span class="loka">Loka</span></div>
        </a>

        <div class="search-bar">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search products..." id="globalSearch" oninput="handleSearch(this.value)" />
        </div>

        <div class="topbar-right">
            <x-ui.button variant="ghost" as="a" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Wishlist
            </x-ui.button>
            <x-ui.button variant="accent" as="a" href="#">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Cart (0)
            </x-ui.button>
        </div>
    </header>
@endif
