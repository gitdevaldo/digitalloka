<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateEntitlementStatusRequest;
use App\Models\Entitlement;
use App\Services\Access\AdminAccessService;
use App\Services\Access\EntitlementService;
use App\Services\Audit\AuditLogService;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntitlementController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService,
        private readonly EntitlementService $entitlementService,
        private readonly AuditLogService $auditLogService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = Entitlement::query()->with(['user:id,email', 'product:id,name,slug']);
        if ($request->filled('user_id')) {
            $query->where('user_id', (string) $request->query('user_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', (string) $request->query('status'));
        }

        $entitlements = $query->orderByDesc('created_at')->paginate(30);

        return response()->json($entitlements, 200);
    }

    public function updateStatus(UpdateEntitlementStatusRequest $request, string $id): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $entitlementId = filter_var($id, FILTER_VALIDATE_INT);
        if ($entitlementId === false) {
            return response()->json(['error' => 'Invalid entitlement ID'], 400);
        }

        $entitlement = Entitlement::query()->find((int) $entitlementId);
        if ($entitlement === null) {
            return response()->json(['error' => 'Entitlement not found'], 404);
        }

        $oldStatus = (string) $entitlement->status;
        $updated = $this->entitlementService->updateStatus(
            $entitlement,
            (string) $request->validated('status'),
            $request->validated('reason')
        );

        $this->auditLogService->log(
            'admin.entitlement.status.updated',
            'entitlement',
            (string) $updated->id,
            $adminUserId,
            'admin',
            ['from' => $oldStatus, 'to' => $updated->status],
            $request
        );

        return response()->json(['entitlement' => $updated], 200);
    }
}
