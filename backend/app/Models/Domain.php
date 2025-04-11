<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Domain extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * The resources that have expertise in this domain.
     */
    public function resources()
    {
        return $this->belongsToMany(Resource::class, 'resource_domains')
                    ->withPivot('proficiency_level') // Include proficiency from pivot
                    ->withTimestamps(); // If resource_domains has timestamps (it doesn't currently)
    }

    /**
     * The tasks that require expertise in this domain.
     */
    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_domains');
    }
}
