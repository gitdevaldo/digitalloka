<?php

namespace App\Jobs;

use App\Models\AuditLog;
use App\Models\Entitlement;
use App\Models\Product;
use App\Models\UserProductAction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProcessUserProductAction implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(private readonly int $actionId)
    {
    }

    public function handle(): void
    {
        $action = UserProductAction::query()->where('id', $this->actionId)->first();
        if ($action === null || $action->status !== 'queued') {
            return;
        }

        $action->status = 'processing';
        $action->started_at = now();
        $action->save();

        try {
            DB::transaction(function () use ($action): void {
                $product = Product::query()->where('id', $action->product_id)->first();
                if ($product === null) {
                    throw new \RuntimeException('Product not found for action processing');
                }

                $entitlement = Entitlement::query()
                    ->where('user_id', $action->user_id)
                    ->where('product_id', $action->product_id)
                    ->whereIn('status', ['active', 'pending'])
                    ->first();

                if ($entitlement === null) {
                    throw new \RuntimeException('No eligible entitlement found for this product action');
                }

                $resultPayload = match ((string) $action->action) {
                    'view_details' => [
                        'message' => 'Product details viewed',
                        'product_slug' => $product->slug,
                    ],
                    'download_assets' => [
                        'message' => 'Assets prepared',
                        'download_token' => sha1($action->id . '|' . $action->user_id . '|' . microtime(true)),
                    ],
                    'renew' => $this->renewEntitlement($entitlement),
                    default => throw new \RuntimeException('Unsupported product action'),
                };

                $action->status = 'completed';
                $action->result_payload = $resultPayload;
                $action->completed_at = now();
                $action->error_message = null;
                $action->save();

                AuditLog::query()->create([
                    'actor_user_id' => $action->user_id,
                    'actor_role' => 'user',
                    'action' => 'user.product.action.processed',
                    'target_type' => 'user_product_action',
                    'target_id' => (string) $action->id,
                    'changes' => [
                        'product_id' => $action->product_id,
                        'action' => $action->action,
                        'status' => 'completed',
                    ],
                    'ip_address' => null,
                    'user_agent' => 'queue:process-user-product-action',
                ]);
            });
        } catch (\Throwable $exception) {
            $action->status = 'failed';
            $action->error_message = $exception->getMessage();
            $action->completed_at = now();
            $action->save();
        }
    }

    private function renewEntitlement(Entitlement $entitlement): array
    {
        $base = $entitlement->expires_at !== null && $entitlement->expires_at->isFuture()
            ? $entitlement->expires_at
            : now();

        $newExpiry = $base->copy()->addDays(30);
        $entitlement->status = 'active';
        $entitlement->expires_at = $newExpiry;
        $entitlement->save();

        return [
            'message' => 'Entitlement renewed successfully',
            'expires_at' => $newExpiry->toIso8601String(),
        ];
    }
}
