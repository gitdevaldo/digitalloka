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
            'setting_group' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_.-]+$/i'],
            'setting_key' => ['required', 'string', 'max:120', 'regex:/^[a-z0-9_.-]+$/i'],
            'setting_value' => ['nullable', 'array'],
        ];
    }
}
