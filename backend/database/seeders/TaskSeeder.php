<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\User;
use App\Models\Skill;
use App\Models\Domain;
use App\Models\Sprint;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get prerequisite data (user, skills, domains, sprints)
        $user = User::first(); // Assuming user exists from SprintSeeder or previous runs
        if (!$user) { return; } // Stop if no user

        $skillReact = Skill::where('name', 'Frontend Development - React')->first();
        $skillLaravel = Skill::where('name', 'Backend Development - PHP/Laravel')->first();
        $domainEcom = Domain::where('name', 'E-commerce')->first();
        $sprint1 = Sprint::where('name', 'Sprint 1 (Apr Wk 3-4)')->first();
        $sprint2 = Sprint::where('name', 'Sprint 2 (May Wk 1-2)')->first();

        // Task 1
        $task1 = Task::firstOrCreate(
            ['title_id' => 'FE-LOGIN'],
            [
                'description' => 'Implement the frontend login page UI and API connection.',
                'status' => 'To Do',
                'priority' => 'High',
                'estimated_effort' => 8,
                'sprint_id' => $sprint1?->id,
                'created_by_user_id' => $user->id,
            ]
        );
        if ($skillReact) { $task1->requiredSkills()->syncWithoutDetaching([$skillReact->id]); }
        if ($domainEcom) { $task1->requiredDomains()->syncWithoutDetaching([$domainEcom->id]); }


        // Task 2 (Depends on Task 1)
        $task2 = Task::firstOrCreate(
            ['title_id' => 'BE-AUTH-API'],
            [
                'description' => 'Implement backend registration, login, logout API endpoints.',
                'status' => 'To Do',
                'priority' => 'High',
                'estimated_effort' => 12,
                'sprint_id' => $sprint1?->id,
                'created_by_user_id' => $user->id,
            ]
        );
         if ($skillLaravel) { $task2->requiredSkills()->syncWithoutDetaching([$skillLaravel->id]); }
         // No specific domain for this one

        // Task 3 (Depends on Task 2)
        $task3 = Task::firstOrCreate(
            ['title_id' => 'FE-RESOURCE-HUB'],
            [
                'description' => 'Build the Resource Hub UI (Table, Add/Edit Form).',
                'status' => 'To Do',
                'priority' => 'Medium',
                'estimated_effort' => 16,
                'sprint_id' => $sprint2?->id,
                'created_by_user_id' => $user->id,
            ]
        );
        if ($skillReact) { $task3->requiredSkills()->syncWithoutDetaching([$skillReact->id]); }
        // Add dependency: Task 3 depends on Task 2
        $task3->dependencies()->syncWithoutDetaching([$task2->id]);
    }
}
