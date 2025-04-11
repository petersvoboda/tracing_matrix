<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Skill; // Import the Skill model
use Illuminate\Support\Facades\DB; // Optional: if using DB facade directly

class SkillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $skills = [
            ['name' => 'Frontend Development - React'],
            ['name' => 'Backend Development - Node.js'], // Keep even if backend is Laravel, might be relevant skill
            ['name' => 'Backend Development - PHP/Laravel'],
            ['name' => 'API Testing - Playwright'],
            ['name' => 'Data Analysis - Python'],
            ['name' => 'UI/UX Design'],
            ['name' => 'Database Management - MySQL'],
            ['name' => 'Project Management'],
            ['name' => 'DevOps - Docker'],
            ['name' => 'Cloud Services - AWS'], // Example
        ];

        foreach ($skills as $skill) {
            Skill::firstOrCreate($skill);
            // Or using DB facade:
            // DB::table('skills')->updateOrInsert(['name' => $skill['name']], $skill);
        }
    }
}
