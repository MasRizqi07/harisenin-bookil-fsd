<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

// An unverified account must not buy, while an existing customer's library remains accessible.
it('requires verification only for checkout and keeps browsing and the library open', function (): void {
    $user = User::factory()->unverified()->create();
    $this->get('/')->assertOk();
    $this->get('/register')->assertOk();
    $this->actingAs($user)->post('/checkout', [])->assertRedirect(route('verification.notice'));
    $this->postJson('/checkout', [])->assertForbidden();
    $this->get('/dashboard')->assertOk();
    $this->assertDatabaseCount('orders', 0);
    fwrite(STDOUT, "UNVERIFIED_CHECKOUT_HTTP=403 LIBRARY_HTTP=200 ORDER_ROWS=0\n");
});

// Repeated resend clicks must not provide an unlimited verification-email send path.
it('resends verification mail six times and throttles the seventh attempt', function (): void {
    Notification::fake();
    $user = User::factory()->unverified()->create();
    $this->actingAs($user)->get('/verify-email')->assertOk();

    for ($attempt = 0; $attempt < 6; $attempt++) {
        $this->post('/email/verification-notification')->assertRedirect();
    }
    $this->post('/email/verification-notification')->assertTooManyRequests();
    Notification::assertSentToTimes($user, VerifyEmail::class, 6);
    fwrite(STDOUT, "VERIFICATION_EMAILS=6 SEVENTH_HTTP=429\n");
});
