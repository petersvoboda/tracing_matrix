# Resource Planner – Fullstack Project

## Overview

Resource Planner is a fullstack web application for project resource planning, task assignment, sprint management, and advanced analytics. It supports both human and AI resources, Kanban-style sprint assignment, and role-based user management.

---

## Data and Communication Flow

```
+-------------------+         HTTP/REST         +-------------------+         SQL/ORM         +-------------------+
|    React Frontend | <----------------------> |   Laravel Backend | <--------------------> |     MySQL DB      |
+-------------------+                         +-------------------+                         +-------------------+
        |                                               |                                         |
        | 1. User logs in, manages resources/tasks      |                                         |
        |---------------------------------------------> |                                         |
        | 2. Backend authenticates, checks roles        |                                         |
        | <-------------------------------------------- |                                         |
        | 3. User interacts with Kanban, analytics      |                                         |
        |---------------------------------------------> |                                         |
        | 4. Backend fetches/updates data, returns JSON |                                         |
        | <-------------------------------------------- |                                         |
        |                                               | 5. Eloquent ORM reads/writes tables      |
        |                                               | <--------------------------------------> |
```

---

## Data Model (ERD, ASCII Art)

```
+---------+      +-------------------+      +---------+
|  users  |<---->|   assignments     |<---->| tasks   |
+---------+      +-------------------+      +---------+
    |                |   resource_id  |          |
    |                |   task_id      |          |
    |                +----------------+          |
    |                                            |
    |                                            v
    |                                      +-----------+
    |                                      | sprints   |
    |                                      +-----------+
    |                                            ^
    |                                            |
    |                +-------------------+       |
    |                |   resources       |-------+
    |                +-------------------+
    |                | skills (pivot)    |<----+
    |                | domains (pivot)   |<--+ |
    +----------------+-------------------+   | |
                                             | |
+---------+      +---------+      +---------+| |
| skills  |<-----|resource_|----->| domains || |
+---------+      |skills   |      +---------+| |
                 +---------+                | |
                                            | |
+---------+      +---------+      +---------+| |
| tasks   |<-----|task_    |----->| domains || |
|         |      |skills   |      +---------+| |
|         |      +---------+                | |
|         |                                 | |
|         |      +---------+      +---------+| |
|         +----->|task_    |----->| skills  |+--+
|                |domains  |      +---------+
|                +---------+
```

---

## API Structure (ASCII Endpoint Map)

```
/api/
  |-- login, register, logout
  |-- users/ (CRUD, role assignment)
  |-- resources/ (CRUD)
  |-- skills/, domains/ (list)
  |-- tasks/ (CRUD, dependencies, required skills/domains)
  |-- sprints/ (CRUD)
  |-- assignments/ (assign/unassign resources to tasks)
  |-- analytics/
        |-- resource-utilization
        |-- assignment-history
        |-- completion-rates
        |-- task-blockers
        |-- ai-tool-impact
        |-- burnup-burndown
        |-- resource-availability-heatmap
```

---

## Features

- **Resource Management:** Add/edit/delete resources (Human, AI Tool, Human+AI Tool), availability, skills, domains, productivity multipliers, working hours, planned leave.
- **Task Backlog:** Full CRUD for tasks, required skills/domains, dependencies, priorities, assignment to sprints/resources.
- **Sprint Management:** Kanban board for current/future sprints, collapsible past sprints, drag-and-drop task assignment, backlog always last.
- **Assignment Workbench:** Intelligent suggestions, resource load visualization, dependency awareness.
- **User Management:** Add/edit/delete users, assign roles (Project Manager, Team Member), role-based access control.
- **Analytics Dashboard:** Resource utilization, assignment history, completion rates, blockers, AI tool impact, burnup/burndown, resource availability heatmap.
- **Role-based Authorization:** Only Project Managers can manage users, sprints, and resources.
- **Modern UI:** Ant Design, responsive layout, drag-and-drop, tooltips, modals, and more.

---

## Tech Stack

- **Frontend:** React, Ant Design, Zustand, @hello-pangea/dnd, Axios
- **Backend:** Laravel (PHP), Sanctum (API auth), Fruitcake CORS
- **Database:** MySQL (or compatible)
- **Deployment:** Works with XAMPP/Apache, supports CORS, .env configuration

---

## Setup Instructions

### Backend

1. **Install dependencies:**
   ```
   composer install
   ```

2. **Configure .env:**
   - Set your database credentials.
   - Set `APP_URL` to your backend URL (e.g., `http://localhost:8000`).

3. **Migrate and seed database:**
   ```
   php artisan migrate
   php artisan db:seed
   ```

4. **CORS:**
   - Ensure `config/cors.php` allows your frontend origin and credentials.
   - Add CORS headers and OPTIONS handler to your public/.htaccess if using Apache.

5. **Start backend:**
   ```
   php artisan serve
   ```

### Frontend

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Configure API URL:**
   - If needed, set `VITE_API_BASE_URL` in `.env` (default: `http://localhost:8000/api`).

3. **Start frontend:**
   ```
   npm run dev
   ```

---

## Usage

- **Login:** Use a user with role `manager` for full access.
- **User Management:** Only Project Managers can add/edit/delete users and assign roles.
- **Resource/Task/Sprint Management:** Full CRUD, Kanban board for sprints, drag-and-drop task assignment.
- **Analytics:** Access the Analytics tab for live dashboards and advanced charts.
- **Role-based UI:** Features are shown/hidden based on user role.

---

## Deployment Notes

- For production, restrict CORS origins in `config/cors.php` and `.htaccess`.
- Use HTTPS and secure cookies for authentication.
- Set up environment variables and database credentials in `.env`.

---

## Credits

- Built with Laravel, React, Ant Design, Zustand, and more.
- Drag-and-drop powered by @hello-pangea/dnd.

---

## License

MIT License
