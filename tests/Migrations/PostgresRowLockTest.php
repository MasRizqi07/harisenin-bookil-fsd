<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

uses(TestCase::class);

it('blocks a second connection from locking an order held by the first connection', function (): void {
    if (DB::connection()->getDriverName() !== 'pgsql') {
        $this->markTestSkipped('PostgreSQL is required to verify real row locking.');
    }

    $this->artisan('migrate')->assertSuccessful();
    $user = User::factory()->create();
    $order = Order::factory()->for($user)->create();

    config()->set('database.connections.lock_probe', config('database.connections.pgsql'));
    $second = DB::connection('lock_probe');
    $first = DB::connection('pgsql');

    try {
        $first->beginTransaction();
        $first->table('orders')->where('id', $order->id)->lockForUpdate()->first();

        $second->beginTransaction();
        $second->statement("SET LOCAL lock_timeout = '500ms'");
        $started = microtime(true);

        try {
            $second->table('orders')->where('id', $order->id)->lockForUpdate()->first();
            test()->fail('The second connection acquired a row lock held by the first connection.');
        } catch (QueryException $exception) {
            expect($exception->getCode())->toBe('55P03')
                ->and(microtime(true) - $started)->toBeGreaterThanOrEqual(0.4)
                ->toBeLessThan(3.0);
        }
    } finally {
        if ($second->transactionLevel() > 0) {
            $second->rollBack();
        }
        if ($first->transactionLevel() > 0) {
            $first->rollBack();
        }
        DB::purge('lock_probe');
        $order->delete();
        $user->delete();
    }
});
