<?php

declare(strict_types=1);

use App\Models\User;

it('rejects the 11th checkout request from one authenticated customer', function (): void {
    $user = User::factory()->create();

    for ($attempt = 0; $attempt < 10; $attempt++) {
        $this->actingAs($user)->post('/checkout')->assertRedirect();
    }

    $this->actingAs($user)->post('/checkout')->assertTooManyRequests();
});
