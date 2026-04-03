<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportProductStockRequest;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Models\Product;
use App\Services\Access\AdminAccessService;
use App\Services\Audit\AuditLogService;
use App\Services\Auth\SupabaseAuthService;
use App\Services\Commerce\ProductStockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class ProductController extends Controller
{
    public function __construct(
        private readonly SupabaseAuthService $authService,
        private readonly AdminAccessService $adminAccessService,
        private readonly AuditLogService $auditLogService,
        private readonly ProductStockService $productStockService
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

    public function importStock(ImportProductStockRequest $request, string $id): JsonResponse
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

        $validated = $request->validated();
        $headers = $validated['headers'] ?? null;

        if ($headers === null) {
            $meta = is_array($product->meta) ? $product->meta : [];
            $headers = $meta['stock_headers'] ?? null;
        }

        try {
            if ($headers === null && isset($validated['header'])) {
                $headers = $this->productStockService->parseHeaderLine((string) $validated['header']);
            }

            if (!is_array($headers)) {
                return response()->json(['error' => 'Stock headers are required. Provide headers/header or configure product meta.stock_headers first.'], 422);
            }

            $normalizedHeaders = $this->productStockService->normalizeHeaders($headers);
            $configuredHeaders = $this->productStockService->productHeaders($product);

            if ($configuredHeaders !== [] && !$this->headersMatch($configuredHeaders, $normalizedHeaders)) {
                return response()->json([
                    'error' => 'Imported headers must match configured product stock headers exactly.',
                    'configured_headers' => $configuredHeaders,
                    'provided_headers' => $normalizedHeaders,
                ], 422);
            }

            $result = $this->productStockService->importBatch($product, $normalizedHeaders, (string) $validated['rows'], [
                'imported_by' => $adminUserId,
            ]);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['error' => $exception->getMessage()], 422);
        }

        $setAsDefaultHeaders = (bool) ($validated['set_as_default_headers'] ?? true);
        if ($setAsDefaultHeaders) {
            $meta = is_array($product->meta) ? $product->meta : [];
            $meta['stock_headers'] = $normalizedHeaders;
            $product->meta = $meta;
            $product->save();
        }

        $this->auditLogService->log(
            'admin.product.stock.imported',
            'product',
            (string) $product->id,
            $adminUserId,
            'admin',
            [
                'product_name' => $product->name,
                'inserted' => $result['inserted'],
                'skipped_duplicates' => $result['skipped_duplicates'],
                'invalid_count' => $result['invalid_count'],
                'headers' => $normalizedHeaders,
            ],
            $request
        );

        return response()->json([
            'success' => true,
            'product_id' => $product->id,
            'inserted' => $result['inserted'],
            'skipped_duplicates' => $result['skipped_duplicates'],
            'invalid_count' => $result['invalid_count'],
            'invalid_rows' => $result['invalid_rows'],
            'headers' => $normalizedHeaders,
        ], 201);
    }

    /**
     * @param array<int, string> $configuredHeaders
     * @param array<int, string> $providedHeaders
     */
    private function headersMatch(array $configuredHeaders, array $providedHeaders): bool
    {
        if (count($configuredHeaders) !== count($providedHeaders)) {
            return false;
        }

        foreach ($configuredHeaders as $index => $configuredHeader) {
            $providedHeader = $providedHeaders[$index] ?? null;
            if ($providedHeader === null) {
                return false;
            }

            if (strtolower(trim($configuredHeader)) !== strtolower(trim($providedHeader))) {
                return false;
            }
        }

        return true;
    }
}
