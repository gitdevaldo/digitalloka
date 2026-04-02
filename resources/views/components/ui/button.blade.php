@props([
    'variant' => 'default',
    'type' => 'button',
    'as' => 'button',
    'class' => '',
])

@php
    $variantClass = match ($variant) {
        'accent' => 'btn-accent',
        'danger' => 'btn-danger',
        'warning' => 'btn-warning',
        'success' => 'btn-success',
        'ghost' => 'btn-ghost',
        'sm' => 'btn-sm',
        default => '',
    };

    $classes = trim('btn ' . $variantClass . ' ' . $class);
@endphp

@if ($as === 'a')
    <a {{ $attributes->merge(['class' => $classes]) }}>
        {{ $slot }}
    </a>
@else
    <button {{ $attributes->merge(['type' => $type, 'class' => $classes]) }}>
        {{ $slot }}
    </button>
@endif
