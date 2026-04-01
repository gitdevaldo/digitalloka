<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpsertSiteSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'setting_group' => ['required', 'string', 'max:100'],
            'setting_key' => ['required', 'string', 'max:120'],
            'setting_value' => ['nullable'],
        ];
    }
}
