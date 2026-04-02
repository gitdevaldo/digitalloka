<?php

namespace App\Http\Controllers\Droplets;

use App\Http\Controllers\Controller;
use App\Services\Access\DropletAccessService;
use App\Services\Auth\SupabaseAuthService;
use App\Services\DigitalOcean\DigitalOceanService;
use App\Support\DropletIdValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class DropletController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly DropletAccessService $accessService,
        private readonly DigitalOceanService $digitalOceanService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $dropletIds = $this->accessService->listAssignedDropletIds($userId);
        try {
            $droplets = $this->digitalOceanService->listDroplets($dropletIds, $userId);
        } catch (RuntimeException $exception) {
            return response()->json(['error' => $exception->getMessage()], 502);
        }

        return response()->json(['droplets' => $droplets], 200);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $dropletId = DropletIdValidator::parse($id);
        if ($dropletId === null) {
            return response()->json(['error' => 'Invalid droplet ID'], 400);
        }

        if (!$this->accessService->canAccessDroplet($userId, $dropletId)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        try {
            $droplet = $this->digitalOceanService->getDroplet($dropletId, $userId);
        } catch (RuntimeException $exception) {
            return response()->json(['error' => $exception->getMessage()], 502);
        }

        return response()->json(['droplet' => $droplet], 200);
    }
}
