# ClickUp Task Manager - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** (comes with Node.js)

## Quick Start

### 1. Install Dependencies

From the root directory, run:

```bash
npm install
```

This will install dependencies for both the backend and frontend.

### 2. Setup PostgreSQL Database

#### Option A: Using PostgreSQL locally

1. Open PostgreSQL command line or pgAdmin
2. Create a new database:
   ```sql
   CREATE DATABASE clickup_tasks;
   ```

#### Option B: Using Docker (Optional)

```bash
docker run --name clickup-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=clickup_tasks \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Configure Environment Variables

Your ClickUp API credentials are already configured in `backend/.env`:

```env
CLICKUP_API_TOKEN=A8TXT70WRO9T0UE4R7Q1BMHDYT36VK5X
CLICKUP_TEAM_ID=9013086675
CLICKUP_SPACE_ID=901311123180
CLICKUP_WEBHOOK_SECRET=J1ETQVOE1G8JNDFC8ALXOIUSAL8XTG4PGELN88WQ92REPIAW104GZPRLVWIKFFU8
```

If using a different database configuration, update:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/clickup_tasks
```

### 4. Start the Application

#### Development Mode (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both the backend (port 3001) and frontend (port 3000) concurrently.

#### Start Backend and Frontend Separately

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend (in another terminal):**
```bash
cd frontend
npm run dev
```

### 5. Initial Setup

1. **Open the application**: Navigate to [http://localhost:3000](http://localhost:3000)

2. **Sync tasks from ClickUp**: Click the "Sync from ClickUp" button on the homepage

3. **View your tasks**: Tasks will be displayed with assignees, points, and status

4. **Check weekly tallies**: Navigate to the "Weekly Tallies" page to see point distribution

## Features

### Task Management
- ✅ Sync tasks from ClickUp
- ✅ View all tasks with status, points, and time tracking
- ✅ See task assignees
- ✅ Real-time updates via webhooks (optional)

### Developer Workload
- ✅ View each developer's current week points
- ✅ See active task count per developer
- ✅ Get suggestions for assignment (lowest point developer)

### Weekly Tallies
- ✅ Calculate weekly points and hours per developer
- ✅ View percentage breakdown
- ✅ Export data for payroll (coming soon)

## API Endpoints

### Tasks
- `POST /api/tasks/sync` - Sync tasks from ClickUp
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task

### Developers
- `GET /api/developers` - Get all developers
- `GET /api/developers/workload` - Get workload info
- `GET /api/developers/suggest` - Get assignment suggestion
- `GET /api/developers/:id/tasks` - Get tasks for developer

### Weekly Tallies
- `GET /api/tallies/weekly` - Get current week tallies
- `GET /api/tallies/history` - Get historical tallies
- `POST /api/tallies/weekly` - Save a weekly tally

### Webhooks (Optional)
- `POST /api/webhooks/register` - Register webhook with ClickUp
- `GET /api/webhooks` - List registered webhooks
- `POST /api/webhooks/receive` - Receive webhook events

## Setting Up Webhooks (Optional)

For real-time updates when tasks change in ClickUp:

1. **Expose your local server** (use ngrok or similar):
   ```bash
   ngrok http 3001
   ```

2. **Register the webhook** via API or curl:
   ```bash
   curl -X POST http://localhost:3001/api/webhooks/register \
     -H "Content-Type: application/json" \
     -d '{"endpoint": "https://your-ngrok-url.ngrok.io/api/webhooks/receive"}'
   ```

3. Now when tasks are updated in ClickUp, they'll automatically sync to your app!

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `pg_ctl status`
- Check DATABASE_URL in `.env` is correct
- Verify database exists: `psql -l`

### ClickUp API Error
- Verify your API token is correct
- Check Team ID and Space ID match your ClickUp workspace
- Ensure you have proper permissions in ClickUp

### Tasks Not Syncing
- Click "Sync from ClickUp" button on the homepage
- Check browser console for errors
- Verify backend is running on port 3001

### Port Already in Use
- Backend: Change PORT in `backend/.env`
- Frontend: Use `PORT=3005 npm run dev` to run on different port

## Database Schema

The application automatically creates these tables:

- **tasks** - Cached ClickUp tasks
- **developers** - Team members from ClickUp
- **task_assignments** - Task-to-developer assignments
- **weekly_tallies** - Historical weekly point/hour tallies

## Next Steps

1. **Customize point calculation** - Modify the point assignment logic in `backend/src/controllers/developers.controller.ts`

2. **Add payout calculation** - Implement payout amounts in the weekly tally feature

3. **Export functionality** - Add CSV/Excel export for weekly tallies

4. **Authentication** - Add user login if deploying publicly

5. **Deploy** - Deploy to Vercel (frontend) and Railway/Heroku (backend)

## Support

For issues or questions, refer to:
- ClickUp API Docs: https://developer.clickup.com/
- Project README: `README.md`
