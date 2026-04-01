<?php

return [
    'supabase' => [
        'url' => env('NEXT_PUBLIC_SUPABASE_URL'),
        'anon_key' => env('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        'service_role_key' => env('SUPABASE_SERVICE_ROLE_KEY'),
        'redirect_url' => env('SUPABASE_AUTH_REDIRECT_URL'),
    ],

    'digitalocean' => [
        'token' => env('DIGITALOCEAN_TOKEN'),
        'base_url' => 'https://api.digitalocean.com/v2',
    ],

    'security' => [
        'allowed_origin' => env('ALLOWED_ORIGIN'),
    ],
];
