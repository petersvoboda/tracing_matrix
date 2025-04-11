<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Domain; // Import Domain model
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DomainController extends Controller
{
    /**
     * Display a listing of the domains.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $domains = Domain::orderBy('name')->get(); // Get all domains, ordered by name
        return response()->json($domains);
    }
}
