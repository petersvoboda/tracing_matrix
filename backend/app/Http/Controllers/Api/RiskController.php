<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Risk;
use Illuminate\Http\Request;

class RiskController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        \Log::info('RiskController@index: called');
        try {
            \Log::info('RiskController@index: fetching risks with owner and linkable');
            $rawRisks = \DB::table('risks')->select('id', 'linkable_type')->get();
            foreach ($rawRisks as $rawRisk) {
                \Log::info('RiskController@index: DB value', ['id' => $rawRisk->id, 'linkable_type' => $rawRisk->linkable_type]);
            }
            $risks = Risk::with(['owner', 'linkable'])->get();
            \Log::info('RiskController@index: risks fetched', ['count' => $risks->count()]);
            $risks = $risks->map(function ($risk) {
                $label = null;
                try {
                    \Log::info('RiskController@index: mapping risk', [
                        'risk_id' => $risk->id,
                        'linkable_type' => $risk->linkable_type,
                        'linkable_id' => $risk->linkable_id,
                        'linkable' => $risk->linkable
                    ]);
                    if ($risk->linkable) {
                        if ($risk->linkable_type === 'App\\Models\\Okr' || $risk->linkable_type === 'App\\\\Models\\\\Okr') {
                            $label = $risk->linkable->objective ?? "OKR #{$risk->linkable_id}";
                        } elseif ($risk->linkable_type === 'App\\Models\\Task' || $risk->linkable_type === 'App\\\\Models\\\\Task') {
                            $label = $risk->linkable->title_id ?? $risk->linkable->title ?? "Task #{$risk->linkable_id}";
                        } elseif ($risk->linkable_type === 'App\\Models\\Sprint' || $risk->linkable_type === 'App\\\\Models\\\\Sprint') {
                            $label = $risk->linkable->name ?? "Sprint #{$risk->linkable_id}";
                        }
                    }
                    \Log::info('RiskController@index: linked_entity_label', [
                        'risk_id' => $risk->id,
                        'label' => $label
                    ]);
                } catch (\Throwable $e) {
                    \Log::error('RiskController@index: error in map', ['risk_id' => $risk->id, 'error' => $e->getMessage()]);
                    $label = null; // If any error, fallback to null
                }
                return array_merge($risk->toArray(), [
                    'linked_entity_label' => $label,
                ]);
            });
            \Log::info('RiskController@index: returning risks', ['count' => $risks->count()]);
            return response()->json($risks);
        } catch (\Throwable $e) {
            \Log::error('RiskController@index error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
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
        $validated = $request->validate([
            'description' => 'required|string',
            'type' => 'required|string',
            'owner_id' => 'required|integer|exists:users,id',
            'probability' => 'required|string',
            'impact' => 'required|string',
            'status' => 'required|string',
            'mitigation' => 'nullable|string',
            'linkable_type' => 'required|string',
            'linkable_id' => 'required|integer',
        ]);
        $risk = Risk::create($validated);
        return response()->json($risk, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Risk  $risk
     * @return \Illuminate\Http\Response
     */
    public function show(Risk $risk)
    {
        return response()->json($risk);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Risk  $risk
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Risk $risk)
    {
        \Log::info('RiskController@update: called', ['risk_id' => $risk->id, 'payload' => $request->all()]);
        try {
            $validated = $request->validate([
                'description' => 'sometimes|required|string',
                'type' => 'sometimes|required|string',
                'owner_id' => 'sometimes|required|integer|exists:users,id',
                'probability' => 'sometimes|required|string',
                'impact' => 'sometimes|required|string',
                'status' => 'sometimes|required|string',
                'mitigation' => 'nullable|string',
                'linkable_type' => 'sometimes|required|string',
                'linkable_id' => 'sometimes|required|integer',
            ]);
            $risk->update($validated);
            return response()->json($risk->fresh());
        } catch (\Throwable $e) {
            \Log::error('RiskController@update error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Risk  $risk
     * @return \Illuminate\Http\Response
     */
    public function destroy(Risk $risk)
    {
        //
    }
}
