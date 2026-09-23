<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->index()->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('author')->index();
            $table->text('description');
            $table->decimal('price', 12, 2);
            $table->string('cover_image_path', 1024)->nullable();
            $table->string('file_path', 1024);
            $table->enum('file_type', ['pdf', 'epub', 'zip']);
            $table->unsignedBigInteger('file_size');
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            $table->index(['is_published', 'category_id', 'price']);
            $table->index(['is_published', 'price']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
