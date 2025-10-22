# API Documentation

## Overview

This document describes all API endpoints available in the Brainwave Landing project management system. All endpoints are RESTful and return JSON responses.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication via Clerk. The user's Clerk ID is used to identify users in the database.

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "status": 500
}
```

## Endpoints

### Users

#### GET /api/users
Get all users or a specific user by Clerk ID.

**Query Parameters:**
- `clerkId` (optional): Get specific user by Clerk ID

**Response:**
```json
[
  {
    "id": "user_123",
    "clerkId": "clerk_user_456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/users
Create a new user.

**Request Body:**
```json
{
  "clerkId": "clerk_user_456",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "id": "user_123",
  "clerkId": "clerk_user_456",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Projects

#### GET /api/projects
Get projects. Can filter by client ID or get admin view.

**Query Parameters:**
- `clientId` (optional): Get projects for specific client
- `adminView` (optional): Get all projects (admin only)

**Response:**
```json
[
  {
    "id": "proj_123",
    "clientId": "user_123",
    "client": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "projectName": "AI Chatbot Implementation",
    "projectDescription": "Customer support chatbot",
    "assignedConsultant": "Joel Auge",
    "quotedAmount": 150000,
    "totalProgress": 33,
    "paymentStatus": "partial",
    "projectStatus": "active",
    "finalClientSignOff": false,
    "finalConsultantSignOff": false,
    "finalPaymentRequired": false,
    "completionDate": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "steps": [
      {
        "id": "step_123",
        "projectId": "proj_123",
        "title": "Discovery & Assessment",
        "text": "Understanding business goals",
        "date": "Step 1",
        "status": "done",
        "clientNotes": "Client provided requirements",
        "consultantNotes": "Assessment complete",
        "clientSignOff": true,
        "consultantSignOff": true,
        "completedDate": "2025-01-01T00:00:00.000Z",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "resourceRequests": []
      }
    ],
    "resourceRequests": []
  }
]
```

#### POST /api/projects
Create a new project.

**Request Body:**
```json
{
  "clientId": "user_123",
  "projectName": "AI Chatbot Implementation",
  "projectDescription": "Customer support chatbot",
  "assignedConsultant": "Joel Auge",
  "quotedAmount": 150000,
  "steps": [
    {
      "title": "Discovery & Assessment",
      "text": "Understanding business goals",
      "date": "Step 1",
      "status": "pending",
      "clientNotes": "",
      "consultantNotes": "",
      "clientSignOff": false,
      "consultantSignOff": false
    }
  ]
}
```

**Response:**
```json
{
  "id": "proj_123",
  "clientId": "user_123",
  "projectName": "AI Chatbot Implementation",
  "projectDescription": "Customer support chatbot",
  "assignedConsultant": "Joel Auge",
  "quotedAmount": 150000,
  "totalProgress": 0,
  "paymentStatus": "pending",
  "projectStatus": "quoted",
  "finalClientSignOff": false,
  "finalConsultantSignOff": false,
  "finalPaymentRequired": false,
  "completionDate": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "steps": [...],
  "resourceRequests": []
}
```

#### PATCH /api/projects/[id]
Update project details.

**Request Body:**
```json
{
  "projectName": "Updated Project Name",
  "projectDescription": "Updated description",
  "assignedConsultant": "David Morin",
  "quotedAmount": 200000
}
```

**Response:**
```json
{
  "id": "proj_123",
  "projectName": "Updated Project Name",
  "projectDescription": "Updated description",
  "assignedConsultant": "David Morin",
  "quotedAmount": 200000,
  "updatedAt": "2025-01-01T00:00:00.000Z",
  ...
}
```

#### DELETE /api/projects/[id]
Delete a project and all associated data.

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

### Project Steps

#### PATCH /api/project-steps
Update a project step.

**Request Body:**
```json
{
  "id": "step_123",
  "status": "done",
  "clientNotes": "Client notes",
  "consultantNotes": "Consultant notes",
  "clientSignOff": true,
  "consultantSignOff": true
}
```

**Response:**
```json
{
  "id": "step_123",
  "projectId": "proj_123",
  "title": "Discovery & Assessment",
  "text": "Understanding business goals",
  "date": "Step 1",
  "status": "done",
  "clientNotes": "Client notes",
  "consultantNotes": "Consultant notes",
  "clientSignOff": true,
  "consultantSignOff": true,
  "completedDate": "2025-01-01T00:00:00.000Z",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Project Requests

#### GET /api/project-requests
Get all project requests.

**Response:**
```json
[
  {
    "id": "req_123",
    "clientId": "user_123",
    "client": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "projectTitle": "AI Chatbot for Customer Support",
    "projectDescription": "We need a sophisticated AI chatbot...",
    "status": "pending",
    "reviewedAt": null,
    "reviewedBy": null,
    "notes": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/project-requests
Create a new project request.

**Request Body:**
```json
{
  "clientId": "user_123",
  "projectTitle": "AI Chatbot for Customer Support",
  "projectDescription": "We need a sophisticated AI chatbot that can handle customer inquiries..."
}
```

**Response:**
```json
{
  "id": "req_123",
  "clientId": "user_123",
  "projectTitle": "AI Chatbot for Customer Support",
  "projectDescription": "We need a sophisticated AI chatbot...",
  "status": "pending",
  "reviewedAt": null,
  "reviewedBy": null,
  "notes": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### PATCH /api/project-requests
Update project request status.

**Request Body:**
```json
{
  "id": "req_123",
  "status": "approved",
  "notes": "Approved for development",
  "reviewedBy": "admin_user_id"
}
```

**Response:**
```json
{
  "id": "req_123",
  "status": "approved",
  "notes": "Approved for development",
  "reviewedBy": "admin_user_id",
  "reviewedAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### Resource Requests

#### GET /api/resource-requests
Get all resource requests.

**Response:**
```json
[
  {
    "id": "res_123",
    "projectId": "proj_123",
    "stepId": "step_123",
    "title": "Additional Data Processing",
    "description": "Client requested additional data sources",
    "amount": 25000,
    "status": "pending",
    "requestedBy": "admin",
    "requestedAt": "2025-01-01T00:00:00.000Z",
    "approvedAt": null,
    "rejectedAt": null
  }
]
```

#### POST /api/resource-requests
Create a new resource request.

**Request Body:**
```json
{
  "projectId": "proj_123",
  "stepId": "step_123",
  "title": "Additional Data Processing",
  "description": "Client requested additional data sources",
  "amount": 25000,
  "requestedBy": "admin"
}
```

**Response:**
```json
{
  "id": "res_123",
  "projectId": "proj_123",
  "stepId": "step_123",
  "title": "Additional Data Processing",
  "description": "Client requested additional data sources",
  "amount": 25000,
  "status": "pending",
  "requestedBy": "admin",
  "requestedAt": "2025-01-01T00:00:00.000Z",
  "approvedAt": null,
  "rejectedAt": null
}
```

#### PATCH /api/resource-requests
Update resource request status.

**Request Body:**
```json
{
  "id": "res_123",
  "status": "approved"
}
```

**Response:**
```json
{
  "id": "res_123",
  "status": "approved",
  "approvedAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### PATCH /api/resource-requests/[id]
Update resource request details.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "amount": 30000
}
```

**Response:**
```json
{
  "id": "res_123",
  "title": "Updated Title",
  "description": "Updated description",
  "amount": 30000,
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### DELETE /api/resource-requests/[id]
Delete a resource request.

**Response:**
```json
{
  "message": "Resource request deleted successfully"
}
```

## Error Codes

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Messages
- `"Internal server error"` - Database or server error
- `"User not found"` - Clerk ID not found in database
- `"Project not found"` - Project ID doesn't exist
- `"Unauthorized"` - User doesn't have permission

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production use.

## CORS

CORS is configured to allow requests from the same origin (localhost:3000).

## Testing

### Using curl

```bash
# Get all projects
curl -X GET http://localhost:3000/api/projects

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "clerkId": "test_user_123",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'

# Update a project step
curl -X PATCH http://localhost:3000/api/project-steps \
  -H "Content-Type: application/json" \
  -d '{
    "id": "step_123",
    "status": "done",
    "consultantNotes": "Step completed"
  }'
```

### Using JavaScript

```javascript
// Get projects
const projects = await fetch('/api/projects').then(r => r.json());

// Create project request
const request = await fetch('/api/project-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'user_123',
    projectTitle: 'New Project',
    projectDescription: 'Project description'
  })
}).then(r => r.json());
```

## Security Considerations

1. **Authentication**: All endpoints require valid Clerk authentication
2. **Authorization**: Users can only access their own data (except admin endpoints)
3. **Input Validation**: All inputs are validated and sanitized
4. **SQL Injection**: Prisma ORM prevents SQL injection attacks
5. **CORS**: Configured for same-origin requests only

## Future Enhancements

1. **Rate Limiting**: Implement rate limiting for production
2. **Caching**: Add Redis caching for frequently accessed data
3. **Webhooks**: Add webhook support for real-time updates
4. **File Upload**: Support for file attachments
5. **Audit Logging**: Track all API operations
6. **API Versioning**: Support multiple API versions

---

*Last Updated: January 2025*
*API Version: 1.0*
