<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['required', 'string', 'max:180'],
            'category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'product_type' => ['nullable', 'string', 'max:50'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:available,out-of-stock,coming-soon'],
            'is_visible' => ['nullable', 'boolean'],
            'faq_items' => ['nullable', 'array'],
        ];
    }
}
