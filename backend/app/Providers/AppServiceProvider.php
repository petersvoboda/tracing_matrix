<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        \Illuminate\Database\Eloquent\Relations\Relation::morphMap([
            'App\\Models\\Task' => \App\Models\Task::class,
            'App\\\\Models\\\\Task' => \App\Models\Task::class,
            'App\\Models\\Okr' => \App\Models\Okr::class,
            'App\\\\Models\\\\Okr' => \App\Models\Okr::class,
            'App\\Models\\Sprint' => \App\Models\Sprint::class,
        ]);
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
