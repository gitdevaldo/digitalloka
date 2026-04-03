<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class ListProductsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', 'max:100'],
            'type' => ['nullable', 'string', 'max:50'],
            'availability' => ['nullable', 'in:available,out-of-stock,coming-soon'],
            'search' => ['nullable', 'string', 'max:255'],
            'rating_min' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'tags' => ['nullable', 'string', 'max:500'],
            'badges' => ['nullable', 'string', 'max:500'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'sort' => ['nullable', 'in:recommended,featured,newest,price_asc,price_desc,rating'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
