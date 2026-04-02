@props([
    'icon' => 'i',
    'title' => 'No data',
    'description' => 'Nothing to show right now.',
    'class' => '',
    'variant' => 'default',
])

@if ($variant === 'dashboard')
    <div {{ $attributes->merge(['class' => trim('empty-state ' . $class)]) }}>
        <div class="empty-icon">{{ $icon }}</div>
        <div class="empty-title">{{ $title }}</div>
        <div class="empty-desc">{{ $description }}</div>
    </div>
@else
    <div {{ $attributes->merge(['class' => trim('empty-state ' . $class)]) }}>
        <div class="icon">{{ $icon }}</div>
        <h3>{{ $title }}</h3>
        <p>{{ $description }}</p>
    </div>
@endif
