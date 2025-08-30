# Authentication API Documentation

## Base URL

```
HTTPS: https://localhost:7022/api/auth (recommended)
HTTP:  http://localhost:5093/api/auth (redirects to HTTPS)
```

> **Note**: The API redirects HTTP requests to HTTPS automatically. For testing with curl, use the `-k` flag to ignore SSL certificate issues in development.

## Overview

The Authentication API provides endpoints for user authentication, registration, token management, and user profile operations. All endpoints return JSON responses and use JWT tokens for authentication.

## Table of Contents

- [Authentication Endpoints](#authentication-endpoints)
  - [Login](#login)
  - [Register](#register)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)
  - [Logout All](#logout-all)
- [User Management Endpoints](#user-management-endpoints)
  - [Change Password](#change-password)
  - [Get Current User](#get-current-user)
- [Utility Endpoints](#utility-endpoints)
  - [Check Username Availability](#check-username-availability)
  - [Check Email Availability](#check-email-availability)

## Common Response Formats

### Success Response

```json
{
  "data": "response_data_here",
  "message": "Success message (optional)"
}
```

### Error Response

```json
{
  "message": "Error description"
}
```

### Validation Error Response

```json
{
  "errors": {
    "fieldName": ["Validation error message"]
  }
}
```

---

## Authentication Endpoints

### Login

**POST** `/api/auth/login`

Authenticates a user and returns JWT tokens.

#### Request Schema

```json
{
  "username": "string (required, max 100 chars)",
  "password": "string (required, 6-100 chars)",
  "tenantId": "string (optional)"
}
```

#### Request Example

```json
{
  "username": "testuser",
  "password": "Password123!",
  "tenantId": null
}
```

#### Success Response (200)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI2OGIyYWRiNDM4MmMxZWZjMWE2MWQxMTkiLCJ1bmlxdWVfbmFtZSI6InRlc3R1c2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZ2l2ZW5fbmFtZSI6IlRlc3QiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJmdWxsX25hbWUiOiJUZXN0IFVzZXIiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwianRpIjoiMjliNDc5M2ItMWY2MC00M2Q3LTg1MGMtMGVhMGQ1MmM1ZmM4IiwiaWF0IjoxNzU2NTQwMzQ1LCJyb2xlIjoiVXNlciIsIm5iZiI6MTc1NjU0MDM0NSwiZXhwIjoxNzU2NjI2NzQ1LCJpc3MiOiJIYWNrYXRob25BcGkiLCJhdWQiOiJIYWNrYXRob25BcGkifQ.7VWYGg6ZiOEIhiE0lrpue_kfrZhILw7E01s6TYZ0vMA",
  "refreshToken": "6gjI4D3lcu9YBT51vyKSLBfaXgO2BIGLz5LDgsbjOsVeKxnHzaGs0NSnt8trhlo1A+kMdlc0LWGm2yNRvJDSrA==",
  "expiresAt": "2025-08-31T07:52:25.577574Z",
  "user": {
    "id": "68b2adb4382c1efc1a61d119",
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "fullName": "Test User",
    "roles": ["User"],
    "tenantId": null
  }
}
```

#### Error Response (400)

```json
{
  "message": "Invalid credentials or account locked"
}
```

#### Validation Error Response (400)

```json
{
  "errors": {
    "Username": ["The Username field is required."],
    "Password": ["The Password field is required."]
  }
}
```

#### Server Error (500)

```json
{
  "message": "An error occurred during login"
}
```

---

### Register

**POST** `/api/auth/register`

Creates a new user account.

#### Request Schema

```json
{
  "firstName": "string (required, max 100 chars)",
  "lastName": "string (required, max 100 chars)",
  "email": "string (required, valid email format)",
  "username": "string (required, max 100 chars)",
  "password": "string (required, 6-100 chars)",
  "confirmPassword": "string (required, must match password)",
  "tenantId": "string (optional)"
}
```

#### Request Example

```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "username": "testuser",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "tenantId": null
}
```

#### Success Response (200)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI2OGIyYWRiNDM4MmMxZWZjMWE2MWQxMTkiLCJ1bmlxdWVfbmFtZSI6InRlc3R1c2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZ2l2ZW5fbmFtZSI6IlRlc3QiLCJmYW1pbHlfbmFtZSI6IlVzZXIiLCJmdWxsX25hbWUiOiJUZXN0IFVzZXIiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwianRpIjoiNGJmOGE1MWQtYWJmZC00ZDkwLWIwODQtODQ4ZjU2NmI0ODEzIiwiaWF0IjoxNzU2NTQwMzQwLCJyb2xlIjoiVXNlciIsIm5iZiI6MTc1NjU0MDM0MCwiZXhwIjoxNzU2NjI2NzQwLCJpc3MiOiJIYWNrYXRob25BcGkiLCJhdWQiOiJIYWNrYXRob25BcGkifQ.W7ICVJ-hHQt0db0wgFu02bxrtPMLXuIJXxp8ZcSNoJc",
  "refreshToken": "ebysNUbvk8QHrQuz8z8klEQBKL+up9vx7+1b6Jc10tlDnN7h9AMy0qgbApkVKHZDxJPSiKPEFM8tTTHyzqltLg==",
  "expiresAt": "2025-08-31T07:52:20.312441Z",
  "user": {
    "id": "68b2adb4382c1efc1a61d119",
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "fullName": "Test User",
    "roles": ["User"],
    "tenantId": null
  }
}
```

#### Error Response (400)

```json
{
  "message": "Username or email already exists"
}
```

#### Validation Error Response (400)

```json
{
  "errors": {
    "Email": ["The Email field is not a valid e-mail address."],
    "ConfirmPassword": ["'Confirm Password' and 'Password' do not match."]
  }
}
```

#### Server Error (500)

```json
{
  "message": "An error occurred during registration"
}
```

---

### Refresh Token

**POST** `/api/auth/refresh`

Refreshes an expired access token using a refresh token.

#### Request Schema

```json
{
  "refreshToken": "string (required)"
}
```

#### Request Example

```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Success Response (200)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440002",
  "expiresAt": "2025-08-30T13:00:00Z",
  "user": {
    "id": "66d123456789abcdef123456",
    "username": "admin",
    "email": "admin@admin.com",
    "firstName": "System",
    "lastName": "Administrator",
    "fullName": "System Administrator",
    "roles": ["Admin", "User"],
    "tenantId": null
  }
}
```

#### Error Response (400)

```json
{
  "message": "Invalid or expired refresh token"
}
```

#### Server Error (500)

```json
{
  "message": "An error occurred during token refresh"
}
```

---

### Logout

**POST** `/api/auth/logout`

**🔒 Requires Authentication**

Logs out the user by revoking the specified refresh token.

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request Schema

```json
{
  "refreshToken": "string (required)"
}
```

#### Request Example

```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Success Response (200)

```json
{
  "message": "Logged out successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Invalid refresh token"
}
```

#### Unauthorized Response (401)

```json
{
  "message": "Unauthorized"
}
```

#### Server Error (500)

```json
{
  "message": "An error occurred during logout"
}
```

---

### Logout All

**POST** `/api/auth/logout-all`

**🔒 Requires Authentication**

Logs out the user from all devices by revoking all refresh tokens.

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request Schema

No request body required.

#### Success Response (200)

```json
{
  "message": "Logged out from 3 devices"
}
```

#### Unauthorized Response (401)

```json
{
  "message": "Unauthorized"
}
```

#### Server Error (500)

```json
{
  "message": "An error occurred during logout"
}
```

---

## User Management Endpoints

### Change Password

**POST** `/api/auth/change-password`

**🔒 Requires Authentication**

Changes the current user's password.

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request Schema

```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, 6-100 chars)",
  "confirmNewPassword": "string (required, must match newPassword)"
}
```

#### Request Example

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

#### Success Response (200)

```json
{
  "message": "Password changed successfully"
}
```

#### Error Response (400)

```json
{
  "message": "Current password is incorrect"
}
```

#### Validation Error Response (400)

```json
{
  "errors": {
    "ConfirmNewPassword": [
      "'Confirm New Password' and 'New Password' do not match."
    ]
  }
}
```

#### Unauthorized Response (401)

```json
{
  "message": "Unauthorized"
}
```

#### Server Error (500)

```json
{
  "message": "An error occurred while changing password"
}
```

---

### Get Current User

**GET** `/api/auth/me`

**🔒 Requires Authentication**

Retrieves the current authenticated user's information.

#### Headers

```
Authorization: Bearer {jwt_token}
```

#### Request Schema

No request body required.

#### Success Response (200)

```json
{
  "userId": "68b2adb4382c1efc1a61d119",
  "username": "testuser",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  "fullName": "Test User",
  "tenantId": null,
  "roles": ["User"]
}
```

#### Unauthorized Response (401)

```json
{
  "message": "Unauthorized"
}
```

#### Server Error (500)

```json
{
  "message": "An error occurred while retrieving user information"
}
```

---

## Utility Endpoints

### Check Username Availability

**GET** `/api/auth/check-username/{username}`

Checks if a username is available for registration.

#### Path Parameters

- `username` (string, required): The username to check

#### Request Example

```
GET /api/auth/check-username/testuser
```

#### Success Response (200)

```json
{
  "isAvailable": true
}
```

**Example with existing username:**

```json
{
  "isAvailable": false
}
```

#### Error Response (400)

```json
{
  "message": "Username is required"
}
```

#### Server Error (500)

```json
{
  "message": "An error occurred while checking username availability"
}
```

---

### Check Email Availability

**GET** `/api/auth/check-email/{email}`

Checks if an email address is available for registration.

#### Path Parameters

- `email` (string, required): The email address to check

#### Request Example

```
GET /api/auth/check-email/newemail@example.com
```

#### Success Response (200)

```json
{
  "isAvailable": true
}
```

**Example with existing email:**

```json
{
  "isAvailable": false
}
```

#### Error Response (400)

```json
{
  "message": "Email is required"
}
```

#### Server Error (500)

```json
{
  "message": "An error occurred while checking email availability"
}
```

---

## HTTP Status Codes

| Status Code | Description                                                |
| ----------- | ---------------------------------------------------------- |
| 200         | OK - Request successful                                    |
| 400         | Bad Request - Invalid request data or business logic error |
| 401         | Unauthorized - Authentication required or invalid token    |
| 500         | Internal Server Error - Server-side error                  |

## Security Notes

1. **Default Admin Account**: The system creates a default admin account with:

   - Username: `admin`
   - Password: `admin`
   - **⚠️ IMPORTANT**: Change this password immediately in production!

2. **JWT Tokens**:

   - Access tokens have a limited lifespan
   - Use refresh tokens to obtain new access tokens
   - Store tokens securely (HttpOnly cookies recommended for web apps)

3. **Password Requirements**:

   - Minimum 6 characters
   - Maximum 100 characters
   - Consider implementing stronger password policies for production

4. **Rate Limiting**: Consider implementing rate limiting for authentication endpoints in production

## Error Handling Best Practices

1. Always check the HTTP status code first
2. Parse error messages from the response body
3. Handle validation errors by checking the `errors` object
4. Implement proper retry logic for 500 errors
5. Store and use refresh tokens for token expiration handling

## Frontend Integration Examples

### JavaScript/TypeScript Example

```javascript
// Login function
async function login(username, password) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const authData = await response.json();
    // Store tokens securely
    localStorage.setItem("accessToken", authData.token);
    localStorage.setItem("refreshToken", authData.refreshToken);

    return authData;
  } catch (error) {
    console.error("Login failed:", error.message);
    throw error;
  }
}

// Authenticated request with automatic token refresh
async function authenticatedRequest(url, options = {}) {
  let token = localStorage.getItem("accessToken");

  const makeRequest = async (authToken) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${authToken}`,
      },
    });
  };

  let response = await makeRequest(token);

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const authData = await refreshResponse.json();
          localStorage.setItem("accessToken", authData.token);
          localStorage.setItem("refreshToken", authData.refreshToken);

          // Retry original request with new token
          response = await makeRequest(authData.token);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }
  }

  return response;
}
```

### React Hook Example

```typescript
// useAuth.ts
import { useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  tenantId: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Validate token and get user info
      getCurrentUser(token);
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const getCurrentUser = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const authData = await response.json();
        localStorage.setItem("accessToken", authData.token);
        localStorage.setItem("refreshToken", authData.refreshToken);

        setAuthState({
          user: authData.user,
          token: authData.token,
          isAuthenticated: true,
          isLoading: false,
        });

        return authData;
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error("Logout request failed:", error);
      }
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};
```

## Testing

The API has been tested with the following scenarios:

1. ✅ Application starts successfully on `http://localhost:5093`
2. ✅ MongoDB connection established
3. ✅ Default admin user seeding works
4. ✅ Token cleanup service runs
5. ✅ All endpoints are properly configured and accessible

### Test Credentials

For testing purposes, you can create a new user with registration or use existing users in the database. The system has user seeding functionality that creates an admin user if no users exist.

**Example Test User:**

- Username: `testuser`
- Password: `Password123!`
- Email: `test@example.com`

### Common Test Scenarios

1. **Successful Login Flow**

   - POST `/api/auth/login` with valid credentials
   - Verify response contains valid JWT token and user data
   - Use token for authenticated requests

2. **Registration Flow**

   - Check username/email availability
   - POST `/api/auth/register` with valid data
   - Verify new user can login

3. **Token Refresh Flow**

   - Wait for token expiration or manually expire
   - POST `/api/auth/refresh` with refresh token
   - Verify new token works for authenticated requests

4. **Logout Flow**

   - POST `/api/auth/logout` with refresh token
   - Verify token is invalidated

5. **Password Change Flow**
   - POST `/api/auth/change-password` with current and new passwords
   - Verify old password no longer works
   - Verify new password works for login

This documentation provides comprehensive information for frontend developers to integrate with the authentication API effectively.

## Testing with cURL

Here are some example cURL commands for testing the API endpoints:

### 1. Register a new user

```bash
curl -k -X POST "https://localhost:7022/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'
```

### 2. Login with the new user

```bash
curl -k -X POST "https://localhost:7022/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Password123!"
  }'
```

### 3. Get current user info

```bash
curl -k -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://localhost:7022/api/auth/me"
```

### 4. Check username availability

```bash
curl -k "https://localhost:7022/api/auth/check-username/newusername"
```

### 5. Check email availability

```bash
curl -k "https://localhost:7022/api/auth/check-email/newemail@example.com"
```

### 6. Refresh token

```bash
curl -k -X POST "https://localhost:7022/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 7. Logout

```bash
curl -k -X POST "https://localhost:7022/api/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 8. Logout from all devices

```bash
curl -k -X POST "https://localhost:7022/api/auth/logout-all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Change password

```bash
curl -k -X POST "https://localhost:7022/api/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NewPassword123!",
    "confirmNewPassword": "NewPassword123!"
  }'
```

> **Note**: Replace `YOUR_JWT_TOKEN` and `YOUR_REFRESH_TOKEN` with actual tokens received from login/register responses.
