<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\Catalog\ListProductsRequest;
use App\Services\Catalog\CatalogService;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function __construct(private readonly CatalogService $catalogService)
    {
    }

    public function index(ListProductsRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 12);
        unset($validated['per_page']);

        $products = $this->catalogService->listProducts($validated, $perPage);

        return response()->json($products, 200);
    }

    public function show(string $slug): JsonResponse
    {
        $product = $this->catalogService->getProductBySlug($slug);
        if ($product === null) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        return response()->json(['product' => $product], 200);
    }
}
