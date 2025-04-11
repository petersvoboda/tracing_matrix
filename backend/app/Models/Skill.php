<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
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
     * The resources that possess this skill.
     */
    public function resources()
    {
        return $this->belongsToMany(Resource::class, 'resource_skills')
                    ->withPivot('proficiency_level') // Include proficiency from pivot
                    ->withTimestamps(); // If resource_skills has timestamps (it doesn't currently)
    }

    /**
     * The tasks that require this skill.
     */
    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_skills');
    }
}
