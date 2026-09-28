<?php

declare(strict_types=1);

use App\Models\DownloadToken;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Providers\AppServiceProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// TLS termination must not invalidate app-generated download links or attribute requests to the proxy IP.
it('accepts a signed download behind a trusted HTTPS proxy and records the client IP', function (): void {
    $this->app['env'] = 'production';
    config()->set('trustedproxy.proxies', ['10.0.0.2']);
    $this->app->getProvider(AppServiceProvider::class)->boot();
    Storage::fake('s3');
    config()->set('filesystems.private_disk', 's3');
    $user = User::factory()->create();
    $product = Product::factory()->create(['file_path' => 'private/ebooks/proxy.pdf']);
    $item = OrderItem::factory()->for(Order::factory()->for($user)->paid())->for($product)->create();
    DownloadToken::factory()->create(['order_item_id' => $item->id]);
    Storage::disk('s3')->put($product->file_path, 'fixture');
    $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2', 'SERVER_PORT' => 80]);
    $headers = ['X-Forwarded-Proto' => 'https', 'X-Forwarded-For' => '203.0.113.55', 'X-Forwarded-Port' => '443'];

    $dashboard = $this->actingAs($user)->get('http://bookil.test/dashboard', $headers)->assertOk();
    $signed = $dashboard->viewData('page')['props']['library'][0]['download_url'];
    expect($signed)->toStartWith('https://bookil.test/downloads/');
    $this->get(preg_replace('/^https:/', 'http:', $signed), $headers)->assertRedirect();
    $this->assertDatabaseHas('download_attempts', ['user_id' => $user->id, 'ip_address' => '203.0.113.55', 'outcome' => 'granted']);
    fwrite(STDOUT, "PROXY_SIGNED_SCHEME=https DOWNLOAD_HTTP=302 AUDIT_IP=203.0.113.55\n");
});

// A direct visitor must not spoof a trusted client address using forwarding headers.
it('ignores forwarded IPs from an untrusted peer', function (): void {
    config()->set('trustedproxy.proxies', ['10.0.0.2']);
    Route::get('/proxy-test', fn (Request $request): JsonResponse => response()->json(['ip' => $request->ip()]));
    $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.20']);
    $this->getJson('/proxy-test', ['X-Forwarded-For' => '203.0.113.55'])->assertJsonPath('ip', '198.51.100.20');
});

// Browsers must receive the declared header policy without premature CSP enforcement or development HSTS.
it('adds report-only browser headers and omits HSTS during testing', function (): void {
    $this->get('/')->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff')->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        ->assertHeader('Content-Security-Policy-Report-Only')
        ->assertHeaderMissing('Content-Security-Policy')->assertHeaderMissing('Strict-Transport-Security');
});

// The selected live environment must advertise HSTS on its responses.
it('adds HSTS only in the production environment', function (): void {
    $this->app['env'] = 'production';
    $this->get('/')->assertHeader('Strict-Transport-Security', 'max-age=31536000');
});

// Automated invalid auth submissions must encounter a rate limit before repeated validation work.
it('throttles repeated guest auth submissions', function (string $path): void {
    for ($attempt = 0; $attempt < 6; $attempt++) {
        $this->postJson($path)->assertUnprocessable();
    }
    $this->postJson($path)->assertTooManyRequests();
})->with(['/register', '/forgot-password', '/reset-password']);
