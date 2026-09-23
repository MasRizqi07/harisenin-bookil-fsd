<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('download_tokens', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_item_id')->unique()->constrained()->cascadeOnDelete();
            // SHA-256 digest only. Never persist the plaintext bearer token.
            $table->char('token', 64)->unique();
            $table->timestamp('expires_at')->index();
            $table->unsignedInteger('download_count')->default(0);
            $table->unsignedInteger('max_downloads')->default(5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('download_tokens');
    }
};
