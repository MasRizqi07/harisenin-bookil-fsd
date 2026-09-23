<?php

declare(strict_types=1);

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Exceptions\ProductUnavailableException;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class CreateOrderAction
{
    /**
     * Create a new order with validated products, backend-calculated totals, and row locking.
     *
     * @param  array<int, int|array{product_id: int}>  $items
     */
    public function execute(User $user, array $items, ?string $notes = null): Order
    {
        if (empty($items)) {
            throw new InvalidArgumentException('Order must contain at least one item.');
        }

        // Normalize product IDs and eliminate any client-side duplicates
        $productIds = [];
        foreach ($items as $item) {
            if (is_array($item)) {
                if (!isset($item['product_id'])) {
                    throw new InvalidArgumentException('Each item array must contain a product_id key.');
                }
                $productIds[] = (int) $item['product_id'];
            } elseif (is_int($item) || is_numeric($item)) {
                $productIds[] = (int) $item;
            } else {
                throw new InvalidArgumentException('Invalid item format provided.');
            }
        }

        $productIds = array_values(array_unique($productIds));

        return DB::transaction(function () use ($user, $productIds, $notes): Order {
            // Lock published products to prevent race conditions during checkout
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->where('is_published', true)
                ->lockForUpdate()
                ->get();

            if ($products->count() !== count($productIds)) {
                throw new ProductUnavailableException('One or more selected products are unavailable or unpublished.');
            }

            // Recalculate total amount strictly on the backend using fixed decimal precision
            $totalAmount = '0.00';
            foreach ($products as $product) {
                $totalAmount = bcadd($totalAmount, (string) $product->price, 2);
            }

            $orderNumber = 'ORD-' . strtoupper(Str::random(12));

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'status' => OrderStatus::PENDING,
                'notes' => $notes,
            ]);

            foreach ($products as $product) {
                $order->items()->create([
                    'product_id' => $product->id,
                    'price' => $product->price,
                ]);
            }

            return $order->load(['items.product', 'user']);
        });
    }
}

