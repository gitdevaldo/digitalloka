<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserAccessRequest;
use App\Models\User;
use App\Services\Access\AdminAccessService;
use App\Services\Audit\AuditLogService;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService,
        private readonly AuditLogService $auditLogService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = User::query()->select(['id', 'email', 'role', 'is_active', 'created_at']);
        if ($request->filled('q')) {
            $keyword = (string) $request->query('q');
            $query->where('email', 'like', '%' . $keyword . '%');
        }

        $users = $query->orderByDesc('created_at')->paginate(30);

        return response()->json($users, 200);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $user = User::query()->with(['orders', 'entitlements.product:id,name,slug,status'])->where('id', $id)->first();
        if ($user === null) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json(['user' => $user], 200);
    }

    public function updateAccess(UpdateUserAccessRequest $request, string $id): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $user = User::query()->where('id', $id)->first();
        if ($user === null) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $before = [
            'role' => $user->role,
            'is_active' => $user->is_active,
        ];

        $user->fill($request->validated());
        $user->save();

        $this->auditLogService->log(
            'admin.user.access.updated',
            'user',
            $user->id,
            $adminUserId,
            'admin',
            ['before' => $before, 'after' => ['role' => $user->role, 'is_active' => $user->is_active]],
            $request
        );

        return response()->json(['user' => $user], 200);
    }
}
