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
        Schema::create('okrs', function (Blueprint $table) {
            $table->id();
            $table->string('objective');
            $table->json('key_results')->nullable(); // Store as JSON array: [{description: '...', target: 100, current: 0, unit: '%'}, ...]
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('status')->default('active'); // e.g., active, completed, archived
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
        Schema::dropIfExists('okrs');
    }
};
