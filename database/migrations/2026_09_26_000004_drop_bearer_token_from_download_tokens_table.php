<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('download_tokens', function (Blueprint $table): void {
            $table->dropUnique('download_tokens_token_unique');
        });

        Schema::table('download_tokens', function (Blueprint $table): void {
            $table->dropColumn('token');
        });
    }

    public function down(): void
    {
        Schema::table('download_tokens', function (Blueprint $table): void {
            $table->char('token', 64)->nullable()->unique();
        });
    }
};
