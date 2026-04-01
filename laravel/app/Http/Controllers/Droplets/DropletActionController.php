<?php

namespace App\Http\Controllers\Droplets;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDropletActionRequest;
use App\Services\Access\DropletAccessService;
use App\Services\Auth\SupabaseAuthService;
use App\Services\DigitalOcean\DigitalOceanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class DropletActionController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly DropletAccessService $accessService,
        private readonly DigitalOceanService $digitalOceanService
    ) {
    }

    public function index(Request $request, string $id): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $dropletId = filter_var($id, FILTER_VALIDATE_INT);
        if ($dropletId === false) {
            return response()->json(['error' => 'Invalid droplet ID'], 400);
        }

        if (!$this->accessService->canAccessDroplet($userId, (int) $dropletId)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        try {
            $actions = $this->digitalOceanService->listActions((int) $dropletId, $userId);
        } catch (RuntimeException $exception) {
            return response()->json(['error' => $exception->getMessage()], 502);
        }

        return response()->json(['actions' => $actions], 200);
    }

    public function store(StoreDropletActionRequest $request, string $id): JsonResponse
    {
        $userId = $this->authService->getSessionUserId($request);
        if ($userId === null) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $dropletId = filter_var($id, FILTER_VALIDATE_INT);
        if ($dropletId === false) {
            return response()->json(['error' => 'Invalid droplet ID'], 400);
        }

        if (!$this->accessService->canAccessDroplet($userId, (int) $dropletId)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        try {
            $action = $this->digitalOceanService->performAction(
                (int) $dropletId,
                (string) $request->validated('type'),
                $userId
            );
        } catch (RuntimeException $exception) {
            return response()->json(['error' => $exception->getMessage()], 502);
        }

        return response()->json(['action' => $action], 201);
    }
}
