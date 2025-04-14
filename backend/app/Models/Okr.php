<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany; // Import MorphMany

class Okr extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'objective',
        'key_results',
        'owner_id',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'key_results' => 'array', // Cast the JSON column to an array
    ];

    /**
     * Get the owner (user) that owns the OKR.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    
        /**
         * The tasks that belong to the OKR.
         */
        public function tasks(): BelongsToMany
        {
            return $this->belongsToMany(Task::class, 'okr_task'); // Using the pivot table name
        }

    /**
     * Get all of the OKR's risks.
     */
    public function risks(): MorphMany
    {
        return $this->morphMany(Risk::class, 'linkable');
    }

    /**
     * Get all of the OKR's defects.
     */
    public function defects(): MorphMany
    {
        return $this->morphMany(Defect::class, 'linkable');
    }

    // Relationships to Sprints, Features etc. can be added here later
    } // Added missing closing brace for the class