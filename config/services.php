<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'supabase' => [
        'url' => env('NEXT_PUBLIC_SUPABASE_URL'),
        'anon_key' => env('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        'service_role_key' => env('SUPABASE_SERVICE_ROLE_KEY'),
        'redirect_url' => env('SUPABASE_AUTH_REDIRECT_URL', env('APP_URL').'/auth/callback'),
        'http_verify_ssl' => env('SUPABASE_HTTP_VERIFY_SSL', env('APP_ENV') !== 'local'),
        'http_ca_bundle' => env('SUPABASE_HTTP_CA_BUNDLE'),
        'local_jwt_fallback' => env('SUPABASE_LOCAL_JWT_FALLBACK', env('APP_ENV') === 'local'),
    ],

    'digitalocean' => [
        'token' => env('DIGITALOCEAN_TOKEN'),
        'base_url' => env('DIGITALOCEAN_BASE_URL', 'https://api.digitalocean.com/v2'),
    ],

    'security' => [
        'allowed_origin' => env('ALLOWED_ORIGIN', env('APP_URL')),
    ],

    'payment' => [
        'webhook_secret' => env('PAYMENT_WEBHOOK_SECRET'),
    ],

];
