<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('download_attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('download_token_id')->nullable()->constrained()->nullOnDelete();
            $table->char('access_signature_hash', 64)->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->string('outcome', 64);
            $table->timestamp('attempted_at');
            $table->index(['user_id', 'attempted_at']);
            $table->index(['order_item_id', 'attempted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('download_attempts');
    }
};
