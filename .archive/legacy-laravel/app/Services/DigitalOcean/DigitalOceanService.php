<?php

namespace App\Services\DigitalOcean;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class DigitalOceanService
{
    public function listDroplets(array $dropletIds, ?string $userId = null): array
    {
        if ($dropletIds === []) {
            return [];
        }

        sort($dropletIds);
        $cacheTtl = max(1, (int) config('services.digitalocean.droplets_cache_seconds', 20));
        $cacheKey = 'digitalocean:droplets:' . hash('sha256', implode(',', $dropletIds) . '|' . (string) $userId);

        return Cache::remember($cacheKey, now()->addSeconds($cacheTtl), function () use ($dropletIds, $userId): array {
            return $this->fetchDroplets($dropletIds, $userId);
        });
    }

    private function fetchDroplets(array $dropletIds, ?string $userId = null): array
    {
        $droplets = [];

        foreach ($dropletIds as $dropletId) {
            try {
                $droplets[] = $this->getDroplet((int) $dropletId, $userId);
            } catch (RuntimeException) {
                // Skip failed droplets to match current Next.js behavior.
            }
        }

        return $droplets;
    }

    public function getDroplet(int $dropletId, ?string $userId = null): array
    {
        $cacheTtl = max(1, (int) config('services.digitalocean.droplet_cache_seconds', 20));
        $cacheKey = 'digitalocean:droplet:' . $dropletId;

        return Cache::remember($cacheKey, now()->addSeconds($cacheTtl), function () use ($dropletId): array {
            $data = $this->request('GET', '/droplets/' . $dropletId);
            return $data['droplet'] ?? [];
        });
    }

    public function performAction(int $dropletId, string $actionType, ?string $userId = null): array
    {
        $data = $this->request('POST', '/droplets/' . $dropletId . '/actions', [
            'type' => $actionType,
        ]);

        Cache::forget('digitalocean:droplet:' . $dropletId);
        Cache::forget('digitalocean:droplet-actions:' . $dropletId);

        return $data['action'] ?? [];
    }

    public function listActions(int $dropletId, ?string $userId = null): array
    {
        $cacheTtl = max(1, (int) config('services.digitalocean.actions_cache_seconds', 10));
        $cacheKey = 'digitalocean:droplet-actions:' . $dropletId;

        return Cache::remember($cacheKey, now()->addSeconds($cacheTtl), function () use ($dropletId): array {
            $data = $this->request('GET', '/droplets/' . $dropletId . '/actions?per_page=20');
            return $data['actions'] ?? [];
        });
    }

    private function request(string $method, string $endpoint, array $payload = []): array
    {
        $correlationId = (string) Str::uuid();
        $token = (string) config('services.digitalocean.token');
        $baseUrl = rtrim((string) config('services.digitalocean.base_url'), '/');

        if ($token === '' || $baseUrl === '') {
            throw new RuntimeException('DigitalOcean service is not configured');
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json',
            'X-Correlation-ID' => $correlationId,
        ])
            ->connectTimeout((float) config('services.digitalocean.connect_timeout_seconds', 3))
            ->timeout((float) config('services.digitalocean.request_timeout_seconds', 10))
            ->send($method, $baseUrl . $endpoint, [
            'json' => $payload,
        ]);

        Log::info('digitalocean_request', [
            'correlation_id' => $correlationId,
            'method' => $method,
            'endpoint' => $endpoint,
            'status' => $response->status(),
        ]);

        if (!$response->successful()) {
            $body = $response->json();
            $message = is_array($body) ? ($body['message'] ?? 'DigitalOcean API error') : 'DigitalOcean API error';
            Log::warning('digitalocean_request_failed', [
                'correlation_id' => $correlationId,
                'method' => $method,
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'message' => $message,
            ]);
            throw new RuntimeException((string) $message, $response->status());
        }

        $json = $response->json();

        return is_array($json) ? $json : [];
    }
}
