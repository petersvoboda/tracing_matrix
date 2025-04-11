<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill; // Import Skill model
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SkillController extends Controller
{
    /**
     * Display a listing of the skills.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $skills = Skill::orderBy('name')->get(); // Get all skills, ordered by name
        return response()->json($skills);
    }
}
