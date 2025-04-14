<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Defect extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'status',
        'severity',
        'reported_by_user_id',
        'assigned_to_user_id',
        'linkable_id',
        'linkable_type',
    ];

    /**
     * Get the parent linkable model (Task, Okr, Sprint, etc.).
     */
    public function linkable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who reported the defect.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by_user_id');
    }

    /**
     * Get the user assigned to the defect.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }
}