<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name_identifier',
        'type',
        'cost_rate',
        'availability_params',
        'productivity_multipliers',
        'ramp_up_time',
        'implementation_effort',
        'learning_curve',
        'maintenance_overhead',
        'integration_compatibility',
        'skill_level',
        'collaboration_factor',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'availability_params' => 'array',
        'productivity_multipliers' => 'array',
        'cost_rate' => 'decimal:2', // Cast cost_rate to decimal with 2 places
    ];

    /**
     * The skills possessed by the resource.
     */
    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'resource_skills')
                    ->withPivot('proficiency_level')
                    ; // Pivot table does not have timestamps
    }

    /**
     * The domains the resource has expertise in.
     */
    public function domains()
    {
        return $this->belongsToMany(Domain::class, 'resource_domains')
                    ->withPivot('proficiency_level')
                    ; // Pivot table does not have timestamps
    }

    /**
     * The assignments allocated to the resource.
     */
    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Get the tasks assigned to the resource through assignments.
     */
    public function tasks()
    {
        return $this->hasManyThrough(Task::class, Assignment::class);
        // Note: This assumes the default key names. Adjust if needed.
        // Alternatively, define through the assignments relationship:
        // return $this->assignments()->with('task')->get()->pluck('task'); // Less efficient for querying
    }
}
