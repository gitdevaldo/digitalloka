<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\Catalog\CatalogService;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class CatalogPageController extends Controller
{
    public function __construct(private readonly CatalogService $catalogService)
    {
    }

    public function index(): View
    {
        return view('catalog.index');
    }

    public function show(string $slug): View|RedirectResponse
    {
        $product = $this->catalogService->getProductBySlug($slug);

        if ($product === null) {
            return redirect('/')->with('error', 'Product not found');
        }

        $productArray = $product->toArray();
        $isDroplet = $this->isDropletType($productArray);

        $price = $productArray['prices'][0] ?? null;
        $currency = $price['currency'] ?? 'IDR';
        $rawAmount = $price ? (float) str_replace(',', '', (string) ($price['amount'] ?? 0)) : 0;
        $formattedAmount = $this->formatAmount($currency, $rawAmount);
        $billingPeriod = $price['billing_period'] ?? 'one-time';

        $meta = is_array($productArray['meta'] ?? null) ? $productArray['meta'] : [];

        $viewData = [
            'product' => $productArray,
            'isDroplet' => $isDroplet,
            'price' => $price,
            'currency' => $currency,
            'rawAmount' => $rawAmount,
            'formattedAmount' => $formattedAmount,
            'billingPeriod' => $billingPeriod,
            'meta' => $meta,
            'status' => $this->formatStatus($productArray['status'] ?? ''),
            'category' => $productArray['category']['name'] ?? 'Product',
            'productType' => str_replace('_', ' ', $productArray['product_type'] ?? 'Digital Product'),
        ];

        if ($isDroplet) {
            $viewData['specs'] = [
                'vcpu' => $meta['spec_vcpu_count'] ?? 2,
                'ram' => $meta['spec_ram_gb'] ?? 4,
                'storage' => $meta['spec_storage_gb'] ?? 80,
                'bandwidth' => $meta['spec_bandwidth_tb'] ?? 4,
                'datacenter' => $meta['datacenter'] ?? 'SGP1',
                'region' => $meta['region_country'] ?? 'Singapore',
            ];

            $annualMonthlyAmount = $rawAmount > 0 ? round($rawAmount * 0.8) : 0;
            $annualTotalAmount = $rawAmount > 0 ? round($rawAmount * 12 * 0.8) : 0;
            $savings = $rawAmount > 0 ? round($rawAmount * 12 - $annualTotalAmount) : 0;

            $viewData['annualMonthly'] = $this->formatAmount($currency, $annualMonthlyAmount);
            $viewData['annualTotal'] = $this->formatAmount($currency, $annualTotalAmount);
            $viewData['savings'] = $this->formatAmount($currency, $savings);
        }

        return view('catalog.show', $viewData);
    }

    private function isDropletType(array $product): bool
    {
        $type = strtolower($product['product_type'] ?? '');
        $category = strtolower($product['category']['name'] ?? '');
        $slug = strtolower($product['slug'] ?? '');

        return str_contains($type, 'droplet')
            || str_contains($type, 'vps')
            || str_contains($category, 'vps')
            || str_contains($slug, 'vps');
    }

    private function formatStatus(string $status): string
    {
        $status = strtolower(trim($status));
        if ($status === '') {
            return 'Unknown';
        }
        if ($status === 'coming-soon') {
            return 'Coming soon';
        }
        if ($status === 'out-of-stock') {
            return 'Out of stock';
        }
        return ucwords(str_replace('-', ' ', $status));
    }

    private function formatAmount(string $currency, float $value): string
    {
        if (strtoupper($currency) === 'IDR') {
            return number_format(round($value), 0, ',', '.');
        }
        return number_format($value, 2, '.', ',');
    }
}
