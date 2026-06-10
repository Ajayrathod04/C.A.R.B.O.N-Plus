# C.A.R.B.O.N+ API Reference

All backend API routes are prefix-mapped under `/api`.

### Headers
Every request should send the client session header to identify the user uniquely:
- `x-user-id`: Unique alphanumeric user string (e.g. `usr_s8k2jd91s`)

---

## 1. Health Check
Checks backend health status and active database connections.

* **URL**: `/health`
* **Method**: `GET`
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "message": "Health check passed",
    "data": {
      "status": "UP",
      "uptime": 12.42,
      "timestamp": "2026-06-10T02:00:00.000Z",
      "database": {
        "status": "CONNECTED",
        "mode": "google_cloud_firestore"
      }
    }
  }
  ```

---

## 2. Carbon Footprint Calculator

### Log Footprint
Compute and store a daily carbon emission log.

* **URL**: `/calculator`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "transportType": "car_petrol",
    "transportDistance": 45.2,
    "electricityKwh": 12.0,
    "electricityType": "grid",
    "foodHabit": "vegetarian",
    "wasteWeight": 4.5,
    "wasteType": "landfill",
    "date": "2026-06-10"
  }
  ```
* **Response (Success - 201)**:
  ```json
  {
    "success": true,
    "message": "Carbon footprint logged successfully",
    "data": {
      "id": "abc123xyz",
      "userId": "default-user",
      "total": 19.34,
      "breakdown": {
        "transport": 9.04,
        "electricity": 9.84,
        "food": 1.7,
        "waste": 3.6
      },
      "date": "2026-06-10"
    }
  }
  ```

### Get Footprint Logs
Fetch all logged emission records for the current user.

* **URL**: `/calculator`
* **Method**: `GET`

---

## 3. Dashboard Metrics
Retrieve calculated totals and category breakdowns for Daily, Weekly, Monthly, and Yearly intervals.

* **URL**: `/dashboard`
* **Method**: `GET`
* **Response (Success - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "daily": { "total": 19.34, "breakdown": { "transport": 9.04, "electricity": 9.84, "food": 1.7, "waste": 3.6 } },
      "weekly": { "total": 134.22, "breakdown": { "transport": 62.4, "electricity": 42.1, "food": 11.9, "waste": 17.82 } },
      "monthly": { "total": 450.12, "breakdown": { ... } },
      "yearly": { "total": 1200.55, "breakdown": { ... } },
      "recentLogs": [ ... ]
    }
  }
  ```

---

## 4. Green Habit Tracker

### Log Action
Record eco-friendly habits to calculate saved carbon footprint.

* **URL**: `/habits`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "habitType": "cycling",
    "value": 15.0,
    "date": "2026-06-10"
  }
  ```
* **Response (Success - 201)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "habitLogId123",
      "userId": "default-user",
      "habitType": "cycling",
      "value": 15,
      "carbonSaved": 3.0,
      "date": "2026-06-10"
    }
  }
  ```

---

## 5. Carbon Reduction Goals
Standard CRUD endpoints under `/goals` for set targets, listing them (`GET`), updating goal progress (`PUT /goals/:id`), and deleting goals (`DELETE /goals/:id`).
