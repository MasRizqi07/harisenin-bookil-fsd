<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->index()->constrained()->restrictOnDelete();
            // One record per gateway transaction; webhook event history is separate.
            $table->string('external_transaction_id', 64)->unique();
            $table->string('payment_type');
            $table->decimal('gross_amount', 12, 2);
            $table->enum('transaction_status', [
                'pending', 'capture', 'settlement', 'deny', 'cancel', 'expire',
                'failure', 'refund', 'chargeback', 'partial_refund',
                'partial_chargeback', 'authorize',
            ]);
            $table->json('raw_response');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['transaction_status', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
