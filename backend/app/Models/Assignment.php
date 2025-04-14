<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'task_id',
        'resource_id',
        'assigned_at',
        'ai_overhead_hours', // Added AI overhead tracking
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    /**
     * Get the task that was assigned.
     */
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the resource that was assigned.
     */
    public function resource()
    {
        return $this->belongsTo(Resource::class);
    }
}
