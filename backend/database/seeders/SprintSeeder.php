<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents; // Can be removed if not used
use Illuminate\Database\Seeder;
use App\Models\Sprint; // Import Sprint model
use App\Models\User;   // Import User model to assign creator
use Carbon\Carbon;     // Import Carbon for date manipulation

class SprintSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get the first user to assign as creator (or create one if none exist)
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Default Admin',
                'email' => 'admin@example.com', // Ensure this is unique
            ]);
        }

        Sprint::firstOrCreate(
            ['name' => 'Sprint 1 (Apr Wk 3-4)'],
            [
                'start_date' => Carbon::parse('2025-04-14'),
                'end_date' => Carbon::parse('2025-04-25'),
                'created_by_user_id' => $user->id,
            ]
        );

        Sprint::firstOrCreate(
            ['name' => 'Sprint 2 (May Wk 1-2)'],
            [
                'start_date' => Carbon::parse('2025-04-28'),
                'end_date' => Carbon::parse('2025-05-09'),
                'created_by_user_id' => $user->id,
            ]
        );

         Sprint::firstOrCreate(
            ['name' => 'Backlog (Unscheduled)'], // Example for unscheduled tasks
            [
                'start_date' => null,
                'end_date' => null,
                'created_by_user_id' => $user->id,
            ]
        );
    }
}
