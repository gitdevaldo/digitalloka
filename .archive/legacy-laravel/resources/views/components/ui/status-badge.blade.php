@props([
    'variant' => 'active',
    'label' => 'Active',
    'class' => '',
    'showDot' => true,
    'baseClass' => 'status-badge',
])

@php
    $variantClass = match ($variant) {
        'running' => 'badge-running',
        'stopped' => 'badge-stopped',
        'starting' => 'badge-starting',
        'accent' => 'badge-accent',
        'active' => 'badge-active',
        default => '',
    };

    $classes = trim($baseClass . ' ' . $variantClass . ' ' . $class);
@endphp

<span {{ $attributes->merge(['class' => $classes]) }}>
    @if ($showDot)
        <span class="dot"></span>
    @endif
    {{ $label }}
</span>
