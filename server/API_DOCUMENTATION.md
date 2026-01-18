
# Challenge App - API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Auth Endpoints

### Register
POST `/auth/register`

**Request:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (min 6 chars, required)"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**Errors:**
- `400` - Missing fields or password too short
- `409` - User already exists

---

### Login
POST `/auth/login`

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**Errors:**
- `400` - Missing fields
- `401` - Invalid credentials

---

## User Endpoints

### Search Users
GET `/users/search?query=username`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "created_at": "2026-01-18 10:00:00"
    }
  ]
}
```

---

### Get User Profile
GET `/users/:id`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "created_at": "2026-01-18 10:00:00"
  },
  "stats": {
    "total_challenges": 5,
    "completed_challenges": 2,
    "total_progress_entries": 30,
    "completed_days": 25
  }
}
```

**Errors:**
- `404` - User not found

---

## Challenge Endpoints

### Create Challenge
POST `/challenges`

Headers: `Authorization: Bearer TOKEN`

**Request:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "type": "one-time | recurring (required)",
  "frequency": "daily | weekdays (optional, for recurring)",
  "duration_days": "number (optional, for recurring)",
  "target_value": "number (optional)",
  "metric_unit": "string (optional)",
  "stake_description": "string (optional)",
  "start_date": "YYYY-MM-DD (optional)",
  "participant_ids": "[1, 2, 3] (optional)"
}
```

**Response (201):**
```json
{
  "message": "Challenge created successfully",
  "challenge": {
    "id": 1,
    "title": "30 дней медитации",
    "type": "recurring",
    "status": "pending"
  }
}
```

---

### Get User's Challenges
GET `/challenges`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "challenges": [
    {
      "id": 1,
      "title": "30 дней медитации",
      "type": "recurring",
      "status": "active",
      "role": "creator"
    }
  ]
}
```

---

### Get Challenge by ID
GET `/challenges/:id`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "challenge": {},
  "participants": []
}
```

**Errors:**
- `403` - Not a participant
- `404` - Challenge not found

---

### Accept Challenge
POST `/challenges/:id/accept`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "message": "Challenge accepted"
}
```

---

### Decline Challenge
DELETE `/challenges/:id/decline`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "message": "Challenge declined"
}
```

---

### Update Challenge Status
PATCH `/challenges/:id/status`

Headers: `Authorization: Bearer TOKEN`

**Request:**
```json
{
  "status": "pending | active | completed | cancelled"
}
```

**Response (200):**
```json
{
  "message": "Challenge status updated",
  "challenge": {}
}
```

**Errors:**
- `403` - Only creator can update

---

### Delete Challenge
DELETE `/challenges/:id`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "message": "Challenge deleted successfully"
}
```

**Errors:**
- `403` - Only creator can delete

---

### Get Challenge Leaderboard
GET `/challenges/:id/leaderboard`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "leaderboard": [
    {
      "id": 1,
      "username": "testuser",
      "completed_days": 25,
      "current_streak": 5
    }
  ]
}
```

---

## Progress Endpoints

### Mark Progress
POST `/progress/:challengeId`

Headers: `Authorization: Bearer TOKEN`

**Request:**
```json
{
  "date": "YYYY-MM-DD (optional)",
  "completed": true,
  "value": 15,
  "note": "string (optional)"
}
```

**Response (200):**
```json
{
  "message": "Progress marked successfully",
  "progress": {}
}
```

---

### Get Challenge Progress
GET `/progress/:challengeId`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "progress": []
}
```

---

### Get My Progress
GET `/progress/:challengeId/my`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "progress": [],
  "stats": {
    "total_days": 30,
    "completed_days": 25
  }
}
```

---

### Upload Photo Proof
POST `/progress/:progressId/upload`

Headers: `Authorization: Bearer TOKEN`

**Request:** multipart/form-data
- Field: `photo`
- Types: jpeg, jpg, png, gif, webp
- Max: 5MB

**Response (200):**
```json
{
  "message": "Photo uploaded successfully",
  "proof_url": "/uploads/123.jpg"
}
```

---

## Comment Endpoints

### Add Comment
POST `/comments/progress/:progressId`

Headers: `Authorization: Bearer TOKEN`

**Request:**
```json
{
  "comment": "string (required)"
}
```

**Response (201):**
```json
{
  "message": "Comment added",
  "comment": {}
}
```

---

### Get Comments
GET `/comments/progress/:progressId`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "comments": []
}
```

---

### Delete Comment
DELETE `/comments/:commentId`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "message": "Comment deleted"
}
```

---

## Notification Endpoints

### Get Notifications
GET `/notifications`

Query: `?unread=true` (optional)

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "notifications": []
}
```

---

### Mark as Read
PATCH `/notifications/:id/read`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

---

### Mark All as Read
PATCH `/notifications/read-all`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

---

### Delete Notification
DELETE `/notifications/:id`

Headers: `Authorization: Bearer TOKEN`

**Response (200):**
```json
{
  "message": "Notification deleted"
}
```

---

## Error Responses

All errors return:
```json
{
  "error": "Error message"
}
```

Status codes:
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 409 - Conflict
- 500 - Server Error
