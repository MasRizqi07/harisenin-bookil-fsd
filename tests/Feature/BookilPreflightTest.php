<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Artisan;

beforeEach(function (): void {
    $this->app['env'] = 'production';
    config()->set([
        'app.debug' => false, 'app.url' => 'https://bookil.example',
        'services.midtrans.server_key' => 'sentinel-not-a-live-key', 'services.midtrans.is_production' => true,
        'filesystems.private_disk' => 's3', 'bookil.payment_simulator_enabled' => false,
        'mail.default' => 'smtp', 'bookil.behind_proxy' => true, 'trustedproxy.proxies' => ['10.0.0.2'],
    ]);
});

// A configuration check must not disclose credentials or perform a live connection test.
it('passes the synthetic deployment profile without printing its secret value', function (): void {
    expect(Artisan::call('bookil:preflight'))->toBe(0);
    $output = Artisan::output();
    expect($output)->not->toContain('sentinel-not-a-live-key')->not->toContain('FAIL')->not->toContain('WARN');
    fwrite(STDOUT, $output);
});

// Each misconfigured deployment setting must stop acceptance before a customer reaches a failing service.
it('fails preflight for each incorrect deployment setting', function (string $key, mixed $value, string $check): void {
    if ($key === 'environment') {
        $this->app['env'] = $value;
    } else {
        config()->set($key, $value);
    }
    expect(Artisan::call('bookil:preflight'))->toBe(1)
        ->and(Artisan::output())->toContain($check)->not->toContain('sentinel-not-a-live-key');
    fwrite(STDOUT, "PREFLIGHT_REJECTED={$check} EXIT=1\n");
})->with([
    'debug' => ['app.debug', true, 'FAIL APP_DEBUG'],
    'environment' => ['environment', 'local', 'FAIL APP_ENV'],
    'URL scheme' => ['app.url', 'http://bookil.example', 'FAIL APP_URL'],
    'missing key' => ['services.midtrans.server_key', '', 'FAIL MIDTRANS_SERVER_KEY'],
    'sandbox mode' => ['services.midtrans.is_production', false, 'FAIL MIDTRANS_IS_PRODUCTION'],
    'local storage' => ['filesystems.private_disk', 'local', 'FAIL PRIVATE_DISK'],
    'simulator' => ['bookil.payment_simulator_enabled', true, 'FAIL BOOKIL_PAYMENT_SIMULATOR_ENABLED'],
    'log mailer' => ['mail.default', 'log', 'FAIL MAIL_MAILER'],
    'array mailer' => ['mail.default', 'array', 'FAIL MAIL_MAILER'],
    'missing proxies' => ['trustedproxy.proxies', [], 'WARN TRUSTED_PROXIES'],
    'wildcard proxy' => ['trustedproxy.proxies', ['*'], 'WARN TRUSTED_PROXIES'],
]);
