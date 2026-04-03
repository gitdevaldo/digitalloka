<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogService
{
    public function log(
        string $action,
        string $targetType,
        ?string $targetId,
        ?string $actorUserId,
        ?string $actorRole,
        ?array $changes,
        Request $request
    ): void {
        AuditLog::query()->create([
            'actor_user_id' => $actorUserId,
            'actor_role' => $actorRole,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'changes' => $changes,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
