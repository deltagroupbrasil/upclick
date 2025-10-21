import http from 'node:http';
import { URL } from 'node:url';

const PORT = process.env.PORT || 4000;
const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN || '';
const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID || '';
const CLICKUP_API_URL = 'https://api.clickup.com/api/v2';

function jsonResponse(res, statusCode, data, headers = {}) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    ...headers,
  });
  res.end(payload);
}

function toHours(milliseconds) {
  if (typeof milliseconds !== 'number' || Number.isNaN(milliseconds)) {
    return null;
  }
  return milliseconds / 3600000;
}

function normalizePoints(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function computeSummary(tasks) {
  const developerMap = new Map();
  let totalEstimateHours = 0;
  let totalTrackedHours = 0;
  let totalPoints = 0;

  for (const task of tasks) {
    const estimate = typeof task.timeEstimateHours === 'number' ? task.timeEstimateHours : 0;
    const tracked = typeof task.timeSpentHours === 'number' ? task.timeSpentHours : 0;
    const points = normalizePoints(task.points);

    totalEstimateHours += estimate;
    totalTrackedHours += tracked;
    if (typeof points === 'number') {
      totalPoints += points;
    }

    if (Array.isArray(task.assignees)) {
      for (const assignee of task.assignees) {
        if (!assignee || !assignee.id) {
          continue;
        }

        if (!developerMap.has(assignee.id)) {
          developerMap.set(assignee.id, {
            id: assignee.id,
            username: assignee.username || null,
            email: assignee.email || null,
            color: assignee.color || null,
            taskCount: 0,
            totalEstimateHours: 0,
            totalTrackedHours: 0,
            totalPoints: 0,
          });
        }

        const developer = developerMap.get(assignee.id);
        developer.taskCount += 1;
        developer.totalEstimateHours += estimate;
        developer.totalTrackedHours += tracked;
        if (typeof points === 'number') {
          developer.totalPoints += points;
        }
      }
    }
  }

  return {
    totalTasks: tasks.length,
    totalEstimateHours,
    totalTrackedHours,
    totalPoints,
    developers: Array.from(developerMap.values()).sort((a, b) => a.totalPoints - b.totalPoints || a.taskCount - b.taskCount),
    generatedAt: new Date().toISOString(),
  };
}

async function fetchClickUpTasks() {
  if (!CLICKUP_API_TOKEN) {
    return { error: 'Missing CLICKUP_API_TOKEN environment variable.' };
  }

  if (!CLICKUP_LIST_ID) {
    return { error: 'Missing CLICKUP_LIST_ID environment variable.' };
  }

  const endpoint = `${CLICKUP_API_URL}/list/${CLICKUP_LIST_ID}/task`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: CLICKUP_API_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    return { error: `ClickUp API request failed with ${response.status}: ${message}` };
  }

  const data = await response.json();
  if (!Array.isArray(data.tasks)) {
    return { tasks: [] };
  }

  const tasks = data.tasks.map((task) => {
    const assignees = Array.isArray(task.assignees)
      ? task.assignees.map((assignee) => ({
          id: assignee.id,
          username: assignee.username,
          email: assignee.email,
          color: assignee.color,
        }))
      : [];

    const timeEstimateHours = toHours(
      typeof task.time_estimate === 'number' ? task.time_estimate : Number(task.time_estimate)
    );
    const timeSpentHours = toHours(
      typeof task.time_spent === 'number' ? task.time_spent : Number(task.time_spent)
    );
    const pointsField = (task.custom_fields || []).find(
      (field) => typeof field.name === 'string' && field.name.trim().toLowerCase() === 'points'
    );
    const points = normalizePoints(pointsField?.value);

    return {
      id: task.id,
      name: task.name,
      status: task.status?.status ?? null,
      statusColor: task.status?.color ?? null,
      assignees,
      timeEstimateHours,
      timeSpentHours,
      points,
      dueDate: task.due_date ? Number(task.due_date) : null,
      url: task.url ?? null,
    };
  });

  return { tasks, summary: computeSummary(tasks) };
}

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = data ? JSON.parse(data) : {};
        resolve(parsed);
      } catch (error) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    jsonResponse(res, 400, { error: 'Invalid request' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    });
    res.end();
    return;
  }

  if (url.pathname === '/api/tasks' && req.method === 'GET') {
    try {
      const result = await fetchClickUpTasks();
      jsonResponse(res, result.error ? 500 : 200, result);
    } catch (error) {
      jsonResponse(res, 500, {
        error: 'Unexpected error fetching tasks from ClickUp.',
        details: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (url.pathname === '/api/webhook' && req.method === 'POST') {
    const payload = await parseRequestBody(req);
    console.log('Received ClickUp webhook event:', JSON.stringify(payload, null, 2));
    jsonResponse(res, 200, { received: true });
    return;
  }

  jsonResponse(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
