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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title_id')->unique();
            $table->text('description')->nullable();
            $table->enum('status', ['To Do', 'In Progress', 'Blocked', 'In Review', 'Done'])->default('To Do');
            $table->enum('priority', ['Low', 'Medium', 'High', 'Critical'])->default('Medium');
            $table->decimal('estimated_effort', 8, 2)->nullable(); // e.g., hours or points
            $table->foreignId('sprint_id')->nullable()->constrained('sprints')->onDelete('set null');
            $table->date('deadline')->nullable();
            $table->foreignId('created_by_user_id')->constrained('users')->onDelete('cascade'); // Task must have a creator
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
        Schema::dropIfExists('tasks');
    }
};
