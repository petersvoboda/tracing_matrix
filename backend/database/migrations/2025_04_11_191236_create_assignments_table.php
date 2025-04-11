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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->unique()->constrained('tasks')->onDelete('cascade'); // Task being assigned (unique constraint assumes one primary assignment)
            $table->foreignId('resource_id')->constrained('resources')->onDelete('cascade'); // Resource assigned to the task
            $table->timestamp('assigned_at')->useCurrent(); // Record when the assignment was made
            $table->timestamps(); // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('assignments');
    }
};
