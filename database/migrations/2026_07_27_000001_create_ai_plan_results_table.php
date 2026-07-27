<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ai_plan_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_plan_request_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();
            $table->json('result_payload');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_plan_results');
    }
};
