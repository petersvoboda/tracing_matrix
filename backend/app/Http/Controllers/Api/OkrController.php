<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Okr;
use Illuminate\Http\Request;

class OkrController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $okrs = Okr::with(['tasks.assignedResource', 'risks', 'defects', 'owner'])->get();
            return response()->json($okrs);
        } catch (\Throwable $e) {
            \Log::error('OkrController@index error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            \Log::info('OkrController@store: request received', ['data' => $request->all()]);
            $validated = $request->validate([
                'objective' => 'required|string',
                'key_results' => 'nullable|array',
                'owner_id' => 'required|integer|exists:users,id',
                'status' => 'required|string',
            ]);
            $okr = Okr::create($validated);
            return response()->json($okr, 201);
        } catch (\Throwable $e) {
            \Log::error('OkrController@store error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Okr  $okr
     * @return \Illuminate\Http\Response
     */
    public function show(Okr $okr)
    {
        $okr->load([
            'tasks.assignedResource',
            'risks',
            'defects',
            'owner'
        ]);
        return response()->json($okr);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Okr  $okr
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Okr $okr)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Okr  $okr
     * @return \Illuminate\Http\Response
     */
    public function destroy(Okr $okr)
    {
        //
    }
}
