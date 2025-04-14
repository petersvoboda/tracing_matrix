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

    // Sprint CRUD
    Route::apiResource('/sprints', SprintController::class);

    // Analytics Endpoints
    Route::get('/analytics/resource-utilization', [\App\Http\Controllers\Api\AnalyticsController::class, 'resourceUtilization'])->middleware('throttle:analytics');
    Route::get('/analytics/assignment-history', [\App\Http\Controllers\Api\AnalyticsController::class, 'assignmentHistory'])->middleware('throttle:analytics');
    Route::get('/analytics/completion-rates', [\App\Http\Controllers\Api\AnalyticsController::class, 'completionRates'])->middleware('throttle:analytics');
    Route::get('/analytics/task-blockers', [\App\Http\Controllers\Api\AnalyticsController::class, 'taskBlockers'])->middleware('throttle:analytics');
    Route::get('/analytics/ai-tool-impact', [\App\Http\Controllers\Api\AnalyticsController::class, 'aiToolImpact'])->middleware('throttle:analytics');
    Route::get('/analytics/burnup-burndown', [\App\Http\Controllers\Api\AnalyticsController::class, 'burnupBurndown'])->middleware('throttle:analytics');
    Route::get('/analytics/resource-availability-heatmap', [\App\Http\Controllers\Api\AnalyticsController::class, 'resourceAvailabilityHeatmap'])->middleware('throttle:analytics');
    // User Management
    // Global OPTIONS handler for CORS preflight
    Route::options('/{any}', function () {
        return response()->json([], 204);
    })->where('any', '.*');
    Route::apiResource('/users', \App\Http\Controllers\Api\UserController::class)->middleware('role:manager');
    Route::apiResource('/sprints', \App\Http\Controllers\Api\SprintController::class)->middleware('role:manager');
    // Add other protected API routes here later
});
