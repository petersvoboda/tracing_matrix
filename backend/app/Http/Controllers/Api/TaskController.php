<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Resource; // Import Resource model
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Collection; // For collection manipulation

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        // Eager load relationships commonly needed for display
        $tasks = Task::with(['sprint', 'assignedResource', 'requiredSkills', 'requiredDomains', 'dependencies'])
                     ->orderBy('priority') // Example ordering
                     ->orderBy('created_at', 'desc')
                     ->get();
        // TODO: Add filtering by status, sprint, etc. later
        // TODO: Add pagination later: Task::with([...])->paginate(20);
        return response()->json($tasks);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'title_id' => ['required', 'string', 'max:255', 'unique:tasks,title_id'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['To Do', 'In Progress', 'Blocked', 'In Review', 'Done'])],
            'priority' => ['required', Rule::in(['Low', 'Medium', 'High', 'Critical'])],
            'estimated_effort' => ['nullable', 'numeric', 'min:0'],
            'sprint_id' => ['nullable', 'integer', 'exists:sprints,id'],
            'deadline' => ['nullable', 'date'],
            // Relationships (arrays of IDs)
            'required_skill_ids' => ['nullable', 'array'],
            'required_skill_ids.*' => ['integer', 'exists:skills,id'],
            'required_domain_ids' => ['nullable', 'array'],
            'required_domain_ids.*' => ['integer', 'exists:domains,id'],
            'dependency_ids' => ['nullable', 'array'], // IDs of tasks this task depends on
            'dependency_ids.*' => ['integer', 'exists:tasks,id'],
        ]);

        // Add the creator ID
        $validatedData['created_by_user_id'] = Auth::id();

        $task = Task::create($validatedData);

        // Sync relationships
        if ($request->has('required_skill_ids')) {
            $task->requiredSkills()->sync($request->input('required_skill_ids', []));
        }
        if ($request->has('required_domain_ids')) {
            $task->requiredDomains()->sync($request->input('required_domain_ids', []));
        }
        if ($request->has('dependency_ids')) {
            $task->dependencies()->sync($request->input('dependency_ids', []));
        }

        // Load relationships for the response
        $task->load(['sprint', 'assignedResource', 'requiredSkills', 'requiredDomains', 'dependencies', 'creator']);

        return response()->json($task, 201);
    }

    /**
     * Display the specified resource.
     * @param  \App\Models\Task $task // Route model binding
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Task $task): JsonResponse
    {
        // Eager load relationships
        $task->load(['sprint', 'assignedResource', 'requiredSkills', 'requiredDomains', 'dependencies', 'dependents', 'creator']);
        return response()->json($task);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Task $task // Route model binding
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $validatedData = $request->validate([
            // Allow updating title_id, but ensure it remains unique ignoring the current task
            'title_id' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('tasks')->ignore($task->id)],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'required', Rule::in(['To Do', 'In Progress', 'Blocked', 'In Review', 'Done'])],
            'priority' => ['sometimes', 'required', Rule::in(['Low', 'Medium', 'High', 'Critical'])],
            'estimated_effort' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'sprint_id' => ['sometimes', 'nullable', 'integer', 'exists:sprints,id'],
            'deadline' => ['sometimes', 'nullable', 'date'],
            // Relationships (arrays of IDs) - use 'sometimes' if not always present in update requests
            'required_skill_ids' => ['sometimes', 'nullable', 'array'],
            'required_skill_ids.*' => ['integer', 'exists:skills,id'],
            'required_domain_ids' => ['sometimes', 'nullable', 'array'],
            'required_domain_ids.*' => ['integer', 'exists:domains,id'],
            'dependency_ids' => ['sometimes', 'nullable', 'array'],
            'dependency_ids.*' => ['integer', 'exists:tasks,id', Rule::notIn([$task->id])], // Prevent self-dependency
        ]);

        // Update only the validated fields
        $task->update($validatedData);

        // Log received relationship IDs for debugging
        \Log::info('Task Update Request - Skill IDs:', ['ids' => $request->input('required_skill_ids', 'MISSING')]);
        \Log::info('Task Update Request - Domain IDs:', ['ids' => $request->input('required_domain_ids', 'MISSING')]);

        // Always sync relationships, using input array or defaulting to empty array
        $task->requiredSkills()->sync($request->input('required_skill_ids', []));
        $task->requiredDomains()->sync($request->input('required_domain_ids', []));
        $task->dependencies()->sync($request->input('dependency_ids', []));

        // Explicitly reload the relationships to ensure the instance has the latest data
        $task->load('requiredSkills', 'requiredDomains', 'dependencies');

        // Load other relationships needed for the response (loadMissing avoids reloading already loaded ones)
        $task->loadMissing(['sprint', 'assignedResource', 'dependents', 'creator']);

        return response()->json($task);
    }

    /**
     * Remove the specified resource from storage.
     * @param  \App\Models\Task $task // Route model binding
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Task $task): JsonResponse
    {
        // TODO: Add authorization check

        // Relationships on pivot tables (skills, domains, dependencies) should cascade delete
        // based on foreign key constraints if set up correctly, or be handled by observers/events if needed.
        // Manually detaching is usually not required if constraints are set.

        $task->delete();

        return response()->json(null, 204); // No content response
    }
    /**
     * Get suggested resources for a specific task.
     *
     * @param Task $task
     * @return JsonResponse
     */
    public function getSuggestions(Task $task): JsonResponse
    {
        // 1. Get Task Requirements (load if not already loaded)
        $task->loadMissing(['requiredSkills', 'requiredDomains']);
        $requiredSkillIds = $task->requiredSkills->pluck('id');
        $requiredDomainIds = $task->requiredDomains->pluck('id');

        // 2. Get Available Resources (load relationships needed for scoring)
        // TODO: Filter resources based on actual availability (e.g., within sprint timeframe, not overloaded) - Complex!
        $availableResources = Resource::with(['skills', 'domains', 'assignments']) // Load assignments to check load later
                                      ->get();

        // 3. Calculate Fit Score for each resource
        $suggestions = $availableResources->map(function ($resource) use ($task, $requiredSkillIds, $requiredDomainIds) {
            $score = 0;
            $scoreBreakdown = []; // To explain the score

            // --- Skill Matching ---
            $matchingSkills = $resource->skills->whereIn('id', $requiredSkillIds);
            $skillScore = 0;
            if ($requiredSkillIds->isNotEmpty()) {
                $skillMatchCount = $matchingSkills->count();
                // Simple score: points per match, weighted by proficiency
                foreach ($matchingSkills as $skill) {
                    $skillScore += $skill->pivot->proficiency_level ?? 1; // Add proficiency score
                }
                 // Normalize score (e.g., percentage of required skills met, weighted) - simplified for now
                $score += $skillScore * 10; // Weight skill score heavily
                $scoreBreakdown['skill_match'] = "{$skillMatchCount}/{$requiredSkillIds->count()} skills matched (Score: {$skillScore})";
            } else {
                 $scoreBreakdown['skill_match'] = "No specific skills required.";
            }


            // --- Domain Matching ---
            $matchingDomains = $resource->domains->whereIn('id', $requiredDomainIds);
            $domainScore = 0;
             if ($requiredDomainIds->isNotEmpty()) {
                $domainMatchCount = $matchingDomains->count();
                 foreach ($matchingDomains as $domain) {
                    $domainScore += $domain->pivot->proficiency_level ?? 1;
                }
                $score += $domainScore * 5; // Weight domain score
                $scoreBreakdown['domain_match'] = "{$domainMatchCount}/{$requiredDomainIds->count()} domains matched (Score: {$domainScore})";
            } else {
                 $scoreBreakdown['domain_match'] = "No specific domains required.";
            }

            // --- Productivity Multipliers (Simplified Example) ---
            // TODO: Implement properly based on task type/skills and resource multipliers JSON
            $productivityMultiplier = 1.0; // Default
            // Example: if task needs React and resource has multiplier for it
            // if ($requiredSkillIds->contains(SKILL_ID_FOR_REACT) && isset($resource->productivity_multipliers['react_skill_id'])) {
            //     $productivityMultiplier = $resource->productivity_multipliers['react_skill_id'];
            //     $score *= $productivityMultiplier; // Apply multiplier
            //     $scoreBreakdown['productivity'] = "Multiplier: {$productivityMultiplier}";
            // }

             // --- AI Tool Factors (Simplified Example) ---
             if ($resource->type === 'AI Tool' || $resource->type === 'Human + AI Tool') {
                 // Penalize slightly for learning curve? Boost for potential?
                 // $score += 5; // Example boost
                 // $scoreBreakdown['ai_factor'] = "AI Tool bonus applied";
             }

             // --- Availability / Load (Placeholder) ---
             // TODO: Calculate actual load based on assigned tasks' effort within a timeframe (e.g., sprint)
             $projectedLoad = rand(20, 110); // Random placeholder load %
             $scoreBreakdown['load'] = "Projected Load: {$projectedLoad}% (Placeholder)";
             // Penalize heavily if overloaded
             if ($projectedLoad > 100) {
                 $score *= 0.5; // Halve score if overloaded
             }


            return [
                'resource_id' => $resource->id,
                'name_identifier' => $resource->name_identifier,
                'type' => $resource->type,
                'fit_score' => round($score, 2),
                'projected_load_percent' => $projectedLoad, // Placeholder
                'score_breakdown' => $scoreBreakdown,
            ];
        });

        // 4. Sort suggestions by score (descending)
        $sortedSuggestions = $suggestions->sortByDesc('fit_score');

        return response()->json($sortedSuggestions->values()->all()); // Return as a simple array
    }
}
