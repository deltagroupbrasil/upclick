# ClickUp Task Manager

A management interface for tracking dev team tasks, hours, and points integrated with ClickUp.

## Features

### Core Features
- Real-time task synchronization with ClickUp
- Task assignment based on lowest point allocation
- Weekly hour/point tallying for payroll
- Live updates via webhooks
- Team member workload visualization

### Enhanced Features
- **CSV Export** - Export tasks and tallies for external processing
- **Advanced Filtering** - Search and filter tasks by status, assignee, points
- **Flexible Sorting** - Sort by name, points, status, due date, or last updated
- **Payout Calculator** - Calculate payouts per point or per hour
- **Task Details** - Click any task to view full information in modal
- **Real-time Stats** - Live counts of total, filtered, and active tasks

## Project Structure

```
clickup-task-manager/
├── backend/          # Node.js/Express API
├── frontend/         # Next.js React application
├── .env.example      # Environment variables template
└── package.json      # Root package for monorepo
```

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your ClickUp API token
   - Update team and space IDs

3. **Setup database:**
   ```bash
   cd backend
   npm run db:migrate
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

## Getting Your ClickUp API Token

1. Go to ClickUp Settings > Apps
2. Click "Generate" under API Token
3. Copy the token to your `.env` file

## Configuration

### ClickUp Setup
- Team ID: Found in your ClickUp URL
- Space ID: Found in your ClickUp board URL
- Webhook Secret: Generate a random string for security

### Database
The application uses PostgreSQL. Update `DATABASE_URL` in `.env` with your connection string.

## Development

- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only backend server
- `npm run dev:frontend` - Start only frontend application
- `npm run build` - Build both applications for production

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, PostgreSQL
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **API Integration:** ClickUp API v2
- **Real-time:** WebSockets, ClickUp Webhooks

## Documentation

- **QUICK_START.md** - Get running in 3 minutes
- **SETUP.md** - Detailed setup guide
- **PROJECT_SUMMARY.md** - Technical architecture
- **ENHANCEMENTS.md** - All optional features explained
- **FINAL_SUMMARY.md** - Complete project overview

## Quick Commands

```bash
# Install dependencies
npm install

# Start everything
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build for production
npm run build
```

## Usage

1. Open http://localhost:3000
2. Click "Sync from ClickUp" to load your tasks
3. Use filters and search to find specific tasks
4. Click on any task to see full details
5. Navigate to /tallies for weekly payroll calculations
6. Configure payout rates and export to CSV

## License

MIT
