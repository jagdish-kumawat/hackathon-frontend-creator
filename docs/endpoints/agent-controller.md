# Agent Controller API Documentation

## Overview

The Agent Controller provides full CRUD operations for managing AI agents in the system. All endpoints require JWT Bearer token authentication.

**Base URL:** `https://localhost:7022/api/agent`

## Authentication

All endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Models

### Agent Model

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "domain": "string",
  "llmProviderId": "string",
  "endpoint": "string",
  "apiKey": "string",
  "deploymentModel": "string",
  "instructions": "string",
  "withData": boolean,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Create Agent Request

```json
{
  "name": "string (required, max 100 chars)",
  "description": "string (required, max 500 chars)",
  "domain": "string (required, max 50 chars)",
  "llmProviderId": "string (required, valid ObjectId)",
  "endpoint": "string (required, valid URL)",
  "apiKey": "string (required, max 200 chars)",
  "deploymentModel": "string (required, max 100 chars)",
  "instructions": "string (required, max 2000 chars)",
  "withData": boolean
}
```

### Update Agent Request

```json
{
  "name": "string (optional, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "domain": "string (optional, max 50 chars)",
  "llmProviderId": "string (optional, valid ObjectId)",
  "endpoint": "string (optional, valid URL)",
  "apiKey": "string (optional, max 200 chars)",
  "deploymentModel": "string (optional, max 100 chars)",
  "instructions": "string (optional, max 2000 chars)",
  "withData": boolean
}
```

## Endpoints

### 1. Get All Agents (with Pagination and Filtering)

**GET** `/api/agent`

#### Query Parameters

- `page` (optional): Page number, default 1
- `pageSize` (optional): Items per page, default 10, max 100
- `domain` (optional): Filter by domain name
- `name` (optional): Search by agent name (case-insensitive contains)

#### Response

```json
{
  "items": [
    {
      "id": "68b2c252a5099a145164e366",
      "name": "Test Assistant",
      "description": "A test AI assistant",
      "domain": "General QNA",
      "llmProviderId": "68b2bae11f5d3c18e5832d80",
      "endpoint": "https://api.openai.com/v1/chat/completions",
      "apiKey": "sk-test-key-123",
      "deploymentModel": "gpt-4",
      "instructions": "You are a helpful assistant.",
      "withData": true,
      "createdAt": "2025-08-30T09:20:18.821Z",
      "updatedAt": "2025-08-30T09:20:18.821Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

#### Example Frontend Usage

```javascript
// Get all agents with pagination
const getAgents = async (
  page = 1,
  pageSize = 10,
  domain = null,
  name = null
) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("pageSize", pageSize);
  if (domain) params.append("domain", domain);
  if (name) params.append("name", name);

  const response = await fetch(`/api/agent?${params}`, {
    headers: {
      Authorization: `Bearer ${getJwtToken()}`,
    },
  });
  return await response.json();
};

// Filter by domain
const getAgentsByDomain = async (domain) => {
  return await getAgents(1, 10, domain);
};

// Search by name
const searchAgents = async (searchTerm) => {
  return await getAgents(1, 10, null, searchTerm);
};
```

### 2. Get Agent by ID

**GET** `/api/agent/{id}`

#### Response

```json
{
  "id": "68b2c252a5099a145164e366",
  "name": "Test Assistant",
  "description": "A test AI assistant",
  "domain": "General QNA",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-test-key-123",
  "deploymentModel": "gpt-4",
  "instructions": "You are a helpful assistant.",
  "withData": true,
  "createdAt": "2025-08-30T09:20:18.821Z",
  "updatedAt": "2025-08-30T09:20:18.821Z"
}
```

#### Error Responses

- **404 Not Found**: Agent not found
- **400 Bad Request**: Invalid agent ID format

#### Example Frontend Usage

```javascript
const getAgentById = async (agentId) => {
  const response = await fetch(`/api/agent/${agentId}`, {
    headers: {
      Authorization: `Bearer ${getJwtToken()}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Agent not found");
    }
    throw new Error("Failed to fetch agent");
  }

  return await response.json();
};
```

### 3. Create Agent

**POST** `/api/agent`

#### Request Body

```json
{
  "name": "My Custom Agent",
  "description": "A specialized agent for customer support",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-your-api-key",
  "deploymentModel": "gpt-4-turbo",
  "instructions": "You are a customer support specialist. Be helpful and professional.",
  "withData": false
}
```

#### Response

```json
{
  "id": "68b2c252a5099a145164e366",
  "name": "My Custom Agent",
  "description": "A specialized agent for customer support",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-your-api-key",
  "deploymentModel": "gpt-4-turbo",
  "instructions": "You are a customer support specialist. Be helpful and professional.",
  "withData": false,
  "createdAt": "2025-08-30T09:20:18.821Z",
  "updatedAt": "2025-08-30T09:20:18.821Z"
}
```

#### Error Responses

- **400 Bad Request**: Validation errors, invalid LLM provider ID
- **409 Conflict**: Agent with same name already exists

#### Example Frontend Usage

```javascript
const createAgent = async (agentData) => {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getJwtToken()}`,
    },
    body: JSON.stringify(agentData),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error("Agent with this name already exists");
    }
    throw new Error(error.message || "Failed to create agent");
  }

  return await response.json();
};
```

### 4. Update Agent

**PUT** `/api/agent/{id}`

#### Request Body

All fields are optional. Only provided fields will be updated.

```json
{
  "name": "Updated Agent Name",
  "description": "Updated description",
  "instructions": "Updated instructions for the agent"
}
```

#### Response

```json
{
  "id": "68b2c252a5099a145164e366",
  "name": "Updated Agent Name",
  "description": "Updated description",
  "domain": "General QNA",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-test-key-123",
  "deploymentModel": "gpt-4",
  "instructions": "Updated instructions for the agent",
  "withData": true,
  "createdAt": "2025-08-30T09:20:18.821Z",
  "updatedAt": "2025-08-30T09:25:37.250Z"
}
```

#### Error Responses

- **404 Not Found**: Agent not found
- **400 Bad Request**: Validation errors, invalid agent ID format
- **409 Conflict**: Agent with updated name already exists

#### Example Frontend Usage

```javascript
const updateAgent = async (agentId, updateData) => {
  const response = await fetch(`/api/agent/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getJwtToken()}`,
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) {
      throw new Error("Agent not found");
    }
    if (response.status === 409) {
      throw new Error("Agent with this name already exists");
    }
    throw new Error(error.message || "Failed to update agent");
  }

  return await response.json();
};
```

### 5. Delete Agent

**DELETE** `/api/agent/{id}`

#### Response

- **204 No Content**: Agent successfully deleted (soft delete)

#### Error Responses

- **404 Not Found**: Agent not found
- **400 Bad Request**: Invalid agent ID format

#### Example Frontend Usage

```javascript
const deleteAgent = async (agentId) => {
  const response = await fetch(`/api/agent/${agentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getJwtToken()}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Agent not found");
    }
    throw new Error("Failed to delete agent");
  }

  return true; // Success
};
```

## Complete Frontend Service Example

```javascript
class AgentService {
  constructor(baseUrl, getJwtToken) {
    this.baseUrl = baseUrl;
    this.getJwtToken = getJwtToken;
  }

  async getAgents(page = 1, pageSize = 10, filters = {}) {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("pageSize", pageSize);

    if (filters.domain) params.append("domain", filters.domain);
    if (filters.name) params.append("name", filters.name);

    const response = await fetch(`${this.baseUrl}/api/agent?${params}`, {
      headers: { Authorization: `Bearer ${this.getJwtToken()}` },
    });

    if (!response.ok) throw new Error("Failed to fetch agents");
    return await response.json();
  }

  async getAgent(id) {
    const response = await fetch(`${this.baseUrl}/api/agent/${id}`, {
      headers: { Authorization: `Bearer ${this.getJwtToken()}` },
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error("Agent not found");
      throw new Error("Failed to fetch agent");
    }

    return await response.json();
  }

  async createAgent(agentData) {
    const response = await fetch(`${this.baseUrl}/api/agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getJwtToken()}`,
      },
      body: JSON.stringify(agentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create agent");
    }

    return await response.json();
  }

  async updateAgent(id, updateData) {
    const response = await fetch(`${this.baseUrl}/api/agent/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.getJwtToken()}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update agent");
    }

    return await response.json();
  }

  async deleteAgent(id) {
    const response = await fetch(`${this.baseUrl}/api/agent/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.getJwtToken()}` },
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error("Agent not found");
      throw new Error("Failed to delete agent");
    }

    return true;
  }
}
```

## Related Endpoints

### Get LLM Providers

To get valid `llmProviderId` values for agent creation:
**GET** `/api/llm/providers`

### Get Domains

To get available domains for filtering:
**GET** `/api/domain`

## Notes

- All agents are soft-deleted, meaning they're marked as deleted but not physically removed from the database
- The `updatedAt` field is automatically updated when an agent is modified
- API key validation ensures the field is not empty but doesn't validate the actual key format
- Endpoint validation ensures it's a valid URL format
- LLM Provider ID validation ensures the referenced provider exists in the system

## Endpoints

### 1. Get All Agents (with Pagination)

**GET** `/api/agent`

Retrieves a paginated list of all agents with optional filtering.

#### Query Parameters

| Parameter  | Type    | Required | Description                      | Default |
| ---------- | ------- | -------- | -------------------------------- | ------- |
| `page`     | integer | No       | Page number (1-based)            | 1       |
| `pageSize` | integer | No       | Number of items per page (1-100) | 10      |
| `domain`   | string  | No       | Filter agents by domain name     | -       |

#### Example Requests

```bash
# Get first page with default page size
GET /api/agent

# Get page 2 with 5 items per page
GET /api/agent?page=2&pageSize=5

# Filter by domain
GET /api/agent?domain=Custom

# Combined filters
GET /api/agent?page=1&pageSize=20&domain=General%20QNA
```

#### Response

```json
{
  "items": [
    {
      "id": "68b2c252a5099a145164e366",
      "name": "Test Assistant",
      "description": "A test AI assistant for documentation",
      "domain": "Custom",
      "llmProviderId": "68b2bae11f5d3c18e5832d7f",
      "endpoint": "https://api.openai.com/v1/chat/completions",
      "apiKey": "sk-test-key-123",
      "deploymentModel": "gpt-4",
      "instructions": "You are a helpful assistant that provides accurate and concise responses.",
      "withData": true,
      "createdAt": "2025-08-30T09:20:18.821Z",
      "updatedAt": "2025-08-30T09:20:18.821Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

### 2. Get Agent by ID

**GET** `/api/agent/{id}`

Retrieves a specific agent by its ID.

#### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | string | Yes      | The MongoDB ObjectId of the agent |

#### Example Request

```bash
GET /api/agent/68b2c252a5099a145164e366
```

#### Response

```json
{
  "id": "68b2c252a5099a145164e366",
  "name": "Test Assistant",
  "description": "A test AI assistant for documentation",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d7f",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-test-key-123",
  "deploymentModel": "gpt-4",
  "instructions": "You are a helpful assistant that provides accurate and concise responses.",
  "withData": true,
  "createdAt": "2025-08-30T09:20:18.821Z",
  "updatedAt": "2025-08-30T09:20:18.821Z"
}
```

#### Error Responses

```json
{
  "message": "Agent with ID '68b2c252a5099a145164e366' not found"
}
```

### 3. Create Agent

**POST** `/api/agent`

Creates a new agent in the system.

#### Request Body

```json
{
  "name": "Customer Support Agent",
  "description": "An AI agent specialized in customer support",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d7f",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-your-openai-key",
  "deploymentModel": "gpt-4",
  "instructions": "You are a helpful customer support agent. Be polite, professional, and helpful.",
  "withData": true
}
```

#### Field Validation

| Field             | Type    | Required | Max Length | Description                             |
| ----------------- | ------- | -------- | ---------- | --------------------------------------- |
| `name`            | string  | Yes      | 100        | Unique name for the agent               |
| `description`     | string  | No       | 500        | Optional description                    |
| `domain`          | string  | Yes      | 100        | Domain category (Custom/General QNA)    |
| `llmProviderId`   | string  | Yes      | 36         | Valid LLM Provider ID                   |
| `endpoint`        | string  | Yes      | 500        | API endpoint URL                        |
| `apiKey`          | string  | Yes      | 500        | API key for the LLM service             |
| `deploymentModel` | string  | Yes      | 100        | Model name (e.g., gpt-4, gpt-3.5-turbo) |
| `instructions`    | string  | Yes      | 2000       | System instructions for the agent       |
| `withData`        | boolean | No       | -          | Whether agent uses additional data      |

#### Response (201 Created)

```json
{
  "id": "68b2c252a5099a145164e366",
  "name": "Customer Support Agent",
  "description": "An AI agent specialized in customer support",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d7f",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-your-openai-key",
  "deploymentModel": "gpt-4",
  "instructions": "You are a helpful customer support agent. Be polite, professional, and helpful.",
  "withData": true,
  "createdAt": "2025-08-30T09:20:18.821Z",
  "updatedAt": "2025-08-30T09:20:18.821Z"
}
```

#### Error Responses

```json
// Validation errors
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Name": ["The Name field is required."],
    "LlmProviderId": ["The LlmProviderId field is required."]
  }
}

// LLM Provider not found
{
  "message": "LLM Provider with ID '68b2bae11f5d3c18e5832d7f' not found"
}

// Name conflict
{
  "message": "An agent with the name 'Customer Support Agent' already exists"
}
```

### 4. Update Agent

**PUT** `/api/agent/{id}`

Updates an existing agent.

#### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | string | Yes      | The MongoDB ObjectId of the agent |

#### Request Body

Same as Create Agent request body with all fields required.

#### Response (200 OK)

```json
{
  "id": "68b2c252a5099a145164e366",
  "name": "Updated Customer Support Agent",
  "description": "An updated AI agent specialized in customer support",
  "domain": "General QNA",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-updated-key",
  "deploymentModel": "gpt-4-turbo",
  "instructions": "You are an updated helpful customer support agent.",
  "withData": false,
  "createdAt": "2025-08-30T09:20:18.821Z",
  "updatedAt": "2025-08-30T09:25:30.541Z"
}
```

#### Error Responses

```json
// Agent not found
{
  "message": "Agent with ID '68b2c252a5099a145164e366' not found"
}

// Name conflict with another agent
{
  "message": "An agent with the name 'Existing Agent Name' already exists"
}
```

### 5. Delete Agent (Soft Delete)

**DELETE** `/api/agent/{id}`

Soft deletes an agent (marks as deleted but keeps in database).

#### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | string | Yes      | The MongoDB ObjectId of the agent |

#### Response (204 No Content)

No response body on successful deletion.

#### Error Responses

```json
// Agent not found
{
  "message": "Agent with ID '68b2c252a5099a145164e366' not found"
}
```

## Data Models

### AgentResponse

| Field             | Type              | Description                          |
| ----------------- | ----------------- | ------------------------------------ |
| `id`              | string            | Unique identifier (MongoDB ObjectId) |
| `name`            | string            | Agent name                           |
| `description`     | string            | Optional description                 |
| `domain`          | string            | Domain category                      |
| `llmProviderId`   | string            | Associated LLM Provider ID           |
| `endpoint`        | string            | API endpoint URL                     |
| `apiKey`          | string            | API key for the LLM service          |
| `deploymentModel` | string            | Model name                           |
| `instructions`    | string            | System instructions                  |
| `withData`        | boolean           | Whether agent uses additional data   |
| `createdAt`       | string (ISO 8601) | UTC timestamp when created           |
| `updatedAt`       | string (ISO 8601) | UTC timestamp when last updated      |

### PagedResult

| Field        | Type    | Description                    |
| ------------ | ------- | ------------------------------ |
| `items`      | array   | Array of AgentResponse objects |
| `page`       | integer | Current page number            |
| `pageSize`   | integer | Number of items per page       |
| `totalCount` | integer | Total number of agents         |
| `totalPages` | integer | Total number of pages          |

## Usage Examples

### Frontend Integration (JavaScript/TypeScript)

```javascript
// Get all agents
const getAgents = async (page = 1, pageSize = 10, domain = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (domain) {
    params.append("domain", domain);
  }

  const response = await fetch(`/api/agent?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

// Create agent
const createAgent = async (agentData) => {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agentData),
  });

  if (!response.ok) {
    throw new Error("Failed to create agent");
  }

  return response.json();
};

// Update agent
const updateAgent = async (id, agentData) => {
  const response = await fetch(`/api/agent/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agentData),
  });

  if (!response.ok) {
    throw new Error("Failed to update agent");
  }

  return response.json();
};

// Delete agent
const deleteAgent = async (id) => {
  const response = await fetch(`/api/agent/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete agent");
  }
};
```

## Error Handling

### Common HTTP Status Codes

- **200 OK**: Successful GET/PUT request
- **201 Created**: Successful POST request
- **204 No Content**: Successful DELETE request
- **400 Bad Request**: Validation errors or invalid data
- **401 Unauthorized**: Missing or invalid authentication token
- **404 Not Found**: Agent not found
- **409 Conflict**: Name already exists
- **500 Internal Server Error**: Server error

### Error Response Format

```json
{
  "message": "Error description",
  "type": "Error type URL (for validation errors)",
  "title": "Error title",
  "status": 400,
  "errors": {
    "FieldName": ["Error message 1", "Error message 2"]
  },
  "traceId": "Request trace ID"
}
```

## Notes

1. **Soft Delete**: Deleted agents are marked as `isDeleted: true` but remain in the database
2. **Name Uniqueness**: Agent names must be unique across all non-deleted agents
3. **LLM Provider Validation**: The system validates that the specified LLM Provider exists
4. **Domain Values**: Currently supports "Custom" and "General QNA" domains
5. **Pagination**: Maximum page size is 100 items
6. **Authentication**: All endpoints require valid JWT authentication
