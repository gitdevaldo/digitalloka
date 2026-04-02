<?php

namespace App\Http\Controllers\Droplets;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDropletActionRequest;
use App\Services\Access\DropletAccessService;
use App\Services\Auth\SupabaseAuthService;
use App\Services\DigitalOcean\DigitalOceanService;
use App\Support\DropletIdValidator;
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

        $dropletId = DropletIdValidator::parse($id);
        if ($dropletId === null) {
            return response()->json(['error' => 'Invalid droplet ID'], 400);
        }

        if (!$this->accessService->canAccessDroplet($userId, $dropletId)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        try {
            $actions = $this->digitalOceanService->listActions($dropletId, $userId);
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

        $dropletId = DropletIdValidator::parse($id);
        if ($dropletId === null) {
            return response()->json(['error' => 'Invalid droplet ID'], 400);
        }

        if (!$this->accessService->canAccessDroplet($userId, $dropletId)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        try {
            $action = $this->digitalOceanService->performAction(
                $dropletId,
                (string) $request->validated('type'),
                $userId
            );
        } catch (RuntimeException $exception) {
            return response()->json(['error' => $exception->getMessage()], 502);
        }

        return response()->json(['action' => $action], 201);
    }
}
