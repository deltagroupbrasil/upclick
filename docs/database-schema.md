# Database Schema Draft

This document outlines a starting relational model for storing ClickUp task metadata, developer points, and payout summaries.

## Tables

### `developers`
Stores the roster of engineers who can be assigned to tasks.

| Column        | Type        | Notes                                  |
| ------------- | ----------- | -------------------------------------- |
| `id`          | UUID (PK)   | Primary key.                           |
| `clickup_id`  | TEXT        | Optional ClickUp user ID for mapping.  |
| `full_name`   | TEXT        | Display name.                          |
| `email`       | TEXT        | Unique email address.                  |
| `hourly_rate` | NUMERIC     | Hourly payout rate (nullable).         |
| `created_at`  | TIMESTAMP   | Defaults to `now()`.                   |
| `updated_at`  | TIMESTAMP   | Updated via trigger.                   |

### `tasks`
Tracks tasks imported from ClickUp.

| Column              | Type        | Notes                                              |
| ------------------- | ----------- | -------------------------------------------------- |
| `id`                | UUID (PK)   | Internal identifier.                               |
| `clickup_task_id`   | TEXT        | Unique ID from ClickUp (indexed).                  |
| `name`              | TEXT        | Task title.                                        |
| `status`            | TEXT        | Current status label.                              |
| `status_color`      | TEXT        | Hex color for UI.                                  |
| `estimate_hours`    | NUMERIC     | ClickUp time estimate in hours.                    |
| `tracked_hours`     | NUMERIC     | Logged time in hours.                              |
| `points`            | NUMERIC     | Story points/custom field value.                   |
| `due_date`          | TIMESTAMP   | Nullable.                                          |
| `clickup_url`       | TEXT        | Direct link to task.                               |
| `assignee_id`       | UUID (FK)   | References `developers(id)`, nullable.            |
| `created_at`        | TIMESTAMP   | Defaults to `now()`.                               |
| `updated_at`        | TIMESTAMP   | Updated via trigger.                               |

### `task_history`
Captures immutable snapshots for analytics and auditing.

| Column            | Type        | Notes                                                            |
| ----------------- | ----------- | ---------------------------------------------------------------- |
| `id`              | UUID (PK)   | Primary key.                                                     |
| `task_id`         | UUID (FK)   | References `tasks(id)`.                                          |
| `status`          | TEXT        | Status at the time of the event.                                |
| `estimate_hours`  | NUMERIC     | Estimate at the time of the event.                              |
| `tracked_hours`   | NUMERIC     | Logged hours at the time of the event.                          |
| `points`          | NUMERIC     | Point value snapshot.                                           |
| `assignee_id`     | UUID (FK)   | Assigned developer at the time of the event.                    |
| `event_type`      | TEXT        | e.g., `status_change`, `estimate_change`, `webhook_sync`.       |
| `recorded_at`     | TIMESTAMP   | Timestamp of the recorded change (`now()` default).             |

### `weekly_summaries`
Aggregates hours and payouts per developer per week.

| Column            | Type        | Notes                                                      |
| ----------------- | ----------- | ---------------------------------------------------------- |
| `id`              | UUID (PK)   | Primary key.                                               |
| `developer_id`    | UUID (FK)   | References `developers(id)`.                               |
| `week_start`      | DATE        | Monday (or chosen start) of the week.                      |
| `week_end`        | DATE        | Derived from `week_start`.                                 |
| `total_hours`     | NUMERIC     | Sum of tracked hours in the week.                          |
| `total_points`    | NUMERIC     | Sum of points completed in the week.                       |
| `payout_amount`   | NUMERIC     | Calculated payout for the week.                            |
| `generated_at`    | TIMESTAMP   | When the summary was computed.                             |

## Data Flow Notes

1. **Initial Sync**: Populate `tasks` and `developers` from ClickUp's REST API.
2. **Webhooks**: Use payloads to update `tasks`, append to `task_history`, and recalculate assignments.
3. **Weekly Process**: Run a scheduled job that aggregates tracked hours/points into `weekly_summaries` and triggers payouts.
4. **Assignment Logic**: Calculate each developer's current total points (from open tasks) to auto-assign new tasks to the lowest value.

This schema is intentionally small and can evolve with additional needs such as billing references, sprint planning, or tagging.
