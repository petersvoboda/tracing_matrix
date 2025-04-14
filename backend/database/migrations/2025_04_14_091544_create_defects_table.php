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
        Schema::create('defects', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->string('status')->default('Open'); // Open, Closed, In Progress, etc.
            $table->string('severity')->default('Medium'); // Low, Medium, High, Critical
            $table->foreignId('reported_by_user_id')->constrained('users');
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users');
            $table->nullableMorphs('linkable'); // linkable_type, linkable_id for Task, Okr, Sprint, etc.
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
        Schema::dropIfExists('defects');
    }
};
