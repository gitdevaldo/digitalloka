<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

class CatalogReferenceGuardTest extends TestCase
{
    public function test_catalog_page_keeps_reference_layout_markers(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertSee('<aside class="sidebar">', false);
        $response->assertSee('<div class="hero-strip">', false);
        $response->assertSee('<div class="product-grid" id="productGrid">', false);
        $response->assertSee('toggleCategory(this, \'all\')', false);
    }

    public function test_catalog_reference_checksum_has_not_drifted(): void
    {
        $contents = File::get(resource_path('views/catalog/index.blade.php'));
        $checksum = strtoupper(hash('sha256', $contents));

        $this->assertSame('68461932994874286C1F7ED331CA898DA0D4534403BA988FDFBC42D6642A1F7A', $checksum);
    }
}
