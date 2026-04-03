<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpsertSiteSettingRequest;
use App\Services\Access\AdminAccessService;
use App\Services\Audit\AuditLogService;
use App\Services\Auth\SupabaseAuthService;
use App\Services\Settings\SiteSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService,
        private readonly SiteSettingService $siteSettingService,
        private readonly AuditLogService $auditLogService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json(['settings' => $this->siteSettingService->listGrouped()], 200);
    }

    public function upsert(UpsertSiteSettingRequest $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validated();
        $setting = $this->siteSettingService->upsert(
            (string) $validated['setting_group'],
            (string) $validated['setting_key'],
            $validated['setting_value'] ?? null,
            $adminUserId
        );

        $this->auditLogService->log(
            'admin.site_setting.upserted',
            'site_setting',
            (string) $setting->id,
            $adminUserId,
            'admin',
            ['setting_key' => $setting->setting_key],
            $request
        );

        return response()->json(['setting' => $setting], 200);
    }
}
