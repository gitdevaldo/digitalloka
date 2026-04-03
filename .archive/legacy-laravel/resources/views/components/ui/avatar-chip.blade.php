@props([
    'label' => 'AL',
    'title' => 'Account',
    'class' => '',
])

<div {{ $attributes->merge(['class' => trim('avatar ' . $class), 'title' => $title]) }}>{{ $label }}</div>
