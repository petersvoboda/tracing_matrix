<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sprint; // Import Sprint model
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SprintController extends Controller
{
    /**
     * Display a listing of the sprints.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        // Order by start date perhaps?
        $sprints = Sprint::orderBy('start_date', 'desc')->get();
        return response()->json($sprints);
    }

    // TODO: Add store, show, update, destroy methods later if full Sprint CRUD is needed
}
