@props([
    'variant' => 'dashboard',
    'title' => '',
])

@php
    $headerClass = $variant === 'admin' ? 'panel-hd' : 'panel-header';
    $bodyClass = 'panel-body';
@endphp

<div class="panel">
    @if ($title !== '' || isset($actions))
        <div class="{{ $headerClass }}">
            @if ($title !== '')
                <div class="panel-title">{{ $title }}</div>
            @endif
            @if (isset($actions))
                {{ $actions }}
            @endif
        </div>
    @endif

    @if (isset($slot))
        <div class="{{ $bodyClass }}" style="padding:0;">
            {{ $slot }}
        </div>
    @endif
</div>
