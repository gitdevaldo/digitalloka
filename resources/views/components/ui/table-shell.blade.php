@props([
    'variant' => 'dashboard',
])

@php
    $tableClass = $variant === 'admin' ? 'tbl' : 'data-table';
    $shellClass = $variant === 'admin' ? 'table-shell table-shell--admin' : 'table-shell table-shell--dashboard';
@endphp

<div class="{{ $shellClass }}">
    <table class="{{ $tableClass }}">
        {{ $slot }}
    </table>
</div>
