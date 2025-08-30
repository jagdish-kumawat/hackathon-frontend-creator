# LLM Controller API Documentation

## Overview

The LLM Controller provides endpoints for managing and retrieving LLM (Large Language Model) providers in the Hackathon API.

## Base URL

```
https://localhost:7022/api/llm
```

## Authentication

All endpoints require JWT Bearer token authentication. Include the authorization header in all requests:

```
Authorization: Bearer <jwt-token>
```

## Endpoints

### Get All LLM Providers

Retrieves a list of all available LLM providers in the system.

**Endpoint:** `GET /providers`

**URL:** `https://localhost:7022/api/llm/providers`

**Method:** `GET`

**Authentication:** Required (Bearer Token)

**Request Headers:**

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:** None

**Response:**

**Success Response (200 OK):**

```json
[
  {
    "id": "68b2bae11f5d3c18e5832d7f",
    "name": "OpenAI",
    "createdAt": "2025-08-30T08:48:33.922Z",
    "updatedAt": "2025-08-30T08:48:33.922Z"
  },
  {
    "id": "68b2bae11f5d3c18e5832d80",
    "name": "Azure OpenAI",
    "createdAt": "2025-08-30T08:48:33.922Z",
    "updatedAt": "2025-08-30T08:48:33.922Z"
  }
]
```

**Error Responses:**

**401 Unauthorized:**

```json
{
  "message": "You are not authorized"
}
```

**500 Internal Server Error:**

```json
{
  "message": "Internal server error"
}
```

## Data Models

### LlmProvider

| Field       | Type              | Description                                               |
| ----------- | ----------------- | --------------------------------------------------------- |
| `id`        | string            | Unique identifier (MongoDB ObjectId)                      |
| `name`      | string            | Name of the LLM provider (e.g., "OpenAI", "Azure OpenAI") |
| `createdAt` | string (ISO 8601) | UTC timestamp when the provider was created               |
| `updatedAt` | string (ISO 8601) | UTC timestamp when the provider was last updated          |

## Usage Examples

### JavaScript/TypeScript (Fetch API)

```javascript
// Get JWT token first (from login/register response)
const token = localStorage.getItem("jwt-token");

// Fetch LLM providers
async function getLlmProviders() {
  try {
    const response = await fetch("https://localhost:7022/api/llm/providers", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const providers = await response.json();
    console.log("LLM Providers:", providers);
    return providers;
  } catch (error) {
    console.error("Error fetching LLM providers:", error);
    throw error;
  }
}
```

### Axios Example

```javascript
import axios from "axios";

// Configure axios with default headers
const api = axios.create({
  baseURL: "https://localhost:7022/api",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("jwt-token")}`,
    "Content-Type": "application/json",
  },
});

// Get LLM providers
async function getLlmProviders() {
  try {
    const response = await api.get("/llm/providers");
    return response.data;
  } catch (error) {
    console.error("Error fetching LLM providers:", error);
    throw error;
  }
}
```

### cURL Example

```bash
curl -k -X GET "https://localhost:7022/api/llm/providers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Error Handling

When implementing the frontend, make sure to handle the following scenarios:

1. **Authentication Errors (401):** Redirect user to login page
2. **Server Errors (500):** Show generic error message to user
3. **Network Errors:** Show connection error message

Example error handling:

```javascript
async function getLlmProviders() {
  try {
    const response = await fetch("https://localhost:7022/api/llm/providers", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      // Redirect to login
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Network or server error:", error);
    // Show user-friendly error message
    throw new Error("Failed to load LLM providers. Please try again.");
  }
}
```

## Notes

- The API uses HTTPS with a self-signed certificate in development
- All timestamps are in UTC format (ISO 8601)
- The MongoDB ObjectId format is used for the `id` field
- Currently, two LLM providers are seeded by default: "OpenAI" and "Azure OpenAI"
- The endpoint returns all providers without pagination (suitable for small lists)

## Testing

The endpoint has been tested and verified to work correctly:

✅ **Authentication Required:** Endpoint properly rejects unauthenticated requests  
✅ **Valid Response:** Returns properly formatted JSON array of LLM providers  
✅ **Error Handling:** Returns appropriate HTTP status codes and error messages

For testing purposes, you can register a new user at `/api/auth/register` to get a JWT token.
