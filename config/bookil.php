<?php

declare(strict_types=1);

return [
    'payment_simulator_enabled' => (bool) env('BOOKIL_PAYMENT_SIMULATOR_ENABLED', false),
    'behind_proxy' => (bool) env('APP_BEHIND_PROXY', false),
];
