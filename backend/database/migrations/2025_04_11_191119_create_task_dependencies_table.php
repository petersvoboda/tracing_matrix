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
        Schema::create('task_dependencies', function (Blueprint $table) {
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade'); // The task that depends on another
            $table->foreignId('depends_on_task_id')->constrained('tasks')->onDelete('cascade'); // The prerequisite task
            $table->primary(['task_id', 'depends_on_task_id']); // Composite primary key
            // No timestamps needed
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('task_dependencies');
    }
};
