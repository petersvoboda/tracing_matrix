<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resource; // Import Resource model
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse; // For type hinting
use Illuminate\Validation\Rule; // For enum validation
use Illuminate\Support\Facades\Validator; // If using Validator facade explicitly

class ResourceController extends Controller
{
    /**
     * Display a listing of the resource.
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        // Remove redundant fetch without eager loading
        // TODO: Add pagination later: Resource::paginate(15);
        $resources = Resource::with(['skills', 'domains'])->get(); // Eager load relationships
        return response()->json($resources);
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
            'name_identifier' => ['required', 'string', 'max:255', 'unique:resources,name_identifier'],
            'type' => ['required', Rule::in(['Human', 'AI Tool', 'Human + AI Tool'])],
            'cost_rate' => ['nullable', 'numeric', 'min:0'],
            'availability_params' => ['nullable', 'json'], // Basic validation, refine if needed
            'productivity_multipliers' => ['nullable', 'json'], // Basic validation, refine if needed
            'ramp_up_time' => ['nullable', 'string', 'max:100'],

            // AI Specific Fields (conditionally required based on type? Or just nullable)
            'implementation_effort' => ['nullable', 'string', 'max:100'],
            'learning_curve' => ['nullable', 'string'],
            'maintenance_overhead' => ['nullable', 'string', 'max:100'],
            'integration_compatibility' => ['nullable', 'string'],

            // Human Specific Fields (conditionally required based on type? Or just nullable)
            'skill_level' => ['nullable', Rule::in(['Junior', 'Mid-Level', 'Senior', 'Principal'])],
            'collaboration_factor' => ['nullable', 'integer', 'min:1', 'max:5'],
            // Validate skills and domains arrays
            'skills' => ['nullable', 'array'],
            'skills.*.id' => ['required_with:skills', 'integer', 'exists:skills,id'],
            'skills.*.proficiency_level' => ['required_with:skills', 'integer', 'min:1', 'max:5'], // Assuming 1-5 scale
            'domains' => ['nullable', 'array'],
            'domains.*.id' => ['required_with:domains', 'integer', 'exists:domains,id'],
            'domains.*.proficiency_level' => ['required_with:domains', 'integer', 'min:1', 'max:5'], // Assuming 1-5 scale
        ]);

        // TODO: Add logic to handle conditional requirement based on 'type' if strict validation is needed

        $resource = Resource::create($validatedData);

        // Handle associating skills/domains
        if ($request->has('skills')) {
            $skillsData = [];
            foreach ($request->skills as $skill) {
                $skillsData[$skill['id']] = ['proficiency_level' => $skill['proficiency_level']];
            }
            $resource->skills()->sync($skillsData);
        } else {
             $resource->skills()->sync([]); // Detach all if no skills array provided
        }

        if ($request->has('domains')) {
            $domainsData = [];
            foreach ($request->domains as $domain) {
                $domainsData[$domain['id']] = ['proficiency_level' => $domain['proficiency_level']];
            }
            $resource->domains()->sync($domainsData);
        } else {
             $resource->domains()->sync([]); // Detach all if no domains array provided
        }

        $resource->load(['skills', 'domains']); // Load relationships for the response

        return response()->json($resource, 201); // Return created resource with 201 status
    }

    /**
     * Display the specified resource.
     * @param  \App\Models\Resource $resource // Route model binding
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Resource $resource): JsonResponse // Use route model binding
    {
        $resource->load(['skills', 'domains']); // Eager load relationships
        return response()->json($resource);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Resource $resource // Route model binding
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Resource $resource): JsonResponse // Use route model binding
    {
         $validatedData = $request->validate([
            // Unique validation needs to ignore the current resource ID
            'name_identifier' => ['required', 'string', 'max:255', Rule::unique('resources')->ignore($resource->id)],
            'type' => ['required', Rule::in(['Human', 'AI Tool', 'Human + AI Tool'])],
            'cost_rate' => ['nullable', 'numeric', 'min:0'],
            'availability_params' => ['nullable', 'json'],
            'productivity_multipliers' => ['nullable', 'json'],
            'ramp_up_time' => ['nullable', 'string', 'max:100'],
            'implementation_effort' => ['nullable', 'string', 'max:100'],
            'learning_curve' => ['nullable', 'string'],
            'maintenance_overhead' => ['nullable', 'string', 'max:100'],
            'integration_compatibility' => ['nullable', 'string'],
            'skill_level' => ['nullable', Rule::in(['Junior', 'Mid-Level', 'Senior', 'Principal'])],
            'collaboration_factor' => ['nullable', 'integer', 'min:1', 'max:5'],
            // Validate skills and domains arrays for update
            'skills' => ['nullable', 'array'],
            'skills.*.id' => ['required_with:skills', 'integer', 'exists:skills,id'],
            'skills.*.proficiency_level' => ['required_with:skills', 'integer', 'min:1', 'max:5'],
            'domains' => ['nullable', 'array'],
            'domains.*.id' => ['required_with:domains', 'integer', 'exists:domains,id'],
            'domains.*.proficiency_level' => ['required_with:domains', 'integer', 'min:1', 'max:5'],
        ]);

        $resource->update($validatedData);

        // Handle updating skills/domains relationships
         if ($request->has('skills')) {
            $skillsData = [];
            foreach ($request->skills as $skill) {
                $skillsData[$skill['id']] = ['proficiency_level' => $skill['proficiency_level']];
            }
            $resource->skills()->sync($skillsData);
        } else {
             // If you want PATCH behaviour (only update provided fields), don't sync empty here.
             // If you want PUT behaviour (replace all), then sync empty:
             $resource->skills()->sync([]);
        }

        if ($request->has('domains')) {
            $domainsData = [];
            foreach ($request->domains as $domain) {
                $domainsData[$domain['id']] = ['proficiency_level' => $domain['proficiency_level']];
            }
            $resource->domains()->sync($domainsData);
        } else {
             // If PUT behaviour desired:
             $resource->domains()->sync([]);
        }

        $resource->load(['skills', 'domains']); // Load relationships for the response

        return response()->json($resource);
    }

    /**
     * Remove the specified resource from storage.
     * @param  \App\Models\Resource $resource // Route model binding
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Resource $resource): JsonResponse // Use route model binding
    {
        // TODO: Add authorization check - ensure user is allowed to delete

        $resource->delete();

        return response()->json(null, 204); // No content response
    }
    /**
     * Calculate the estimated load for a resource, optionally within a specific sprint.
     *
     * @param Request $request
     * @param Resource $resource
     * @return JsonResponse
     */
    public function calculateLoad(Request $request, Resource $resource): JsonResponse
    {
        $request->validate([
            'sprint_id' => ['nullable', 'integer', 'exists:sprints,id']
        ]);

        $sprintId = $request->query('sprint_id');

        // Base query for assigned tasks
        $assignedTasksQuery = $resource->assignments()->with('task'); // Eager load task details

        // Filter by sprint if provided
        if ($sprintId) {
            $assignedTasksQuery->whereHas('task', function ($query) use ($sprintId) {
                $query->where('sprint_id', $sprintId);
            });
        } else {
            // If no sprint specified, maybe consider only tasks in 'To Do' or 'In Progress'?
            // $assignedTasksQuery->whereHas('task', function ($query) {
            //     $query->whereIn('status', ['To Do', 'In Progress']);
            // });
        }

        $assignedTasks = $assignedTasksQuery->get();

        // Sum estimated effort
        $totalAssignedEffort = $assignedTasks->sum('task.estimated_effort'); // Access effort via loaded task relationship

        // --- Calculate Availability (Placeholder/Simplified) ---
        // This needs a proper implementation based on how availability_params are stored and interpreted
        // Example: Assume standard 40 hours/week if no params, or parse FTE/hours from JSON
        $baseAvailability = 40; // Example: hours per week
        $fte = $resource->availability_params['fte'] ?? 1.0; // Example: read FTE from JSON
        $resourceAvailability = $baseAvailability * $fte;
        // TODO: Factor in sprint duration, working days, timezones, leave etc. for accurate calculation

        // Calculate Load Percentage
        $loadPercentage = 0;
        if ($resourceAvailability > 0) {
            $loadPercentage = round(($totalAssignedEffort / $resourceAvailability) * 100);
        } else {
            // Handle zero availability (e.g., AI tool with no time-based capacity, or resource on leave)
            $loadPercentage = $totalAssignedEffort > 0 ? 100 : 0; // Show 100% if assigned anything, 0 otherwise
        }


        return response()->json([
            'resource_id' => $resource->id,
            'name_identifier' => $resource->name_identifier,
            'sprint_id' => $sprintId, // Included for context
            'total_assigned_effort' => $totalAssignedEffort,
            'calculated_availability' => $resourceAvailability, // Placeholder value
            'load_percentage' => $loadPercentage,
            // 'assigned_tasks' => $assignedTasks->pluck('task.id') // Optionally return assigned task IDs
        ]);
    }
}
