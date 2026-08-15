# TaskFlow

A simple task board (Trello-style) built as a take-home assignment. React + Vite frontend, Node/Express backend, SQLite database.

## Tech stack
- Frontend: React (JS) + Vite
- Backend: Node.js + Express
- Database: SQLite (via better-sqlite3)

## Setup (from a fresh clone)

### 1. Backend
cd backend
npm install
node server.js
Runs on `http://localhost:4000`. On first run it creates `taskflow.db` and seeds it with a demo board, 3 columns, and 5 tasks.

### 2. Frontend
Open a second terminal:
cd frontend
npm install
npm run dev
Runs on `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend on port 4000.

### 3. Run backend tests
cd backend
npm test
## Database schema
See `backend/schema.sql`. Three tables: `boards` → `columns` → `tasks`, each with a primary key, foreign keys enforced with `ON DELETE CASCADE`, `NOT NULL` on required fields, and a `CHECK` constraint restricting `priority` to Low/Medium/High.

## Non-trivial queries
1. **Tasks per column** (`GET /api/boards/:id/stats`) — aggregate `GROUP BY` with a `LEFT JOIN` so empty columns still report a count of 0. See `backend/routes/boards.js`.
2. **Tasks by priority, newest first** (`GET /api/tasks/priority/:priority`) — `WHERE` + `ORDER BY created_at DESC` done in SQL. See `backend/routes/tasks.js`.

## Assumptions / decisions
- Single board (id=1) — multi-board support wasn't required by the assignment, so I hardcoded one demo board instead of building board-switching UI.
- Task moves happen via a dropdown on each task card rather than drag-and-drop — the assignment explicitly says a working dropdown beats a broken drag-and-drop, and this kept the core requirements solid within the time budget.
- Priority filtering happens client-side against the already-fetched board data, since the dataset is small. The two required non-trivial SQL queries are demonstrated separately via the `/stats` and `/priority/:priority` endpoints and are covered directly by backend tests, rather than being wired into the filter UI itself.
- Validation (empty title) is enforced both in the form and again on the backend, since the assignment specifically asked for server-side enforcement, not just a disabled button.
- Errors from the backend (failed requests, 404s, validation failures) are surfaced as a readable message banner in the UI instead of a blank screen or console-only error.

## What I'd improve with more time
- Drag-and-drop for moving tasks, as a stretch goal on top of the working dropdown.
- Text search by task title.
- Deploy the app to a live URL (Render/Railway) so it can be opened directly without cloning.
- Optimistic UI updates instead of refetching the whole board after every action, for snappier interactions.
- Support for multiple boards with a board-switcher.

## Time spent
~2 hours

## Something I learned
Working with `better-sqlite3`'s synchronous API was a nice change from the usual async/await ceremony around database calls — it made the route handlers noticeably easier to read and reason about, especially for something small and time-boxed like this.