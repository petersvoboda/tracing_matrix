# Resource Planning & Task Assignment Tool - Project Plan

This document outlines the plan for developing the Resource Planning and Task Assignment web application.

**Phase 1: Planning & Design**

1.  **Finalize Technology Stack:**
    *   **Frontend:** React, Ant Design (UI Components), Zustand (State Management), React Router (Routing), Axios (HTTP Client).
    *   **Backend:** PHP/Laravel Framework.
    *   **Database:** MySQL.
    *   **Deployment Target:** Shared hosting environment (Apache/Nginx + PHP + MySQL).

2.  **Database Schema Design (MySQL):**
    *   Define tables for `users`, `resources`, `skills`, `domains`, `resource_skills`, `resource_domains`, `tasks`, `task_dependencies`, `task_skills`, `task_domains`, `sprints`, `assignments`.
    *   Establish relationships (one-to-many, many-to-many).
    *   Define data types, constraints, and indexes.

    ```mermaid
    erDiagram
        USERS ||--o{ TASKS : "creates"
        USERS ||--o{ RESOURCES : "manages"
        USERS ||--o{ SPRINTS : "manages"

        RESOURCES {
            INT id PK
            VARCHAR name_identifier UK
            ENUM type ('Human', 'AI Tool', 'Human + AI Tool')
            DECIMAL cost_rate
            JSON availability_params  // Store FTE, hours, timezone, leave
            JSON productivity_multipliers // { "skill_id": 1.2, "task_type_general": 0.9 }
            VARCHAR ramp_up_time // e.g., "8 hours", "2 days"
            -- AI Specific
            VARCHAR implementation_effort NULL
            TEXT learning_curve NULL
            VARCHAR maintenance_overhead NULL
            TEXT integration_compatibility NULL
            -- Human Specific
            ENUM skill_level ('Junior', 'Mid-Level', 'Senior', 'Principal') NULL
            TINYINT collaboration_factor NULL // 1-5
            TIMESTAMP created_at
            TIMESTAMP updated_at
        }

        SKILLS {
            INT id PK
            VARCHAR name UK
            TIMESTAMP created_at
            TIMESTAMP updated_at
        }

        DOMAINS {
            INT id PK
            VARCHAR name UK
            TIMESTAMP created_at
            TIMESTAMP updated_at
        }

        RESOURCE_SKILLS {
            INT resource_id FK
            INT skill_id FK
            TINYINT proficiency_level // 1-5 or similar scale
            PRIMARY KEY (resource_id, skill_id)
        }

        RESOURCE_DOMAINS {
            INT resource_id FK
            INT domain_id FK
            TINYINT proficiency_level // 1-5 or similar scale
            PRIMARY KEY (resource_id, domain_id)
        }

        TASKS {
            INT id PK
            VARCHAR title_id UK
            TEXT description
            ENUM status ('To Do', 'In Progress', 'Blocked', 'In Review', 'Done')
            ENUM priority ('Low', 'Medium', 'High', 'Critical')
            DECIMAL estimated_effort // hours or points
            INT sprint_id FK NULL
            DATE deadline NULL
            INT created_by_user_id FK
            TIMESTAMP created_at
            TIMESTAMP updated_at
        }

        TASK_DEPENDENCIES {
            INT task_id FK
            INT depends_on_task_id FK
            PRIMARY KEY (task_id, depends_on_task_id)
        }

        TASK_SKILLS {
            INT task_id FK
            INT skill_id FK
            PRIMARY KEY (task_id, skill_id)
        }

        TASK_DOMAINS {
            INT task_id FK
            INT domain_id FK
            PRIMARY KEY (task_id, domain_id)
        }

        SPRINTS {
            INT id PK
            VARCHAR name
            DATE start_date
            DATE end_date
            INT created_by_user_id FK
            TIMESTAMP created_at
            TIMESTAMP updated_at
        }

        ASSIGNMENTS {
            INT id PK
            INT task_id FK UK // Usually one primary assignment per task, but could relax if needed
            INT resource_id FK
            TIMESTAMP assigned_at
            TIMESTAMP created_at
            TIMESTAMP updated_at
        }

        RESOURCES ||--|{ RESOURCE_SKILLS : "has"
        SKILLS ||--|{ RESOURCE_SKILLS : "defines proficiency for"
        RESOURCES ||--|{ RESOURCE_DOMAINS : "has"
        DOMAINS ||--|{ RESOURCE_DOMAINS : "defines proficiency for"
        TASKS ||--|{ TASK_SKILLS : "requires"
        SKILLS ||--|{ TASK_SKILLS : "required by"
        TASKS ||--|{ TASK_DOMAINS : "requires"
        DOMAINS ||--|{ TASK_DOMAINS : "required by"
        TASKS ||--o{ TASK_DEPENDENCIES : "depends on"
        TASKS }o--|| TASK_DEPENDENCIES : "is prerequisite for"
        SPRINTS ||--o{ TASKS : "contains"
        TASKS ||--|{ ASSIGNMENTS : "is assigned via"
        RESOURCES ||--o{ ASSIGNMENTS : "assigned to"

    ```

3.  **API Design (Laravel - RESTful):**
    *   **Authentication:** Laravel Sanctum or Passport for API token-based auth. `/login`, `/register`, `/logout`, `/user`.
    *   **Resources:** `/api/resources` (GET, POST), `/api/resources/{id}` (GET, PUT, DELETE). Include endpoints for managing skills/domains associated with resources.
    *   **Skills:** `/api/skills` (GET, POST), `/api/skills/{id}` (GET, PUT, DELETE).
    *   **Domains:** `/api/domains` (GET, POST), `/api/domains/{id}` (GET, PUT, DELETE).
    *   **Tasks:** `/api/tasks` (GET, POST), `/api/tasks/{id}` (GET, PUT, DELETE). Include endpoints for managing dependencies, required skills/domains.
    *   **Sprints:** `/api/sprints` (GET, POST), `/api/sprints/{id}` (GET, PUT, DELETE).
    *   **Assignments:** `/api/assignments` (POST - assign task), `/api/assignments/{taskId}` (DELETE - unassign task).
    *   **Assignment Suggestions:** `/api/tasks/{taskId}/suggestions` (GET - calculates and returns potential resources with fit scores and load impact).
    *   **Resource Load:** `/api/resources/{id}/load?sprintId={sprintId}` (GET - calculates current load for a resource in a sprint).

4.  **Frontend Architecture (React):**
    *   **Directory Structure:** `src/components` (reusable UI), `src/features` (feature-specific components like ResourceHub, TaskBacklog, AssignmentWorkbench), `src/hooks` (custom hooks), `src/lib` (API client, utils), `src/pages` (top-level page components), `src/store` (Zustand store setup), `src/routes` (routing config).
    *   **Core Components:** Layout (Sidebar Navigation, Header), ResourceForm, ResourceTable, TaskForm, TaskBoard/List, AssignmentPanel, SuggestionList, LoadVisualizer.
    *   **State Management (Zustand):** Create stores (`resourceStore`, `taskStore`, `assignmentStore`, `uiStore`) to manage application state, API data, loading states, and errors.
    *   **Routing (React Router):** Define routes for `/login`, `/resources`, `/tasks`, `/assignments`, `/sprints`. Implement protected routes requiring authentication.

**Phase 2: Backend Development (Laravel)**

1.  **Setup:** Initialize Laravel project, configure `.env` for database (MySQL) and app settings. Install necessary packages (e.g., Sanctum/Passport).
2.  **Migrations & Models:** Create database migrations based on the schema. Create Eloquent models for each table with relationships defined.
3.  **Seeders:** Create database seeders for initial data (e.g., default skills, domains, potentially a test user).
4.  **Authentication:** Implement user registration, login, logout logic, and API authentication middleware.
5.  **API Controllers & Routes:** Implement controllers for each resource (Resources, Tasks, Skills, etc.) handling CRUD operations and business logic. Define API routes in `routes/api.php`. Implement request validation.
6.  **Assignment Engine Logic (Backend):**
    *   Develop the logic within a service class or directly in the relevant controller method (`/api/tasks/{taskId}/suggestions`).
    *   **Fit Score Calculation (Simple Weighted Sum):**
        *   Fetch task requirements (skills, domains).
        *   Fetch available resources (considering basic availability if possible, or filter later).
        *   For each resource:
            *   Calculate Skill Match Score: Sum points for matching skills (weighted by proficiency).
            *   Calculate Domain Match Score: Sum points for matching domains (weighted by proficiency).
            *   Apply Productivity Multiplier: Adjust score based on multipliers relevant to task skills (if defined).
            *   Factor in AI Tool aspects (if applicable and simple rules defined, e.g., small penalty for learning curve initially).
            *   Combine scores using defined weights: `FitScore = (w1 * SkillScore) + (w2 * DomainScore) + (w3 * MultiplierFactor) + ...`
    *   **Load Calculation:** For suggested resources, calculate their current assigned effort within the relevant sprint/timeframe and add the estimated effort of the task being considered. Compare against availability.
    *   Return top N suggestions with Fit Score, breakdown (optional), and projected load.

**Phase 3: Frontend Development (React)**

1.  **Setup:** Initialize React project (e.g., using Vite or Create React App), install dependencies (Ant Design, Zustand, React Router, Axios). Set up basic project structure.
2.  **UI Components & Layout:** Implement the main application layout using Ant Design components (Layout, Menu, Header). Create reusable components identified in the design phase.
3.  **Routing:** Configure React Router for navigation between pages. Implement protected routes.
4.  **State Management:** Set up Zustand stores and actions for fetching/managing data for resources, tasks, etc.
5.  **Screen 1: Resource Hub:**
    *   Implement Resource Table (Ant Design Table) displaying resources.
    *   Implement Resource Form (Ant Design Form, Modal) for creating/editing resources with all specified fields and validation.
    *   Connect to backend API endpoints for CRUD operations.
6.  **Screen 2: Task Backlog:**
    *   Implement Task List/Board view (Ant Design Table/Cards). Add filtering (status, priority, sprint) and sorting.
    *   Implement Task Form (Ant Design Form, Modal/Drawer) for creating/editing tasks, including fields for dependencies, skills, domains.
    *   Connect to backend API endpoints.
7.  **Screen 3: Assignment Workbench:**
    *   Layout displaying unassigned tasks and available resources.
    *   Implement task selection and display of suggestions fetched from `/api/tasks/{taskId}/suggestions`.
    *   Show Fit Score, load impact, and allow accepting suggestions or manual assignment (e.g., Select dropdown).
    *   Implement Resource Load Visualization (e.g., Ant Design Progress bars or simple chart).
    *   Connect to assignment and suggestion endpoints.
8.  **Authentication:** Implement Login page and integrate with backend authentication API. Manage auth state globally (Zustand store).
9.  **API Integration:** Create an Axios instance or utility functions for making API calls. Handle loading states and errors gracefully.
10. **Styling & Responsiveness:** Refine UI using Ant Design's styling capabilities and ensure basic responsiveness.

**Phase 4: Integration, Testing & Deployment**

1.  **Integration Testing:** Test frontend-backend interactions thoroughly.
2.  **Refinement:** Address bugs, improve UI/UX based on testing.
3.  **Deployment Documentation:**
    *   **Backend (Laravel):**
        *   Instructions for cloning the repository on the server.
        *   Running `composer install --optimize-autoloader --no-dev`.
        *   Configuring the `.env` file (Database credentials, App URL, Keys).
        *   Running database migrations (`php artisan migrate --seed`).
        *   Setting up file permissions.
        *   Web Server Configuration (Apache/Nginx): Pointing domain/subdomain to Laravel's `public` directory, ensuring URL rewriting is enabled (e.g., `.htaccess` for Apache, `try_files` for Nginx). Configure as reverse proxy if needed, though less common for direct PHP hosting.
    *   **Frontend (React):**
        *   Running `npm run build` to create static production assets (`build` or `dist` folder).
        *   Uploading the contents of the build folder to the appropriate web server directory (e.g., a subdomain or subfolder).
        *   Ensuring the web server correctly serves the `index.html` for client-side routing (configure rewrite rules if necessary).
    *   **Environment Variables:** Secure handling of sensitive data (API keys, DB passwords).
4.  **Deployment:** Deploy to the shared hosting environment following the documented steps.
5.  **Final Testing:** Perform testing on the live environment.

---

## Prioritized Task Roadmap (Next Steps)

### 1. Critical UX/UI Enhancements
- [ ] Add filtering and sorting controls to TaskBacklog (by status, sprint, priority, assignee).
- [ ] Add filters to Status and Priority columns in TaskList.
- [ ] Add columns for assigned resource, sprint, deadline, skills, and domains in TaskList.
- [ ] Add row selection and expandable rows for details in TaskList.
- [ ] Add fields for resource availability (FTE, working hours, timezone, leave) and productivity multipliers in ResourceForm.

### 2. Assignment Logic & Analytics
- [ ] Refine backend fit score algorithm (resource availability, productivity multipliers, AI tool factors, dependencies, overload penalty).
- [ ] Fetch resource load for all suggested resources when fetching suggestions.
- [ ] Re-fetch resource load after assignment/unassignment.
- [ ] Add analytics endpoints (resource utilization, assignment history, task completion rates).
- [ ] Visualize analytics in the frontend (charts, dashboards).

### 3. User Management & Authorization
- [ ] Implement user roles (Project Manager, Team Member, Viewer) and authorization in backend.
- [ ] Add user management UI and role-based access control in frontend.
- [ ] Add frontend registration action/UI if needed.
- [ ] Display current user info and role in the UI.

### 4. Sprint Management
- [ ] Implement CRUD actions for sprints in sprintStore.js and add Sprint management UI if needed.

---

This roadmap should be reviewed and updated as features are completed or priorities change.