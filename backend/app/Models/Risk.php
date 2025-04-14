<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Risk extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'description',
        'type',
        'probability',
        'impact',
        'mitigation',
        'owner_id',
        'status',
        'linkable_id',
        'linkable_type',
    ];

    /**
     * Get the owner (user) that owns the risk.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the parent linkable model (Okr, Task, Sprint, etc.).
     */
    public function linkable(): MorphTo
    {
        return $this->morphTo();
    }
}