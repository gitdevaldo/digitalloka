<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDropletActionRequest;
use App\Models\Entitlement;
use App\Models\User;
use App\Services\Access\AdminAccessService;
use App\Services\Audit\AuditLogService;
use App\Services\Auth\SupabaseAuthService;
use App\Services\DigitalOcean\DigitalOceanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class DropletController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService,
        private readonly DigitalOceanService $digitalOceanService,
        private readonly AuditLogService $auditLogService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $users = User::query()->select(['id', 'email', 'droplet_ids'])->get();

        $ownersByDropletId = [];
        foreach ($users as $user) {
            $dropletIds = is_array($user->droplet_ids) ? $user->droplet_ids : [];
            foreach ($dropletIds as $dropletId) {
                $numericId = filter_var($dropletId, FILTER_VALIDATE_INT);
                if ($numericId === false) {
                    continue;
                }
                $ownersByDropletId[(int) $numericId] = [
                    'id' => $user->id,
                    'email' => $user->email,
                ];
            }
        }

        $dropletIds = array_keys($ownersByDropletId);

        try {
            $droplets = $this->digitalOceanService->listDroplets($dropletIds, $adminUserId);
        } catch (RuntimeException $exception) {
            return response()->json(['error' => $exception->getMessage()], 502);
        }

        $entitlementByUserId = Entitlement::query()
            ->with('product:id,product_type')
            ->whereIn('user_id', $users->pluck('id')->all())
            ->where('status', 'active')
            ->get()
            ->groupBy('user_id')
            ->map(fn ($items) => optional($items->first())->id);

        $mapped = array_map(function (array $droplet) use ($ownersByDropletId, $entitlementByUserId): array {
            $id = (int) ($droplet['id'] ?? 0);
            $owner = $ownersByDropletId[$id] ?? ['id' => null, 'email' => null];

            return [
                'id' => $id,
                'name' => $droplet['name'] ?? ('droplet-' . $id),
                'region' => $droplet['region']['slug'] ?? null,
                'size' => $droplet['size_slug'] ?? null,
                'status' => $droplet['status'] ?? 'unknown',
                'ip_address' => $droplet['networks']['v4'][0]['ip_address'] ?? null,
                'owner_user_id' => $owner['id'],
                'owner_email' => $owner['email'],
                'entitlement_id' => $owner['id'] ? $entitlementByUserId->get($owner['id']) : null,
                'updated_at' => $droplet['created_at'] ?? null,
            ];
        }, $droplets);

        return response()->json(['droplets' => $mapped], 200);
    }

    public function storeAction(StoreDropletActionRequest $request, string $id): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $dropletId = filter_var($id, FILTER_VALIDATE_INT);
        if ($dropletId === false) {
            return response()->json(['error' => 'Invalid droplet ID'], 400);
        }

        try {
            $action = $this->digitalOceanService->performAction(
                (int) $dropletId,
                (string) $request->validated('type'),
                $adminUserId
            );
        } catch (RuntimeException $exception) {
            return response()->json(['error' => $exception->getMessage()], 502);
        }

        $this->auditLogService->log(
            'admin.droplet.action',
            'droplet',
            (string) $dropletId,
            $adminUserId,
            'admin',
            [
                'type' => (string) $request->validated('type'),
                'action_id' => $action['id'] ?? null,
            ],
            $request
        );

        return response()->json(['action' => $action], 201);
    }
}
