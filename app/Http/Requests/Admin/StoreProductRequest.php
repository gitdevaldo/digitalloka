<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('id');

        return [
            'name' => ['required', 'string', 'max:150'],
            'slug' => [
                'required',
                'string',
                'max:180',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('products', 'slug')->ignore($productId),
            ],
            'category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'category_name' => ['nullable', 'string', 'max:120'],
            'product_type' => ['nullable', 'string', 'max:50'],
            'short_description' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'price_amount' => ['nullable', 'numeric', 'min:0'],
            'price_currency' => ['nullable', 'string', 'size:3'],
            'price_name' => ['nullable', 'string', 'max:80'],
            'price_billing_period' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:available,out-of-stock,coming-soon'],
            'is_visible' => ['nullable', 'boolean'],
            'faq_items' => ['nullable', 'array'],
            'featured' => ['nullable', 'array'],
            'featured.*.label' => ['required_with:featured', 'string', 'max:50'],
            'featured.*.value' => ['required_with:featured', 'string', 'max:100'],
            'featured.*.sub' => ['nullable', 'string', 'max:100'],
            'meta' => ['nullable', 'array'],
            'meta.stock_headers' => ['nullable', 'array', 'min:1'],
            'meta.stock_headers.*' => ['required', 'string', 'max:100'],
            'meta.template_url' => ['nullable', 'url', 'max:2000'],
        ];
    }
}
