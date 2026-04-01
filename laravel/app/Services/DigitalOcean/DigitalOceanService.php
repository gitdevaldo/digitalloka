<?php

namespace App\Services\DigitalOcean;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class DigitalOceanService
{
    public function listDroplets(array $dropletIds, ?string $userId = null): array
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
        $data = $this->request('GET', '/droplets/' . $dropletId);

        return $data['droplet'] ?? [];
    }

    public function performAction(int $dropletId, string $actionType, ?string $userId = null): array
    {
        $data = $this->request('POST', '/droplets/' . $dropletId . '/actions', [
            'type' => $actionType,
        ]);

        return $data['action'] ?? [];
    }

    public function listActions(int $dropletId, ?string $userId = null): array
    {
        $data = $this->request('GET', '/droplets/' . $dropletId . '/actions?per_page=20');

        return $data['actions'] ?? [];
    }

    private function request(string $method, string $endpoint, array $payload = []): array
    {
        $token = (string) config('services.digitalocean.token');
        $baseUrl = rtrim((string) config('services.digitalocean.base_url'), '/');

        if ($token === '' || $baseUrl === '') {
            throw new RuntimeException('DigitalOcean service is not configured');
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json',
        ])->send($method, $baseUrl . $endpoint, [
            'json' => $payload,
        ]);

        if (!$response->successful()) {
            $body = $response->json();
            $message = is_array($body) ? ($body['message'] ?? 'DigitalOcean API error') : 'DigitalOcean API error';
            throw new RuntimeException((string) $message, $response->status());
        }

        $json = $response->json();

        return is_array($json) ? $json : [];
    }
}
