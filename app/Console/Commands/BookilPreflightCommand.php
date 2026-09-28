<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BookilPreflightCommand extends Command
{
    protected $signature = 'bookil:preflight';

    protected $description = 'Check deployment configuration without network calls or secret output';

    public function handle(): int
    {
        $checks = [
            'APP_ENV' => app()->isProduction(),
            'APP_DEBUG' => ! config('app.debug'),
            'APP_URL' => filter_var(config('app.url'), FILTER_VALIDATE_URL) !== false
                && parse_url((string) config('app.url'), PHP_URL_SCHEME) === 'https',
            'MIDTRANS_SERVER_KEY' => trim((string) config('services.midtrans.server_key')) !== '',
            'MIDTRANS_IS_PRODUCTION' => (bool) config('services.midtrans.is_production'),
            'PRIVATE_DISK' => config('filesystems.private_disk') === 's3',
            'BOOKIL_PAYMENT_SIMULATOR_ENABLED' => ! config('bookil.payment_simulator_enabled'),
            'MAIL_MAILER' => ! in_array(config('mail.default'), ['log', 'array'], true),
        ];
        $failed = false;
        foreach ($checks as $name => $passed) {
            $this->line(($passed ? 'PASS ' : 'FAIL ').$name);
            $failed = $failed || ! $passed;
        }
        $proxies = config('trustedproxy.proxies', []);
        if (config('bookil.behind_proxy') && (empty($proxies)
            || array_intersect((array) $proxies, ['*', '**', '0.0.0.0/0', '::/0']) !== [])) {
            $this->warn('WARN TRUSTED_PROXIES: explicit proxy ranges are required.');
            $failed = true;
        } else {
            $this->line('PASS TRUSTED_PROXIES');
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
