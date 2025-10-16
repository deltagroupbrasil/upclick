# Quick Start - 3 Minutes to Running

## 1. Install Everything (1 minute)

```bash
# From the project root
npm install
```

## 2. Setup Database (30 seconds)

### If you have PostgreSQL installed:

```bash
psql -U postgres
CREATE DATABASE clickup_tasks;
\q
```

### If you DON'T have PostgreSQL:

**Windows:**
Download and install: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

**Mac (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
createdb clickup_tasks
```

**Using Docker (any OS):**
```bash
docker run --name clickup-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=clickup_tasks -p 5432:5432 -d postgres:14
```

## 3. Start the App (1 minute)

```bash
npm run dev
```

Wait for both servers to start, then open: **http://localhost:3000**

## 4. Sync Your Tasks

1. Click the **"Sync from ClickUp"** button
2. Wait for tasks to load
3. Done!

## What You'll See

✅ **Homepage** - All your tasks from ClickUp with status, points, and assignees
✅ **Developer Workload** - Who has the lowest points (suggested for next assignment)
✅ **Weekly Tallies** - Navigate to `/tallies` to see weekly point breakdown

## Troubleshooting

**"Database connection failed"**
- Make sure PostgreSQL is running
- Check the DATABASE_URL in `backend/.env`

**"No tasks showing"**
- Click "Sync from ClickUp" button
- Check your ClickUp API token is correct in `backend/.env`

**"Port already in use"**
- Close other apps using ports 3000 or 3001
- Or change the ports in `.env` files

That's it! You're ready to go.
