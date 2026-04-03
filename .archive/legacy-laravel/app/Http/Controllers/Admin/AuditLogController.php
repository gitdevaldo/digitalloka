<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\Access\AdminAccessService;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = AuditLog::query()->orderByDesc('created_at');

        if ($request->filled('actor')) {
            $actor = (string) $request->query('actor');
            $query->where('actor_user_id', 'like', '%' . $actor . '%');
        }

        if ($request->filled('action')) {
            $action = (string) $request->query('action');
            $query->where('action', 'like', '%' . $action . '%');
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', (string) $request->query('target_type'));
        }

        if ($request->filled('target_id')) {
            $query->where('target_id', 'like', '%' . (string) $request->query('target_id') . '%');
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', (string) $request->query('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', (string) $request->query('date_to'));
        }

        $logs = $query->paginate(50)->through(function (AuditLog $log): array {
            $changes = is_array($log->changes) ? $log->changes : [];
            $result = 'ok';
            if (str_contains(strtolower($log->action), 'fail') || isset($changes['error']) || isset($changes['exception'])) {
                $result = 'fail';
            } elseif (str_contains(strtolower($log->action), 'warn') || isset($changes['warning'])) {
                $result = 'warn';
            }

            return [
                'id' => $log->id,
                'actor' => $log->actor_user_id ?? 'system',
                'action' => $log->action,
                'target_type' => $log->target_type,
                'target_id' => $log->target_id,
                'result' => $result,
                'changes' => $changes,
                'created_at' => optional($log->created_at)?->toIso8601String(),
            ];
        });

        return response()->json($logs, 200);
    }
}
