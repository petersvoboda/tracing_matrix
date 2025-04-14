<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SprintController extends Controller
{
    public function index(): JsonResponse
    {
        $sprints = Sprint::orderBy('start_date', 'desc')->get();
        return response()->json($sprints);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
        $sprint = Sprint::create($validated);
        return response()->json($sprint, 201);
    }

    public function show(Sprint $sprint): JsonResponse
    {
        $sprint->load([
            'tasks.assignedResource',
            'risks',
            'defects'
        ]);
        return response()->json($sprint);
    }

    public function update(Request $request, Sprint $sprint): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
        ]);
        $sprint->update($validated);
        return response()->json($sprint);
    }

    public function destroy(Sprint $sprint): JsonResponse
    {
        $sprint->delete();
        return response()->json(null, 204);
    }
}
