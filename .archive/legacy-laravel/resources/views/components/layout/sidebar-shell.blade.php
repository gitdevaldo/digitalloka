@props([
    'id' => 'sidebar',
    'toggleId' => 'sidebarToggle',
    'toggleTitle' => 'Toggle sidebar',
    'toggleSize' => 12,
    'showToggle' => true,
])

<aside class="sidebar" id="{{ $id }}">
    @if ($showToggle)
        <button class="sidebar-toggle" id="{{ $toggleId }}" title="{{ $toggleTitle }}">
            <svg width="{{ $toggleSize }}" height="{{ $toggleSize }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
        </button>
    @endif

    {{ $slot }}
</aside>
