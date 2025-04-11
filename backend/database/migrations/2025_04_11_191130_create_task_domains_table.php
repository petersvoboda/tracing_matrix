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
        Schema::create('task_domains', function (Blueprint $table) {
            $table->foreignId('task_id')->constrained('tasks')->onDelete('cascade');
            $table->foreignId('domain_id')->constrained('domains')->onDelete('cascade');
            $table->primary(['task_id', 'domain_id']); // Composite primary key
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
        Schema::dropIfExists('task_domains');
    }
};
