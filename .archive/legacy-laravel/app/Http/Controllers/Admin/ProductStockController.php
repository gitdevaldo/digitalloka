<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportProductStocksRequest;
use App\Http\Requests\Admin\StoreProductStockItemRequest;
use App\Http\Requests\Admin\UpdateProductStockItemRequest;
use App\Models\Product;
use App\Models\ProductStockItem;
use App\Services\Access\AdminAccessService;
use App\Services\Audit\AuditLogService;
use App\Services\Auth\SupabaseAuthService;
use App\Services\Commerce\ProductStockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class ProductStockController extends Controller
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

        $query = ProductStockItem::query()
            ->with(['product:id,name,slug,product_type', 'soldUser:id,email'])
            ->orderByDesc('id');

        $productId = filter_var($request->query('product_id'), FILTER_VALIDATE_INT);
        if ($productId !== false) {
            $query->where('product_id', (int) $productId);
        }

        $status = (string) $request->query('status', '');
        if (in_array($status, ['unsold', 'sold'], true)) {
            $query->where('status', $status);
        }

        if ($request->filled('q')) {
            $keyword = strtolower((string) $request->query('q'));
            $driver = DB::connection()->getDriverName();

            if ($driver === 'pgsql' || $driver === 'sqlite') {
                $query->whereRaw('LOWER(CAST(credential_data AS TEXT)) LIKE ?', ['%' . $keyword . '%']);
            } else {
                $query->whereRaw('LOWER(CAST(credential_data AS CHAR)) LIKE ?', ['%' . $keyword . '%']);
            }
        }

        return response()->json($query->paginate(50)->withQueryString(), 200);
    }

    public function store(StoreProductStockItemRequest $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validated();
        $credentialData = is_array($validated['credential_data']) ? $validated['credential_data'] : [];
        $credentialHash = $this->productStockService->credentialHash($credentialData);

        $existing = ProductStockItem::query()
            ->where('product_id', (int) $validated['product_id'])
            ->where('credential_hash', $credentialHash)
            ->first();

        if ($existing !== null) {
            return response()->json(['error' => 'Duplicate stock credentials for this product'], 422);
        }

        $item = ProductStockItem::query()->create([
            'product_id' => (int) $validated['product_id'],
            'credential_data' => $credentialData,
            'credential_hash' => $credentialHash,
            'status' => 'unsold',
        ]);

        $this->auditLogService->log(
            'admin.product_stock.created',
            'product_stock_item',
            (string) $item->id,
            $adminUserId,
            'admin',
            ['product_id' => $item->product_id],
            $request
        );

        return response()->json(['item' => $item->fresh(['product:id,name,slug,product_type'])], 201);
    }

    public function update(UpdateProductStockItemRequest $request, string $id): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $itemId = filter_var($id, FILTER_VALIDATE_INT);
        if ($itemId === false) {
            return response()->json(['error' => 'Invalid stock ID'], 400);
        }

        $item = ProductStockItem::query()->find((int) $itemId);
        if ($item === null) {
            return response()->json(['error' => 'Stock item not found'], 404);
        }

        $validated = $request->validated();
        $credentialData = is_array($validated['credential_data']) ? $validated['credential_data'] : [];
        $credentialHash = $this->productStockService->credentialHash($credentialData);

        $duplicate = ProductStockItem::query()
            ->where('product_id', $item->product_id)
            ->where('credential_hash', $credentialHash)
            ->where('id', '!=', $item->id)
            ->exists();

        if ($duplicate) {
            return response()->json(['error' => 'Duplicate stock credentials for this product'], 422);
        }

        $item->credential_data = $credentialData;
        $item->credential_hash = $credentialHash;
        if (isset($validated['status'])) {
            $item->status = (string) $validated['status'];
        }
        $item->save();

        $this->auditLogService->log(
            'admin.product_stock.updated',
            'product_stock_item',
            (string) $item->id,
            $adminUserId,
            'admin',
            ['product_id' => $item->product_id],
            $request
        );

        return response()->json(['item' => $item->fresh(['product:id,name,slug,product_type', 'soldUser:id,email'])], 200);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $itemId = filter_var($id, FILTER_VALIDATE_INT);
        if ($itemId === false) {
            return response()->json(['error' => 'Invalid stock ID'], 400);
        }

        $item = ProductStockItem::query()->find((int) $itemId);
        if ($item === null) {
            return response()->json(['error' => 'Stock item not found'], 404);
        }

        $item->delete();

        $this->auditLogService->log(
            'admin.product_stock.deleted',
            'product_stock_item',
            (string) $itemId,
            $adminUserId,
            'admin',
            ['product_id' => $item->product_id],
            $request
        );

        return response()->json(['deleted' => true], 200);
    }

    public function import(ImportProductStocksRequest $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validated();
        $product = Product::query()->find((int) $validated['product_id']);
        if ($product === null) {
            return response()->json(['error' => 'Product not found'], 404);
        }

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
                'source' => 'product-stock-submenu',
            ]);
        } catch (InvalidArgumentException $exception) {
            return response()->json(['error' => $exception->getMessage()], 422);
        } catch (QueryException) {
            return response()->json(['error' => 'Import contains duplicated credentials for this product'], 422);
        }

        if ((bool) ($validated['set_as_default_headers'] ?? true)) {
            $meta = is_array($product->meta) ? $product->meta : [];
            $meta['stock_headers'] = $normalizedHeaders;
            $product->meta = $meta;
            $product->save();
        }

        $this->auditLogService->log(
            'admin.product_stock.imported',
            'product',
            (string) $product->id,
            $adminUserId,
            'admin',
            [
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

    public function export(Request $request): JsonResponse
    {
        $adminUserId = $this->authService->getSessionUserId($request);
        if ($adminUserId === null || !$this->adminAccessService->isAdmin($adminUserId)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $productId = filter_var($request->query('product_id'), FILTER_VALIDATE_INT);
        if ($productId === false) {
            return response()->json(['error' => 'product_id is required'], 422);
        }

        $product = Product::query()->find((int) $productId);
        if ($product === null) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $items = ProductStockItem::query()
            ->where('product_id', $product->id)
            ->orderBy('id')
            ->get();

        $headers = $this->productStockService->productHeaders($product);
        if ($headers === [] && $items->isNotEmpty()) {
            $first = $items->first();
            $headers = array_keys(is_array($first?->credential_data) ? $first->credential_data : []);
        }

        $rows = $items->map(function (ProductStockItem $item) use ($headers): string {
            $data = is_array($item->credential_data) ? $item->credential_data : [];
            $values = array_map(fn (string $header): string => (string) ($data[$header] ?? ''), $headers);
            return implode('|', $values);
        })->values()->all();

        return response()->json([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'headers' => $headers,
            'header_line' => implode('|', $headers),
            'rows' => $rows,
            'rows_text' => implode("\n", $rows),
        ], 200);
    }
}
