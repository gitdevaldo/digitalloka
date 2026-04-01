<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Models\Product;
use App\Services\Access\AdminAccessService;
use App\Services\Audit\AuditLogService;
use App\Services\Auth\SupabaseAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService,
        private readonly AuditLogService $auditLogService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = Product::query()->with('category:id,name,slug')->withCount('prices');
        if ($request->filled('q')) {
            $keyword = (string) $request->query('q');
            $query->where('name', 'like', '%' . $keyword . '%');
        }

        $products = $query->orderByDesc('created_at')->paginate(30);

        return response()->json($products, 200);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $product = Product::query()->create($request->validated());

        $this->auditLogService->log(
            'admin.product.created',
            'product',
            (string) $product->id,
            $adminUserId,
            'admin',
            ['name' => $product->name],
            $request
        );

        return response()->json(['product' => $product], 201);
    }

    public function update(StoreProductRequest $request, string $id): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $productId = filter_var($id, FILTER_VALIDATE_INT);
        if ($productId === false) {
            return response()->json(['error' => 'Invalid product ID'], 400);
        }

        $product = Product::query()->find((int) $productId);
        if ($product === null) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->fill($request->validated());
        $product->save();

        $this->auditLogService->log(
            'admin.product.updated',
            'product',
            (string) $product->id,
            $adminUserId,
            'admin',
            ['name' => $product->name],
            $request
        );

        return response()->json(['product' => $product], 200);
    }
}
