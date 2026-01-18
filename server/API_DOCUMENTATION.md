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
**POST** `/auth/register`

Request:
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (min 6 chars, required)"
}
```

Response (201):
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

Errors:
- `400` - Missing fields or password too short
- `409` - User already exists

---

### Login
**POST** `/auth/login`

Request:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

Response (200):
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

Errors:
- `400` - Missing fields
- `401` - Invalid credentials

---

## User Endpoints

### Search Users
**GET** `/users/search?query=username`

Headers: `Authorization: Bearer TOKEN`

Response (200):
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
**GET** `/users/:id`

Headers: `Authorization: Bearer TOKEN`

Response (200):
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

Errors:
- `404` - User not found

---

## Challenge Endpoints

### Create Challenge
**POST** `/challenges`

Headers: `Authorization: Bearer TOKEN`

Request:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "type": "one-time | recurring (required)",
  "frequency": "daily | weekdays | etc (optional, for recurring)",
  "duration_days": "number (optional, for recurring)",
  "target_value": "number (optional)",
  "metric_unit": "string (optional, e.g. 'km', 'minutes')",
  "stake_description": "string (optional)",
  "start_date": "YYYY-MM-DD (optional, defaults to today)",
  "participant_ids": [1, 2, 3] // array of user IDs (optional)
}
```

Response (201):
```json
{
  "message": "Challenge created successfully",
  "challenge": {
    "id": 1,
    "title": "30 дней медитации",
    "description": "Медитировать каждый день",
    "type": "recurring",
    "frequency": "daily",
    "duration_days": 30,
    "target_value": 10,
    "metric_unit": "minutes",
    "stake_description": null,
    "creator_id": 1,
    "created_at": "2026-01-18 10:00:00",
    "start_date": "2026-01-18",
    "status": "pending"
  }
}
```

Errors:
- `400` - Missing required fields

---

### Get User's Challenges
**GET** `/challenges`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "challenges": [
    {
      "id": 1,
      "title": "30 дней медитации",
      "type": "recurring",
      "status": "active",
      "role": "creator",
      "accepted_at": "2026-01-18 10:00:00",
      // ... other fields
    }
  ]
}
```

---

### Get Challenge by ID
**GET** `/challenges/:id`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "challenge": {
    "id": 1,
    "title": "30 дней медитации",
    // ... all challenge fields
  },
  "participants": [
    {
      "id": 1,
      "challenge_id": 1,
      "user_id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "role": "creator",
      "accepted_at": "2026-01-18 10:00:00"
    }
  ]
}
```

Errors:
- `403` - Not a participant
- `404` - Challenge not found

---

### Accept Challenge
**POST** `/challenges/:id/accept`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "message": "Challenge accepted"
}
```

Errors:
- `404` - Invitation not found or already accepted

---

### Decline Challenge
**DELETE** `/challenges/:id/decline`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "message": "Challenge declined"
}
```

Errors:
- `404` - Invitation not found

---

### Update Challenge Status
**PATCH** `/challenges/:id/status`

Headers: `Authorization: Bearer TOKEN`

Request:
```json
{
  "status": "pending | active | completed | cancelled"
}
```

Response (200):
```json
{
  "message": "Challenge status updated",
  "challenge": { /* updated challenge */ }
}
```

Errors:
- `400` - Invalid status
- `403` - Only creator can update status

---

### Delete Challenge
**DELETE** `/challenges/:id`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "message": "Challenge deleted successfully"
}
```

Errors:
- `403` - Only creator can delete

---

### Get Challenge Leaderboard
**GET** `/challenges/:id/leaderboard`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "leaderboard": [
    {
      "id": 1,
      "username": "testuser",
      "role": "creator",
      "total_entries": 30,
      "completed_days": 25,
      "total_value": 250,
      "last_activity": "2026-01-18",
      "current_streak": 5
    }
  ]
}
```

Errors:
- `403` - Not a participant

---

## Progress Endpoints

### Mark Progress
**POST** `/progress/:challengeId`

Headers: `Authorization: Bearer TOKEN`

Request:
```json
{
  "date": "YYYY-MM-DD (optional, defaults to today)",
  "completed": true,
  "value": 15,
  "note": "Отличная тренировка",
  "proof_url": "string (optional, set via upload)"
}
```

Response (200):
```json
{
  "message": "Progress marked successfully",
  "progress": {
    "id": 1,
    "participant_id": 1,
    "date": "2026-01-18",
    "completed": 1,
    "value": 15,
    "note": "Отличная тренировка",
    "proof_url": null,
    "completed_at": "2026-01-18 10:00:00"
  }
}
```

Errors:
- `403` - Not a participant

---

### Get Challenge Progress (All Participants)
**GET** `/progress/:challengeId`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "progress": [
    {
      "id": 1,
      "participant_id": 1,
      "user_id": 1,
      "username": "testuser",
      "date": "2026-01-18",
      "completed": 1,
      "value": 15,
      "note": "Отличная тренировка",
      "proof_url": "/uploads/123.jpg",
      "completed_at": "2026-01-18 10:00:00"
    }
  ]
}
```

---

### Get My Progress
**GET** `/progress/:challengeId/my`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "progress": [ /* array of progress entries */ ],
  "stats": {
    "total_days": 30,
    "completed_days": 25,
    "total_value": 250
  }
}
```

Errors:
- `403` - Not a participant

---

### Upload Photo Proof
**POST** `/progress/:progressId/upload`

Headers: `Authorization: Bearer TOKEN`

Request: `multipart/form-data`
- Field name: `photo`
- File types: jpeg, jpg, png, gif, webp
- Max size: 5MB

Response (200):
```json
{
  "message": "Photo uploaded successfully",
  "proof_url": "/uploads/1768746647061-1-photo.png"
}
```

Errors:
- `400` - No file uploaded or invalid file type
- `403` - Access denied (not your progress)

---

## Comment Endpoints

### Add Comment to Progress
**POST** `/comments/progress/:progressId`

Headers: `Authorization: Bearer TOKEN`

Request:
```json
{
  "comment": "string (required, non-empty)"
}
```

Response (201):
```json
{
  "message": "Comment added",
  "comment": {
    "id": 1,
    "progress_id": 1,
    "user_id": 1,
    "comment": "Отличная работа!",
    "created_at": "2026-01-18 10:00:00",
    "username": "testuser"
  }
}
```

Errors:
- `400` - Comment is empty
- `403` - Only challenge participants can comment
- `404` - Progress not found

---

### Get Comments for Progress
**GET** `/comments/progress/:progressId`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "comments": [
    {
      "id": 1,
      "progress_id": 1,
      "user_id": 1,
      "username": "testuser",
      "comment": "Отличная работа!",
      "created_at": "2026-01-18 10:00:00"
    }
  ]
}
```

Errors:
- `403` - Access denied
- `404` - Progress not found

---

### Delete Comment
**DELETE** `/comments/:commentId`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "message": "Comment deleted"
}
```

Errors:
- `404` - Comment not found or access denied (can only delete own comments)

---

## Notification Endpoints

### Get Notifications
**GET** `/notifications`

Query params:
- `unread=true` (optional) - only unread notifications

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "type": "challenge_invite | challenge_accepted | progress_marked | comment_added",
      "title": "Новое приглашение",
      "message": "testuser приглашает тебя в челлендж",
      "challenge_id": 1,
      "progress_id": null,
      "from_user_id": 2,
      "from_username": "friend",
      "is_read": 0,
      "created_at": "2026-01-18 10:00:00"
    }
  ]
}
```

---

### Mark Notification as Read
**PATCH** `/notifications/:id/read`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "message": "Notification marked as read"
}
```

Errors:
- `404` - Notification not found

---

### Mark All Notifications as Read
**PATCH** `/notifications/read-all`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "message": "All notifications marked as read"
}
```

---

### Delete Notification
**DELETE** `/notifications/:id`

Headers: `Authorization: Bearer TOKEN`

Response (200):
```json
{
  "message": "Notification deleted"
}
```

Errors:
- `404` - Notification not found

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Server Error

---

## Data Models

### User
```typescript
{
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
}
```

### Challenge
```typescript
{
  id: number;
  title: string;
  description?: string;
  type: 'one-time' | 'recurring';
  frequency?: string;
  duration_days?: number;
  target_value?: number;
  metric_unit?: string;
  stake_description?: string;
  creator_id: number;
  created_at: string;
  start_date?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}
```

### Progress
```typescript
{
  id: number;
  participant_id: number;
  date: string;
  completed: boolean;
  value?: number;
  note?: string;
  proof_url?: string;
  completed_at?: string;
}
```

### Notification Types
- `challenge_invite` - User invited to challenge
- `challenge_accepted` - Participant accepted challenge
- `progress_marked` - Participant marked progress
- `comment_added` - New comment on progress