# UpClick Prototype

This repository provides a minimal foundation for a ClickUp-integrated task management interface. It includes:

- A Node.js backend that retrieves tasks from the ClickUp API and exposes them via REST endpoints with aggregate summaries.
- A lightweight React frontend (served as a static file) that displays task information, developer load, and keeps it up to date.
- A webhook endpoint ready to receive live updates from ClickUp.

## Getting Started

### 1. Prerequisites

- Node.js 18 or newer (for native `fetch` support and the `--watch` flag).
- A ClickUp API token with access to the space/list you want to display.

### 2. Environment Variables

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

Then edit `.env`:

```
PORT=4000
CLICKUP_API_TOKEN=your_clickup_token
CLICKUP_LIST_ID=target_list_id
```

### 3. Run the backend

```bash
cd backend
npm run dev
```

The backend exposes two endpoints:

- `GET /api/tasks` – fetch the latest tasks from the configured ClickUp list.
- `POST /api/webhook` – accepts ClickUp webhook payloads and logs them for now.

### 4. Open the frontend

The frontend is a static file located at `frontend/index.html`. You can open it directly in your browser or serve it through any static file server. If the backend runs on a different origin, set `window.__ENV__ = { API_BASE_URL: 'http://localhost:4000' };` before the script loads, or host the file alongside the backend.

When connected, the dashboard displays:

- A KPI row with total task count, estimated/actual hours, and point totals.
- The task table with status, assignees, estimates, tracked time, and points.
- A developer load table that aggregates hours and points per assignee to help assign work to the lowest-point teammate.

### 5. Configure ClickUp Webhooks

Once the backend is reachable from the internet, register a webhook with ClickUp to deliver live updates:

```http
POST https://api.clickup.com/api/v2/webhook
Authorization: <CLICKUP_API_TOKEN>
Content-Type: application/json

{
  "endpoint": "https://your-domain.com/api/webhook",
  "events": [
    "taskCreated",
    "taskUpdated",
    "taskAssigneeUpdated",
    "taskStatusUpdated",
    "taskTimeEstimateUpdated"
  ],
  "space_id": "<YOUR_SPACE_ID>"
}
```

The current implementation logs the payloads; extend it to persist updates to your database as you evolve the system.

## Next Steps

- Persist task snapshots and developer point totals in a database (e.g., PostgreSQL).
- Build assignment automation that selects the developer with the lowest points.
- Harden the webhook endpoint with signature validation and retry handling.
- Package the frontend with a build pipeline (Vite, Next.js, etc.) for production.

## License

MIT
