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
        Schema::create('travel_plan_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_plan_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('spot_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('spot_name');
            $table->string('prefecture_code', 2);
            $table->time('start_time');
            $table->unsignedSmallInteger('stay_minutes');
            $table->unsignedTinyInteger('transportation_type');
            $table->unsignedSmallInteger('travel_minutes');
            $table->unsignedInteger('transportation_cost')->nullable();
            $table->unsignedInteger('visit_cost')->nullable();
            $table->string('memo')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('travel_plan_items');
    }
};
