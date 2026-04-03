<?php

namespace App\Services\Settings;

use App\Models\SiteSetting;

class SiteSettingService
{
    public function listGrouped(): array
    {
        return SiteSetting::query()
            ->orderBy('setting_group')
            ->orderBy('setting_key')
            ->get()
            ->groupBy('setting_group')
            ->toArray();
    }

    public function upsert(string $group, string $key, mixed $value, ?string $updatedBy): SiteSetting
    {
        return SiteSetting::query()->updateOrCreate(
            ['setting_key' => $key],
            [
                'setting_group' => $group,
                'setting_value' => $value,
                'updated_by' => $updatedBy,
            ]
        );
    }
}
