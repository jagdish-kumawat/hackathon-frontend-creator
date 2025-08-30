# Users Controller API Documentation

## Overview
The UsersController manages Entra ID authenticated users in the Hackathon API. All endpoints require authentication unless otherwise noted.

**Base URL:** `/api/users`
**Authentication:** Bearer Token (Entra ID JWT)

---

## Endpoints

### 1. Get Current User Profile
Retrieves the current authenticated user's profile information.

**Endpoint:** `GET /api/users/me`
**Authentication:** Required
**Description:** Returns the current user's profile automatically extracted from the authentication token.

#### Request
```http
GET /api/users/me
Authorization: Bearer {token}
```

#### Response
**Success (200 OK):**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "aadObjectId": "string",
  "tenantId": "string",
  "isActive": true,
  "fullName": "string",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isDeleted": false,
  "deletedAt": null
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

### 2. Update Current User Profile
Updates the current authenticated user's profile information.

**Endpoint:** `PUT /api/users/me`
**Authentication:** Required
**Description:** Updates the current user's first name and last name. Email, AadObjectId, and TenantId are extracted from token and cannot be manually updated.

#### Request
```http
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body Schema
```json
{
  "firstName": "string", // Required, max 100 characters
  "lastName": "string"   // Required, max 100 characters
}
```

#### Request Body Example
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Response
**Success (200 OK):**
```json
{
  "id": "string",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "aadObjectId": "string",
  "tenantId": "string",
  "isActive": true,
  "fullName": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isDeleted": false,
  "deletedAt": null
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body or validation errors
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

### 3. Register Current User
Creates/registers the current user from token information (typically called on first login).

**Endpoint:** `POST /api/users/register`
**Authentication:** Required
**Description:** Creates a new user record based on the information from the authentication token.

#### Request
```http
POST /api/users/register
Authorization: Bearer {token}
```

#### Response
**Success (201 Created):**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "aadObjectId": "string",
  "tenantId": "string",
  "isActive": true,
  "fullName": "string",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isDeleted": false,
  "deletedAt": null
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

### 4. Get Current User Token Information
Returns token information for debugging purposes.

**Endpoint:** `GET /api/users/me/token-info`
**Authentication:** Required
**Description:** Returns the current user's information extracted from the authentication token.

#### Request
```http
GET /api/users/me/token-info
Authorization: Bearer {token}
```

#### Response
**Success (200 OK):**
```json
{
  "aadObjectId": "string",
  "tenantId": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "preferredUsername": "string",
  "name": "string"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error occurred

---

### 5. Get User by ID (Admin)
Retrieves a specific user by their ID.

**Endpoint:** `GET /api/users/{id}`
**Authentication:** Required
**Permissions:** Admin access recommended
**Description:** Returns a specific user's information by their unique ID.

#### Request
```http
GET /api/users/{id}
Authorization: Bearer {token}
```

#### Path Parameters
- `id` (string, required): The unique identifier of the user

#### Response
**Success (200 OK):**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "aadObjectId": "string",
  "tenantId": "string",
  "isActive": true,
  "fullName": "string",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isDeleted": false,
  "deletedAt": null
}
```

**Error Responses:**
- `404 Not Found`: User not found or has been deleted
- `500 Internal Server Error`: Server error occurred

---

### 6. Update User Status (Admin)
Updates a user's active status.

**Endpoint:** `PUT /api/users/{id}/status`
**Authentication:** Required
**Permissions:** Admin access recommended
**Description:** Updates whether a user is active or inactive.

#### Request
```http
PUT /api/users/{id}/status
Authorization: Bearer {token}
Content-Type: application/json
```

#### Path Parameters
- `id` (string, required): The unique identifier of the user

#### Request Body Schema
```json
{
  "isActive": boolean // Required, default: true
}
```

#### Request Body Example
```json
{
  "isActive": false
}
```

#### Response
**Success (200 OK):**
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "aadObjectId": "string",
  "tenantId": "string",
  "isActive": false,
  "fullName": "string",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "isDeleted": false,
  "deletedAt": null
}
```

**Error Responses:**
- `404 Not Found`: User not found or has been deleted
- `500 Internal Server Error`: Server error occurred

---

### 7. Soft Delete User (Admin)
Soft deletes a user (marks as deleted but keeps data).

**Endpoint:** `DELETE /api/users/{id}`
**Authentication:** Required
**Permissions:** Admin access recommended
**Description:** Marks a user as deleted without permanently removing their data.

#### Request
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

#### Path Parameters
- `id` (string, required): The unique identifier of the user

#### Response
**Success (204 No Content):** Empty response body

**Error Responses:**
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error occurred

---

### 8. Permanently Delete User (Admin)
Permanently deletes a user from the database.

**Endpoint:** `DELETE /api/users/{id}/permanent`
**Authentication:** Required
**Permissions:** Admin access recommended
**Description:** Permanently removes a user and all their data from the database.

#### Request
```http
DELETE /api/users/{id}/permanent
Authorization: Bearer {token}
```

#### Path Parameters
- `id` (string, required): The unique identifier of the user

#### Response
**Success (204 No Content):** Empty response body

**Error Responses:**
- `404 Not Found`: User not found
- `500 Internal Server Error`: Server error occurred

---

### 9. Get User Statistics
Retrieves statistics about users in the system.

**Endpoint:** `GET /api/users/stats`
**Authentication:** Required
**Description:** Returns statistical information about users, optionally filtered by tenant.

#### Request
```http
GET /api/users/stats?tenantId={tenantId}
Authorization: Bearer {token}
```

#### Query Parameters
- `tenantId` (string, optional): Filter statistics by specific tenant ID

#### Response
**Success (200 OK):**
```json
{
  "totalUsers": 150,
  "activeUsers": 130,
  "inactiveUsers": 20,
  "deletedUsers": 5
}
```

**Error Responses:**
- `500 Internal Server Error`: Server error occurred

---

## Data Models

### User Model
```json
{
  "id": "string",                    // Unique identifier
  "firstName": "string",             // User's first name (max 100 chars)
  "lastName": "string",              // User's last name (max 100 chars)
  "email": "string",                 // User's email address
  "aadObjectId": "string",           // Azure AD object identifier (36 chars)
  "tenantId": "string",              // Azure AD tenant identifier (36 chars)
  "isActive": boolean,               // Whether the user is active (default: true)
  "fullName": "string",              // Computed: firstName + lastName
  "createdAt": "string",             // ISO 8601 date string
  "updatedAt": "string",             // ISO 8601 date string
  "isDeleted": boolean,              // Soft delete flag (default: false)
  "deletedAt": "string|null"         // ISO 8601 date string or null
}
```

### CurrentUserInfo Model
```json
{
  "aadObjectId": "string",           // Azure AD object identifier
  "tenantId": "string",              // Azure AD tenant identifier
  "email": "string",                 // User's email from token
  "firstName": "string",             // User's first name from token
  "lastName": "string",              // User's last name from token
  "preferredUsername": "string",     // Preferred username from token
  "name": "string"                   // Full name from token
}
```

### UserStats Model
```json
{
  "totalUsers": number,              // Total non-deleted users
  "activeUsers": number,             // Active non-deleted users
  "inactiveUsers": number,           // Inactive non-deleted users
  "deletedUsers": number             // Soft-deleted users
}
```

### UpdateCurrentUserRequest Model
```json
{
  "firstName": "string",             // Required, max 100 characters
  "lastName": "string"               // Required, max 100 characters
}
```

### UpdateUserStatusRequest Model
```json
{
  "isActive": boolean                // Required, default: true
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "type": "string",
  "title": "string",
  "status": number,
  "detail": "string",
  "instance": "string"
}
```

### Common HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content to return
- **400 Bad Request**: Invalid request data or validation errors
- **401 Unauthorized**: Missing or invalid authentication
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error occurred

---

## Authentication

All endpoints require a valid Bearer token from Entra ID (Azure Active Directory). Include the token in the Authorization header:

```http
Authorization: Bearer {your-jwt-token}
```

The token should contain the user's identity information including:
- Object ID (oid claim)
- Tenant ID (tid claim)
- Email (email or preferred_username claim)
- Name information (given_name, family_name, name claims)

---

## Usage Examples

### TypeScript/JavaScript Frontend Integration

```typescript
// Configuration
const API_BASE_URL = 'https://your-api-domain.com/api/users';
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${getAccessToken()}`,
  'Content-Type': 'application/json'
});

// Get current user
async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Update current user
async function updateCurrentUser(userData: {firstName: string, lastName: string}) {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  return response.json();
}

// Register current user
async function registerUser() {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get user statistics
async function getUserStats(tenantId?: string) {
  const url = tenantId 
    ? `${API_BASE_URL}/stats?tenantId=${tenantId}`
    : `${API_BASE_URL}/stats`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  return response.json();
}
```

---

## Notes for Frontend Developers

1. **Authentication Required**: All endpoints require a valid Entra ID Bearer token.

2. **Auto-Registration**: New users are typically auto-registered on first login using the `/register` endpoint.

3. **Token Information**: Use `/me/token-info` for debugging authentication issues.

4. **User Profile Updates**: Only `firstName` and `lastName` can be updated via the API. Email and Azure AD information come from the token.

5. **Admin Functions**: Endpoints like getting users by ID, updating user status, and deleting users are intended for admin functionality.

6. **Soft Delete**: The regular DELETE endpoint performs a soft delete. Use `/permanent` for hard deletion.

7. **Statistics**: The stats endpoint provides useful information for dashboards and reporting.

8. **Error Handling**: Always handle the standard HTTP error codes and check response status before processing data.

9. **Date Formats**: All dates are returned in ISO 8601 format (UTC).

10. **Validation**: Client-side validation should match the server-side constraints (e.g., max string lengths).