<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'created_by_user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the user who created the sprint.
     */
    public function creator()
    {
        // Assuming the foreign key is 'created_by_user_id'
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get the tasks belonging to the sprint.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
