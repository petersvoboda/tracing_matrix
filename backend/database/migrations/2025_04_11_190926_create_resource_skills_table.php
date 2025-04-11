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
        Schema::create('resource_skills', function (Blueprint $table) {
            $table->foreignId('resource_id')->constrained('resources')->onDelete('cascade');
            $table->foreignId('skill_id')->constrained('skills')->onDelete('cascade');
            $table->tinyInteger('proficiency_level')->unsigned(); // e.g., 1-5 scale
            $table->primary(['resource_id', 'skill_id']); // Composite primary key
            // No timestamps needed for this pivot table unless specifically required
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('resource_skills');
    }
};
