# Analytics Dashboard Optimization Plan

## Key Findings

- **Frontend:** The dashboard fetches 7 analytics endpoints in parallel and waits for all to finish before rendering. The slowest endpoint (often Burnup/Burndown and Resource Utilization) determines the total load time.
- **Backend:** Endpoints perform full-table scans and aggregations over thousands of tasks and hundreds of resources, with no caching or batching. This is likely the main bottleneck.
- **User Feedback:** The whole dashboard is slow, especially Burnup/Burndown and Resource Utilization. Partial loading (showing widgets as data arrives) and short-term caching (1–5 minutes) are both acceptable.

---

## Optimization Plan

### 1. Frontend: Incremental Widget Loading

- **Current:** All widgets wait for all data to load.
- **Proposed:** Fetch each widget’s data independently and render as soon as it arrives.
  - Show loading spinners per widget.
  - This improves perceived performance and user experience.

### 2. Backend: Add Caching to Expensive Endpoints

- **Target:** Burnup/Burndown and Resource Utilization endpoints.
- **Approach:** Use Laravel’s cache (e.g., `Cache::remember`) to cache results for 1–5 minutes.
- **Effect:** Reduces repeated heavy queries, especially for dashboards viewed frequently.

### 3. Backend: Query Optimization

- **Resource Utilization:**
  - Avoid N+1 queries by eager loading only necessary fields.
  - Consider aggregating data in SQL rather than PHP.
- **Burnup/Burndown:**
  - Pre-aggregate data if possible, or use more efficient queries.
  - Consider background jobs to precompute analytics if real-time is not required.

### 4. Optional: API Response Compression

- Enable gzip or brotli compression on API responses to reduce payload size, especially if analytics data is large.

### 5. Monitoring and Profiling

- Add logging or use Laravel Telescope to profile slow queries and endpoints.
- Use browser dev tools to monitor frontend API timing.

---

## Proposed Architecture (Mermaid Diagram)

```mermaid
flowchart TD
    subgraph Frontend (React)
        A[AnalyticsDashboard.jsx]
        A1[Widget: Resource Utilization]
        A2[Widget: Burnup/Burndown]
        A3[Other Widgets...]
    end
    subgraph Backend (Laravel)
        B1[/analytics/resource-utilization]
        B2[/analytics/burnup-burndown]
        B3[Other Endpoints...]
        C[Cache Layer (1-5 min)]
        D[Database]
    end

    A -- fetch --> B1
    A -- fetch --> B2
    A -- fetch --> B3
    B1 -- check cache --> C
    B2 -- check cache --> C
    B3 -- check cache --> C
    C -- miss --> B1
    C -- miss --> B2
    C -- miss --> B3
    B1 -- query --> D
    B2 -- query --> D
    B3 -- query --> D
    C -- hit --> A1
    C -- hit --> A2
    C -- hit --> A3
    B1 -- response --> A1
    B2 -- response --> A2
    B3 -- response --> A3
```

---

## Implementation Steps

1. **Frontend**
   - Refactor AnalyticsDashboard.jsx to fetch each widget’s data independently.
   - Show loading indicators per widget.
   - Render widgets as soon as their data is available.

2. **Backend**
   - Add caching (e.g., `Cache::remember`) to the resource utilization and burnup/burndown endpoints.
   - Refactor queries for efficiency (eager loading, SQL aggregation).
   - Optionally, enable API response compression.

3. **Testing**
   - Profile before/after load times.
   - Ensure no loss of functionality or data accuracy.

---

## User Acceptance

- Partial loading and short-term caching are both acceptable.
- Focus on Burnup/Burndown and Resource Utilization as the slowest widgets.