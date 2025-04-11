<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Domain; // Import the Domain model
use Illuminate\Support\Facades\DB; // Optional

class DomainSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $domains = [
            ['name' => 'E-commerce'],
            ['name' => 'FinTech'],
            ['name' => 'Healthcare'],
            ['name' => 'Logistics'], // Example
            ['name' => 'Education'], // Example
        ];

        foreach ($domains as $domain) {
            Domain::firstOrCreate($domain);
            // Or using DB facade:
            // DB::table('domains')->updateOrInsert(['name' => $domain['name']], $domain);
        }
    }
}
