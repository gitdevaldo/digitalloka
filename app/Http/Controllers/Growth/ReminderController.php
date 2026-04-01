<?php

namespace App\Http\Controllers\Growth;

use App\Http\Controllers\Controller;
use App\Services\Access\AdminAccessService;
use App\Services\Auth\SupabaseAuthService;
use App\Services\Growth\ReminderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService,
        private readonly ReminderService $reminderService
    ) {
    }

    public function sendRenewalReminders(Request $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $count = $this->reminderService->sendRenewalReminders();

        return response()->json(['queued_reminders' => $count], 200);
    }
}
