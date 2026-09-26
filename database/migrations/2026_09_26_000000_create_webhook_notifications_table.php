<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_notifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->string('external_transaction_id', 64);
            $table->char('event_key', 64)->unique();
            $table->string('transaction_status', 32);
            $table->json('payload');
            $table->string('result', 32);
            $table->timestamps();
            $table->index(['order_id', 'created_at']);
            $table->index(['external_transaction_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_notifications');
    }
};
