@props([
    'id' => 'modal',
    'title' => 'Modal',
    'bodyId' => null,
    'backdropClick' => null,
])

<div class="modal-bg" id="{{ $id }}" @if($backdropClick) onclick="{{ $backdropClick }}" @endif>
    <div class="modal">
        <div class="modal-title">
            <span>{{ $title }}</span>
            <button class="btn btn-sm btn-ghost" onclick="document.getElementById('{{ $id }}').classList.remove('open')">✕ Close</button>
        </div>
        @if ($bodyId)
            <pre id="{{ $bodyId }}"></pre>
        @else
            {{ $slot }}
        @endif
    </div>
</div>
