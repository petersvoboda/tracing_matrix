<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Resource;
use App\Models\Assignment;
use App\Models\Sprint;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class AnalyticsController extends Controller
{
    public function resourceUtilization(Request $request): JsonResponse
    {
        $start = Carbon::now()->subDays(30)->startOfDay();
        $end = Carbon::now()->endOfDay();

        $result = Cache::remember('analytics_resource_utilization', 300, function () use ($start, $end) {
            $resources = Resource::all();
            $result = [];

            foreach ($resources as $resource) {
                try {
                    $assignments = $resource->assignments()
                        ->whereHas('task', function ($q) use ($start, $end) {
                            $q->whereBetween('created_at', [$start, $end]);
                        })
                        ->with('task')
                        ->get();

                    $totalEffort = $assignments->sum(fn($a) => $a->task->estimated_effort ?? 0);

                    $fte = $resource->availability_params['fte'] ?? 1.0;
                    $availableHours = 40 * 4.3 * $fte;

                    if ($availableHours <= 0) {
                        continue;
                    }

                    $utilization = round(($totalEffort / $availableHours) * 100);

                    $result[] = [
                        'name' => $resource->name_identifier,
                        'utilization' => $utilization,
                    ];
                } catch (\Throwable $e) {
                    \Log::error('Resource Utilization Error', [
                        'resource_id' => $resource->id,
                        'error' => $e->getMessage(),
                    ]);
                    continue;
                }
            }

            return $result;
        });

        return response()->json($result);
    }

    public function assignmentHistory(Request $request): JsonResponse
    {
        try {
            $start = Carbon::now()->subDays(30)->startOfDay();
            $end = Carbon::now()->endOfDay();

            $history = Assignment::whereBetween('created_at', [$start, $end])
                ->get()
                ->groupBy(fn($a) => Carbon::parse($a->created_at)->toDateString())
                ->map(fn($group, $date) => [
                    'date' => $date,
                    'assignments' => $group->count(),
                ])
                ->values();

            return response()->json($history);
        } catch (\Throwable $e) {
            \Log::error('Assignment History Error', ['error' => $e->getMessage()]);
            return response()->json([]);
        }
    }

    public function completionRates(Request $request): JsonResponse
    {
        try {
            $sprints = Sprint::with('tasks')->get();
            $result = [];

            foreach ($sprints as $sprint) {
                $total = $sprint->tasks->count();
                $completed = $sprint->tasks->where('status', 'Done')->count();
                $result[] = [
                    'sprint' => $sprint->name,
                    'completed' => $completed,
                    'total' => $total,
                ];
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            \Log::error('Completion Rates Error', ['error' => $e->getMessage()]);
            return response()->json([]);
        }
    }

    public function taskBlockers(Request $request): JsonResponse
    {
        try {
            $blockedTasks = Task::where('status', 'Blocked')->get();
            $result = [];
            foreach ($blockedTasks as $task) {
                $reason = $task->blocker_reason ?? 'Unknown/Unspecified';
                $start = $task->created_at ? Carbon::parse($task->created_at) : null;
                $end = $task->updated_at ? Carbon::parse($task->updated_at) : null;
                $hoursBlocked = ($start && $end) ? $end->diffInHours($start) : 0;

                if (!isset($result[$reason])) {
                    $result[$reason] = [
                        'reason' => $reason,
                        'count' => 0,
                        'total_hours_blocked' => 0,
                    ];
                }
                $result[$reason]['count'] += 1;
                $result[$reason]['total_hours_blocked'] += $hoursBlocked;
            }
            $final = [];
            foreach ($result as $reason => $data) {
                $final[] = [
                    'reason' => $data['reason'],
                    'count' => $data['count'],
                    'avg_hours_blocked' => $data['count'] > 0 ? round($data['total_hours_blocked'] / $data['count'], 1) : 0,
                ];
            }
            return response()->json($final);
        } catch (\Throwable $e) {
            \Log::error('Task Blockers Error', ['error' => $e->getMessage()]);
            return response()->json([]);
        }
    }

    public function aiToolImpact(Request $request): JsonResponse
    {
        try {
            $types = ['Human', 'AI Tool', 'Human + AI Tool'];
            $result = [];

            foreach ($types as $type) {
                $resources = Resource::where('type', $type)->get();
                $resourceIds = $resources->pluck('id');
                $assignments = Assignment::whereIn('resource_id', $resourceIds)->with('task')->get();
                $completedTasks = $assignments->filter(function ($a) {
                    return $a->task && $a->task->status === 'Done' && $a->task->created_at && $a->task->updated_at;
                });
                $completionTimes = $completedTasks->map(function ($a) {
                    $created = Carbon::parse($a->task->created_at);
                    $done = Carbon::parse($a->task->updated_at);
                    return $done->diffInHours($created) / 24;
                });
                $avgCompletion = $completionTimes->count() > 0 ? round($completionTimes->avg(), 2) : 0;
                $result[] = [
                    'type' => $type,
                    'avg_completion_days' => $avgCompletion,
                    'completed_tasks' => $completedTasks->count(),
                ];
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            \Log::error('AI Tool Impact Error', ['error' => $e->getMessage()]);
            return response()->json([]);
        }
    }

    public function burnupBurndown(Request $request): JsonResponse
    {
        $result = Cache::remember('analytics_burnup_burndown', 300, function () {
            try {
                $sprints = Sprint::with('tasks')->get();
                $result = [];

                foreach ($sprints as $sprint) {
                    $start = Carbon::parse($sprint->start_date);
                    $end = Carbon::parse($sprint->end_date);
                    $days = [];
                    $current = $start->copy();
                    $totalTasks = $sprint->tasks->count();
                    $completionMap = [];
                    foreach ($sprint->tasks as $task) {
                        if ($task->status === 'Done' && $task->updated_at) {
                            $doneDate = Carbon::parse($task->updated_at)->toDateString();
                            $completionMap[$doneDate] = ($completionMap[$doneDate] ?? 0) + 1;
                        }
                    }
                    $cumulative = 0;
                    while ($current->lte($end)) {
                        $dateStr = $current->toDateString();
                        $completedToday = $completionMap[$dateStr] ?? 0;
                        $cumulative += $completedToday;
                        $remaining = $totalTasks - $cumulative;
                        $days[] = [
                            'date' => $dateStr,
                            'burnup' => $cumulative,
                            'burndown' => max($remaining, 0),
                        ];
                        $current->addDay();
                    }
                    $result[] = [
                        'sprint' => $sprint->name,
                        'days' => $days,
                        'total' => $totalTasks,
                    ];
                }
                return $result;
            } catch (\Throwable $e) {
                \Log::error('Burnup/Burndown Error', ['error' => $e->getMessage()]);
                return [];
            }
        });

        return response()->json($result);
    }

    public function resourceAvailabilityHeatmap(Request $request): JsonResponse
    {
        try {
            $resources = Resource::all();
            $start = Carbon::now()->startOfDay();
            $end = Carbon::now()->addDays(29)->endOfDay();

            $result = [];

            foreach ($resources as $resource) {
                $availability = [];
                $params = $resource->availability_params ?? [];
                $fte = $params['fte'] ?? 1.0;
                $working_hours = $params['working_hours'] ?? null;
                $planned_leave = $params['planned_leave'] ?? [];

                $current = $start->copy();
                while ($current->lte($end)) {
                    $dayOfWeek = $current->dayOfWeekIso;
                    $isWorkingDay = true;
                    $workStart = 9;
                    $workEnd = 17;
                    if ($working_hours) {
                        if (isset($working_hours['days']) && is_array($working_hours['days'])) {
                            $isWorkingDay = in_array($dayOfWeek, $working_hours['days']);
                        }
                        if (isset($working_hours['start'])) {
                            $workStart = intval(explode(':', $working_hours['start'])[0]);
                        }
                        if (isset($working_hours['end'])) {
                            $workEnd = intval(explode(':', $working_hours['end'])[0]);
                        }
                    }
                    $onLeave = false;
                    foreach ($planned_leave as $leave) {
                        if (isset($leave['start'], $leave['end'])) {
                            $leaveStart = Carbon::parse($leave['start']);
                            $leaveEnd = Carbon::parse($leave['end']);
                            if ($current->between($leaveStart, $leaveEnd)) {
                                $onLeave = true;
                                break;
                            }
                        }
                    }
                    $hours = 0;
                    if ($isWorkingDay && !$onLeave) {
                        $hours = max(0, $workEnd - $workStart) * $fte;
                    }
                    $availability[] = [
                        'date' => $current->toDateString(),
                        'hours' => $hours,
                    ];
                    $current->addDay();
                }
                $result[] = [
                    'resource' => $resource->name_identifier,
                    'availability' => $availability,
                ];
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            \Log::error('Resource Availability Heatmap Error', ['error' => $e->getMessage()]);
            return response()->json([]);
        }
    }
}
