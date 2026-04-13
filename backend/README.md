# Student Attendance Portal — Backend API

A Node.js/Express REST API backend for the Student Attendance Portal. Uses SQLite (via `better-sqlite3`) for persistent storage, JWT for authentication, and `express-validator` for input validation.

## Quick Start

```bash
cd backend
npm install
cp .env.example .env   # edit values as needed
npm run seed           # populate sample data
npm start              # production
npm run dev            # development (with nodemon)
```

The server starts on **http://localhost:5000** by default.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DB_PATH` | `./data/attendance.db` | SQLite database file path |
| `JWT_SECRET` | — | **Required in production** |
| `JWT_EXPIRES_IN` | `7d` | JWT token lifetime |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

## Authentication

All `/api/students`, `/api/attendance`, and `/api/reports` endpoints require a JWT bearer token.

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login`.

---

## Endpoints

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Server health check |

---

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/logout` | Logout (invalidate client token) |
| GET | `/api/auth/profile` | Get current user profile |

**Register body:**
```json
{ "username": "alice", "email": "alice@example.com", "password": "secret123", "role": "teacher" }
```

**Login body:**
```json
{ "email": "alice@example.com", "password": "secret123" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "username": "alice", "email": "alice@example.com", "role": "teacher" },
    "token": "<jwt>"
  }
}
```

---

### Student Management

| Method | Path | Description |
|---|---|---|
| GET | `/api/students` | List all students (paginated + filtered) |
| GET | `/api/students/:id` | Get single student |
| POST | `/api/students` | Create student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

**Query parameters for GET `/api/students`:**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 10, max: 100) |
| `class` | string | Filter by class |
| `section` | string | Filter by section |
| `status` | string | Filter by `active` or `inactive` |
| `search` | string | Search name, roll number, email |
| `sort` | string | Sort field: `name`, `roll_number`, `class`, `section`, `created_at` |
| `order` | string | `asc` or `desc` |

**Create/Update body:**
```json
{
  "name": "Aarav Kumar",
  "rollNumber": "CS001",
  "email": "aarav@school.edu",
  "phone": "9876543210",
  "class": "10",
  "section": "A",
  "status": "active"
}
```

---

### Attendance Tracking

| Method | Path | Description |
|---|---|---|
| GET | `/api/attendance/date/:date` | Get attendance for a date (`YYYY-MM-DD`) |
| GET | `/api/attendance/student/:studentId` | Student attendance history |
| GET | `/api/attendance/monthly/:year/:month` | Monthly attendance data |
| POST | `/api/attendance` | Mark attendance for one student |
| PUT | `/api/attendance/:id` | Update attendance record |
| POST | `/api/attendance/bulk` | Mark attendance for multiple students |

**Mark attendance body:**
```json
{ "studentId": 1, "date": "2024-03-15", "status": "present", "remarks": "" }
```

**Bulk attendance body:**
```json
{
  "date": "2024-03-15",
  "records": [
    { "studentId": 1, "status": "present" },
    { "studentId": 2, "status": "absent", "remarks": "Sick" },
    { "studentId": 3, "status": "leave" }
  ]
}
```

**Status values:** `present`, `absent`, `leave`

---

### Reports & Analytics

| Method | Path | Description |
|---|---|---|
| GET | `/api/reports/summary` | Overall attendance summary |
| GET | `/api/reports/monthly/:year/:month` | Monthly report for all students |
| GET | `/api/reports/student/:studentId` | Individual student report |
| GET | `/api/reports/export/csv` | Export attendance data as CSV |

**CSV export query params:** `startDate`, `endDate`, `class`, `section`

---

## Response Format

All responses follow a consistent format:

```json
{ "success": true, "data": { ... } }
```

Errors:
```json
{ "success": false, "message": "Error description" }
```

Validation errors:
```json
{ "success": false, "errors": [{ "field": "email", "message": "Invalid email format" }] }
```

Paginated lists include:
```json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

## Default Seed Credentials

After running `npm run seed`:

- **Admin:** `admin@school.edu` / `admin123`
