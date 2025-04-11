<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment; // Import Assignment model
use App\Models\Task;       // Import Task model
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AssignmentController extends Controller
{
    /**
     * Assign a resource to a task.
     * Uses updateOrCreate to handle assigning or re-assigning.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'task_id' => ['required', 'integer', 'exists:tasks,id'],
            'resource_id' => ['required', 'integer', 'exists:resources,id'],
        ]);

        // Use updateOrCreate: Find assignment by task_id, or create new if not found.
        // If found, update the resource_id and assigned_at timestamp.
        $assignment = Assignment::updateOrCreate(
            ['task_id' => $validatedData['task_id']], // Attributes to find existing record
            [
                'resource_id' => $validatedData['resource_id'], // Attributes to update or create
                'assigned_at' => now()
            ]
        );

        // Optionally, update the task status if needed (e.g., to 'In Progress')
        // Task::where('id', $validatedData['task_id'])->update(['status' => 'In Progress']);

        return response()->json($assignment->load(['resource', 'task']), 201); // Return created/updated assignment
    }

    /**
     * Unassign a resource from a task (delete the assignment).
     * We identify the assignment via the task ID as per the planned route structure.
     *
     * @param Task $task // Use route model binding for the task
     * @return JsonResponse
     */
    public function destroy(Task $task): JsonResponse
    {
        // Find the assignment associated with this task and delete it
        $deleted = Assignment::where('task_id', $task->id)->delete();

        if ($deleted) {
             // Optionally, update the task status back to 'To Do' or similar
             // $task->update(['status' => 'To Do']);
            return response()->json(null, 204); // No content on successful delete
        } else {
            // Assignment not found for this task
            return response()->json(['message' => 'Assignment not found for this task.'], 404);
        }
    }
}
