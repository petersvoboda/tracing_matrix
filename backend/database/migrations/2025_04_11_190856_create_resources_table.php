<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('name_identifier')->unique();
            $table->enum('type', ['Human', 'AI Tool', 'Human + AI Tool']);
            $table->decimal('cost_rate', 8, 2)->nullable(); // Example precision: 8 total digits, 2 decimal places
            $table->json('availability_params')->nullable(); // Store FTE, hours, timezone, leave etc.
            $table->json('productivity_multipliers')->nullable(); // { "skill_id": 1.2, "task_type_general": 0.9 }
            $table->string('ramp_up_time')->nullable(); // e.g., "8 hours", "2 days"

            // AI Specific Fields (nullable)
            $table->string('implementation_effort')->nullable();
            $table->text('learning_curve')->nullable();
            $table->string('maintenance_overhead')->nullable();
            $table->text('integration_compatibility')->nullable();

            // Human Specific Fields (nullable)
            $table->enum('skill_level', ['Junior', 'Mid-Level', 'Senior', 'Principal'])->nullable();
            $table->tinyInteger('collaboration_factor')->unsigned()->nullable(); // e.g., 1-5

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('resources');
    }
};
