@props([
    'variant' => 'dashboard',
    'title' => '',
    'subtitle' => '',
])

@if ($variant === 'admin')
    <div class="ph">
        <div>
            <div class="ph-title">{{ $title }}</div>
            @if ($subtitle !== '')
                <div class="ph-sub">{{ $subtitle }}</div>
            @endif
        </div>
        @if (isset($actions))
            <div class="ph-actions">{{ $actions }}</div>
        @endif
    </div>
@else
    <div class="page-header">
        <div>
            <div class="page-title">{{ $title }}</div>
            @if ($subtitle !== '')
                <div class="page-subtitle">{{ $subtitle }}</div>
            @endif
        </div>
        @if (isset($actions))
            {{ $actions }}
        @endif
    </div>
@endif
