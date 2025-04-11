<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\SkillController; // Import SkillController
use App\Http\Controllers\Api\DomainController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\SprintController; // Import SprintController
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Resource CRUD
    Route::apiResource('/resources', ResourceController::class);

    // Skills & Domains Lists
    Route::get('/skills', [SkillController::class, 'index']);
    Route::get('/domains', [DomainController::class, 'index']);

    // Task CRUD
    Route::apiResource('/tasks', TaskController::class);

    // Task Suggestions
    Route::get('/tasks/{task}/suggestions', [TaskController::class, 'getSuggestions']);

    // Assignments
    Route::post('/assignments', [AssignmentController::class, 'store']); // Assign resource to task
    Route::delete('/assignments/{task}', [AssignmentController::class, 'destroy']); // Unassign resource from task (using task ID)

    // Resource Load Calculation
    Route::get('/resources/{resource}/load', [ResourceController::class, 'calculateLoad']);

    // Sprint List
    Route::get('/sprints', [SprintController::class, 'index']);

    // Add other protected API routes here later
});
