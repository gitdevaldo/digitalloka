<?php

namespace App\Services\Commerce;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductStockItem;
use Illuminate\Support\Arr;
use InvalidArgumentException;
use RuntimeException;

class ProductStockService
{
    /**
     * @var array<int, string>
     */
    private array $emailHeaderKeys = [
        'email',
        'e_mail',
        'mail',
    ];

    /**
     * @var array<int, string>
     */
    private array $usernameHeaderKeys = [
        'username',
        'user_name',
        'user',
        'login',
        'userid',
        'user_id',
    ];

    public function normalizeHeaders(array $headers): array
    {
        $normalized = array_values(array_filter(array_map(
            fn (mixed $value): string => trim((string) $value),
            $headers
        ), fn (string $value): bool => $value !== ''));

        if ($normalized === []) {
            throw new InvalidArgumentException('Stock headers cannot be empty');
        }

        if (count(array_unique($normalized)) !== count($normalized)) {
            throw new InvalidArgumentException('Stock headers must be unique');
        }

        return $normalized;
    }

    public function parseHeaderLine(string $headerLine): array
    {
        return $this->normalizeHeaders(explode('|', $headerLine));
    }

    public function importBatch(Product $product, array $headers, string $rows, ?array $meta = null): array
    {
        $headers = $this->normalizeHeaders($headers);
        $items = $this->parseRowsWithHeadersDetailed($headers, $rows);
        $inserted = 0;
        $skippedDuplicates = 0;
        $invalidRows = [];

        $identityHeaders = $this->detectIdentityHeaders($headers);
        if ($identityHeaders === []) {
            throw new InvalidArgumentException('Headers must include Email or Username for uniqueness validation.');
        }

        $identitySeenInFile = [];
        foreach ($identityHeaders as $identityHeader) {
            $identitySeenInFile[$identityHeader] = [];
        }

        $identitySeenInStock = $this->loadExistingIdentityValues($product, $identityHeaders);

        foreach ($items as $item) {
            $credentialData = $item['credential_data'];
            $line = $item['line'];

            $rowReasons = $this->validateIdentityUniqueness(
                $credentialData,
                $identityHeaders,
                $identitySeenInFile,
                $identitySeenInStock
            );

            if ($rowReasons !== []) {
                $invalidRows[] = [
                    'line' => $line,
                    'reasons' => $rowReasons,
                    'row' => $credentialData,
                ];
                continue;
            }

            $credentialHash = $this->credentialHash($credentialData);

            $existing = ProductStockItem::query()
                ->where('product_id', $product->id)
                ->where('credential_hash', $credentialHash)
                ->exists();

            if ($existing) {
                $skippedDuplicates++;
                $invalidRows[] = [
                    'line' => $line,
                    'reasons' => ['Duplicate credential payload already exists in stock.'],
                    'row' => $credentialData,
                ];
                continue;
            }

            ProductStockItem::query()->create([
                'product_id' => $product->id,
                'credential_data' => $credentialData,
                'credential_hash' => $credentialHash,
                'status' => 'unsold',
                'meta' => $meta,
            ]);
            $inserted++;
        }

        return [
            'inserted' => $inserted,
            'skipped_duplicates' => $skippedDuplicates,
            'invalid_rows' => $invalidRows,
            'invalid_count' => count($invalidRows),
        ];
    }

    public function credentialHash(array $credentialData): string
    {
        ksort($credentialData);

        return hash('sha256', json_encode($credentialData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    public function parseRowsWithHeaders(array $headers, string $rows): array
    {
        return array_map(
            static fn (array $item): array => $item['credential_data'],
            $this->parseRowsWithHeadersDetailed($headers, $rows)
        );
    }

    /**
     * @return array<int, array{line:int,credential_data:array<string,string>}>
     */
    public function parseRowsWithHeadersDetailed(array $headers, string $rows): array
    {
        $headers = $this->normalizeHeaders($headers);
        $lines = preg_split('/\r\n|\n|\r/', $rows) ?: [];
        $parsed = [];

        foreach ($lines as $index => $line) {
            $trimmed = trim($line);
            if ($trimmed === '') {
                continue;
            }

            $parts = array_map('trim', explode('|', $line));
            if (count($parts) !== count($headers)) {
                throw new InvalidArgumentException('Line ' . ($index + 1) . ' has invalid column count. Expected ' . count($headers) . ' values.');
            }

            $entry = [];
            foreach ($headers as $position => $header) {
                $entry[$header] = Arr::get($parts, $position, '');
            }

            $parsed[] = [
                'line' => $index + 1,
                'credential_data' => $entry,
            ];
        }

        if ($parsed === []) {
            throw new InvalidArgumentException('No valid stock rows found');
        }

        return $parsed;
    }

    public function productHeaders(Product $product): array
    {
        $meta = is_array($product->meta) ? $product->meta : [];
        $headers = $meta['stock_headers'] ?? [];

        if (!is_array($headers) || $headers === []) {
            return [];
        }

        return $this->normalizeHeaders($headers);
    }

    /**
     * @param array<int, string> $headers
     * @return array<int, string>
     */
    public function detectIdentityHeaders(array $headers): array
    {
        $identityHeaders = [];

        foreach ($headers as $header) {
            $normalized = $this->normalizeHeaderKey($header);
            if (in_array($normalized, $this->emailHeaderKeys, true) || in_array($normalized, $this->usernameHeaderKeys, true)) {
                $identityHeaders[] = $header;
            }
        }

        return $identityHeaders;
    }

    /**
     * @param array<int, string> $identityHeaders
     * @return array<string, array<string, bool>>
     */
    private function loadExistingIdentityValues(Product $product, array $identityHeaders): array
    {
        $result = [];
        foreach ($identityHeaders as $identityHeader) {
            $result[$identityHeader] = [];
        }

        $items = ProductStockItem::query()
            ->where('product_id', $product->id)
            ->select(['credential_data'])
            ->get();

        foreach ($items as $item) {
            $credentialData = is_array($item->credential_data) ? $item->credential_data : [];
            foreach ($identityHeaders as $identityHeader) {
                $value = trim((string) ($credentialData[$identityHeader] ?? ''));
                if ($value === '') {
                    continue;
                }

                $result[$identityHeader][strtolower($value)] = true;
            }
        }

        return $result;
    }

    /**
     * @param array<string, string> $credentialData
     * @param array<int, string> $identityHeaders
     * @param array<string, array<string, bool>> $identitySeenInFile
     * @param array<string, array<string, bool>> $identitySeenInStock
     * @return array<int, string>
     */
    private function validateIdentityUniqueness(
        array $credentialData,
        array $identityHeaders,
        array &$identitySeenInFile,
        array $identitySeenInStock
    ): array {
        $reasons = [];

        foreach ($identityHeaders as $identityHeader) {
            $rawValue = trim((string) ($credentialData[$identityHeader] ?? ''));
            $label = $identityHeader;

            if ($rawValue === '') {
                $reasons[] = sprintf('%s cannot be empty.', $label);
                continue;
            }

            $value = strtolower($rawValue);
            if (($identitySeenInFile[$identityHeader][$value] ?? false) === true) {
                $reasons[] = sprintf('%s is duplicated in uploaded rows: %s', $label, $rawValue);
                continue;
            }

            if (($identitySeenInStock[$identityHeader][$value] ?? false) === true) {
                $reasons[] = sprintf('%s already exists in current stock: %s', $label, $rawValue);
                continue;
            }

            $identitySeenInFile[$identityHeader][$value] = true;
        }

        return $reasons;
    }

    private function normalizeHeaderKey(string $header): string
    {
        $normalized = strtolower(trim($header));
        $normalized = preg_replace('/[^a-z0-9]+/', '_', $normalized) ?? $normalized;

        return trim($normalized, '_');
    }

    public function reserveUnsoldItems(Product $product, int $quantity, OrderItem $orderItem, string $userId): array
    {
        if ($quantity <= 0) {
            return [];
        }

        $stockItems = ProductStockItem::query()
            ->where('product_id', $product->id)
            ->where('status', 'unsold')
            ->orderBy('id')
            ->lockForUpdate()
            ->limit($quantity)
            ->get();

        if ($stockItems->count() < $quantity) {
            throw new RuntimeException('Insufficient stock for product: ' . $product->id);
        }

        foreach ($stockItems as $stockItem) {
            $stockItem->status = 'sold';
            $stockItem->sold_order_item_id = $orderItem->id;
            $stockItem->sold_user_id = $userId;
            $stockItem->sold_at = now();
            $stockItem->save();
        }

        return $stockItems->all();
    }
}
