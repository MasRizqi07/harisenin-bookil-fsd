<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

uses(TestCase::class);

it('upgrades existing users and reverses only the Bookil migrations', function (): void {
    expect(DB::connection()->getDriverName())->toBe('sqlite');
    expect(DB::connection()->getDatabaseName())->toBe(':memory:');

    $this->artisan('migrate', ['--path' => 'database/migrations/0001_01_01_000000_create_users_table.php'])
        ->assertSuccessful();

    $userId = DB::table('users')->insertGetId([
        'name' => 'Existing customer',
        'email' => 'existing@example.test',
        'password' => 'existing-password-hash',
    ]);

    $this->artisan('migrate')->assertSuccessful();
    expect(DB::table('users')->where('id', $userId)->value('role'))->toBe('customer');

    $this->artisan('migrate:rollback', ['--step' => 7])->assertSuccessful();

    expect(Schema::hasColumn('users', 'role'))->toBeFalse()
        ->and(DB::table('users')->where('id', $userId)->value('email'))->toBe('existing@example.test')
        ->and(Schema::hasTable('tasks'))->toBeTrue();

    foreach (['categories', 'products', 'orders', 'order_items', 'payments', 'download_tokens'] as $table) {
        expect(Schema::hasTable($table))->toBeFalse();
    }

    $this->artisan('migrate')->assertSuccessful();
    expect(Schema::hasTable('download_tokens'))->toBeTrue()
        ->and(DB::table('users')->where('id', $userId)->value('role'))->toBe('customer');
});
