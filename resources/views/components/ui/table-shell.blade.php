@props([
    'variant' => 'dashboard',
])

@php
    $tableClass = $variant === 'admin' ? 'tbl' : 'data-table';
@endphp

<table class="{{ $tableClass }}">
    {{ $slot }}
</table>
