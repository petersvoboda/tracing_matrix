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
        Schema::create('risks', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->string('type')->nullable(); // e.g., Security, Ethical, Compliance, Delivery, AI-Specific
            $table->string('probability')->default('Medium'); // Low, Medium, High
            $table->string('impact')->default('Medium'); // Low, Medium, High
            $table->text('mitigation')->nullable();
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('status')->default('Open'); // Open, Mitigated, Closed, Accepted
            $table->nullableMorphs('linkable'); // Adds linkable_id and linkable_type (e.g., linkable_type='App\Models\Okr', linkable_id=1)
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
        Schema::dropIfExists('risks');
    }
};
