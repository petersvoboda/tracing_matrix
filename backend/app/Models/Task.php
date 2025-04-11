<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title_id',
        'description',
        'status',
        'priority',
        'estimated_effort',
        'sprint_id',
        'deadline',
        'created_by_user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'estimated_effort' => 'decimal:2',
        'deadline' => 'date',
    ];

    /**
     * Get the sprint that the task belongs to.
     */
    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }

    /**
     * Get the user who created the task.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * The skills required for this task.
     */
    public function requiredSkills()
    {
        return $this->belongsToMany(Skill::class, 'task_skills');
    }

    /**
     * The domains required for this task.
     */
    public function requiredDomains()
    {
        return $this->belongsToMany(Domain::class, 'task_domains');
    }

    /**
     * The tasks that this task depends on (prerequisites).
     */
    public function dependencies()
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'task_id', 'depends_on_task_id');
    }

    /**
     * The tasks that depend on this task.
     */
    public function dependents()
    {
        return $this->belongsToMany(Task::class, 'task_dependencies', 'depends_on_task_id', 'task_id');
    }

    /**
     * Get the assignment record for this task (assuming one primary assignment).
     */
    public function assignment()
    {
        return $this->hasOne(Assignment::class);
    }

    /**
     * Get the resource assigned to this task.
     */
    public function assignedResource()
    {
        // Define the relationship through the assignment
        // Use hasOneThrough: Task -> Assignment -> Resource
        // Need to specify keys carefully if not following conventions perfectly
        // Or simply access via the assignment relationship: $task->assignment->resource
        return $this->hasOneThrough(
            Resource::class,
            Assignment::class,
            'task_id', // Foreign key on assignments table...
            'id',      // Foreign key on resources table...
            'id',      // Local key on tasks table...
            'resource_id' // Local key on assignments table...
        );
        // Simpler alternative (often preferred):
        // return $this->assignment ? $this->assignment->resource : null;
    }
}
