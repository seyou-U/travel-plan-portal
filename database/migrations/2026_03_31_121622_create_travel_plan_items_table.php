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
            $table->foreignId('spot_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('sort_order');
            $table->string('title');
            $table->string('spot_name')->nullable();
            $table->time('start_time');
            $table->unsignedSmallInteger('stay_minutes')->default(0);
            $table->string('transportation_type', 20)->nullable();
            $table->unsignedSmallInteger('travel_minutes')->default(0);
            $table->unsignedInteger('transportation_cost')->default(0);
            $table->unsignedInteger('visit_cost')->default(0);
            $table->string('memo')->nullable();
            $table->string('item_type', 20);
            $table->timestamps();
            $table->softDeletes();

            $table->index(
                ['travel_plan_day_id', 'sort_order'],
                'travel_plan_day_sort_order_index',
            );
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
