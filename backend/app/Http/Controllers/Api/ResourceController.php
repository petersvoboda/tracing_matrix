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

        // Decode JSON fields if they are strings
        if (isset($validatedData['availability_params']) && is_string($validatedData['availability_params'])) {
            $validatedData['availability_params'] = json_decode($validatedData['availability_params'], true);
        }
        if (isset($validatedData['productivity_multipliers']) && is_string($validatedData['productivity_multipliers'])) {
            $validatedData['productivity_multipliers'] = json_decode($validatedData['productivity_multipliers'], true);
        }
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

        // Decode JSON fields if they are strings
        if (isset($validatedData['availability_params']) && is_string($validatedData['availability_params'])) {
            $validatedData['availability_params'] = json_decode($validatedData['availability_params'], true);
        }
        if (isset($validatedData['productivity_multipliers']) && is_string($validatedData['productivity_multipliers'])) {
            $validatedData['productivity_multipliers'] = json_decode($validatedData['productivity_multipliers'], true);
        }
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
        // --- Real Availability Calculation ---
        $baseAvailability = 40; // Default: 40 hours/week
        $fte = $resource->availability_params['fte'] ?? 1.0;
        $workingHours = $resource->availability_params['working_hours'] ?? null;
        $plannedLeave = $resource->availability_params['planned_leave'] ?? [];
        $resourceAvailability = 0;

        // Determine period (sprint) for calculation
        $periodStart = null;
        $periodEnd = null;
        if ($sprintId && $resource->assignments()->with('task')->whereHas('task', fn($q) => $q->where('sprint_id', $sprintId))->exists()) {
            $sprint = \App\Models\Sprint::find($sprintId);
            if ($sprint) {
                $periodStart = \Carbon\Carbon::parse($sprint->start_date);
                $periodEnd = \Carbon\Carbon::parse($sprint->end_date);
            }
        }
        if (!$periodStart || !$periodEnd) {
            // Default to current week
            $periodStart = \Carbon\Carbon::now()->startOfWeek();
            $periodEnd = \Carbon\Carbon::now()->endOfWeek();
        }

        // Calculate total available hours in the period
        $totalAvailableHours = 0;
        $current = $periodStart->copy();
        while ($current->lte($periodEnd)) {
            $dayOfWeek = $current->dayOfWeekIso; // 1=Mon, 7=Sun
            $isWorkingDay = true;
            $workStart = 9; // Default 9:00
            $workEnd = 17;  // Default 17:00
            if ($workingHours) {
                if (isset($workingHours['days']) && is_array($workingHours['days'])) {
                    $isWorkingDay = in_array($dayOfWeek, $workingHours['days']);
                }
                if (isset($workingHours['start'])) {
                    $workStart = intval(explode(':', $workingHours['start'])[0]);
                }
                if (isset($workingHours['end'])) {
                    $workEnd = intval(explode(':', $workingHours['end'])[0]);
                }
            }
            // Subtract planned leave
            $onLeave = false;
            foreach ($plannedLeave as $leave) {
                if (isset($leave['start'], $leave['end'])) {
                    $leaveStart = \Carbon\Carbon::parse($leave['start']);
                    $leaveEnd = \Carbon\Carbon::parse($leave['end']);
                    if ($current->between($leaveStart, $leaveEnd)) {
                        $onLeave = true;
                        break;
                    }
                }
            }
            if ($isWorkingDay && !$onLeave) {
                $hours = max(0, $workEnd - $workStart);
                $totalAvailableHours += $hours;
            }
            $current->addDay();
        }
        // Apply FTE
        $resourceAvailability = $totalAvailableHours * $fte;
        // Fallback to baseAvailability * fte if no working hours specified
        if ($resourceAvailability === 0) {
            $resourceAvailability = $baseAvailability * $fte;
        }

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
