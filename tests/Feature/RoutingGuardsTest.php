<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

// Unauthenticated visitors must not reach the removed TaskKu mutation endpoints.
it('returns 404 for both legacy task endpoints', function (): void {
    $this->get('/tasks')->assertNotFound();
    $this->post('/tasks')->assertNotFound();
});

// Reordering download middleware must not bypass denial auditing or signature validation.
it('keeps the download audit throttle and signature middleware in order', function (): void {
    expect(Route::getRoutes()->getByName('downloads.process')->gatherMiddleware())
        ->toBe(['web', 'auth', 'download.audit', 'throttle:downloads', 'signed']);
});
