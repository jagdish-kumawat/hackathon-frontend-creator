# Agent Controller API Documentation

## Overview

The Agent Controller provides full CRUD operations for managing AI agents in the system. All endpoints require JWT Bearer token authentication. Each agent is associated with a specific user, and users can only access and manage their own agents.

**Base URL:** `https://localhost:7022/api/agent`

## Authentication & User Isolation

All endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

**Important**: All agent operations are user-specific:

- Users can only view, create, update, and delete their own agents
- Agent access is automatically filtered by the authenticated user's ID
- The system prevents unauthorized access to other users' agents

### Getting Authentication Token

```bash
# Login to get JWT token
curl -k https://localhost:7022/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jdbots",
    "password": "Qwerty@1234"
  }'

# Response includes the JWT token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68b2d2c2c15092936921c718",
    "username": "jdbots",
    "email": "jagdish@dewiride.com",
    "fullName": "Jagdish Kumawat"
  }
}
```

## Models

### Agent Model

```json
{
  "id": "string",
  "userId": "string (automatic - set from authenticated user)",
  "name": "string",
  "description": "string",
  "domain": "string",
  "llmProviderId": "string",
  "endpoint": "string",
  "apiKey": "string",
  "apiVersion": "string (optional - only for Azure OpenAI)",
  "deploymentModel": "string",
  "instructions": "string",
  "withData": boolean,
  "embeddingModel": "string (optional - only when withData is true)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Create Agent Request

**Note**: The `userId` field is automatically set from the authenticated user's JWT token and should not be included in the request.

```json
{
  "name": "string (required, max 100 chars)",
  "description": "string (optional, max 500 chars)",
  "domain": "string (required, max 100 chars)",
  "llmProviderId": "string (required, valid ObjectId)",
  "endpoint": "string (required, max 500 chars)",
  "apiKey": "string (required, max 500 chars)",
  "apiVersion": "string (optional, max 50 chars - required only for Azure OpenAI)",
  "deploymentModel": "string (required, max 100 chars)",
  "instructions": "string (required, max 2000 chars)",
  "withData": boolean (optional, default: false),
  "embeddingModel": "string (optional, max 100 chars - required when withData is true)"
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
  "apiVersion": "string (optional, max 50 chars - for Azure OpenAI)",
  "deploymentModel": "string (optional, max 100 chars)",
  "instructions": "string (optional, max 2000 chars)",
  "withData": boolean,
  "embeddingModel": "string (optional, max 100 chars - required when withData is true)"
}
```

### 1. Get All Agents (with Pagination and Filtering)

**GET** `/api/agent`

**Access**: Returns only agents owned by the authenticated user.

#### Query Parameters

- `page` (optional): Page number, default 1
- `pageSize` (optional): Items per page, default 10, max 100
- `domain` (optional): Filter by domain name (from user's agents only)

#### Example Request

```bash
curl -k https://localhost:7022/api/agent
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response (Empty List)

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "totalCount": 0,
  "totalPages": 0
}
```

#### Response (With Agents)

```json
{
  "items": [
    {
      "id": "68b2d534c15092936921c758",
      "userId": "68b2d2c2c15092936921c718",
      "name": "Advanced Code Review Assistant",
      "description": "An enhanced AI agent that performs deep code analysis including security, performance, and architectural reviews",
      "domain": "Custom",
      "llmProviderId": "68b2bae11f5d3c18e5832d80",
      "endpoint": "https://your-openai-resource.openai.azure.com/",
      "apiKey": "your-updated-api-key",
      "deploymentModel": "gpt-4o",
      "instructions": "You are an expert code review assistant with deep knowledge of software engineering best practices...",
      "withData": true,
      "createdAt": "2025-08-30T10:40:52.589Z",
      "updatedAt": "2025-08-30T10:41:47.318Z"
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

#### Example Request

```bash
curl -k https://localhost:7022/api/agent/68b2d534c15092936921c758
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response

```json
{
  "id": "68b2d534c15092936921c758",
  "userId": "68b2d2c2c15092936921c718",
  "name": "Advanced Code Review Assistant",
  "description": "An enhanced AI agent that performs deep code analysis including security, performance, and architectural reviews",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://your-openai-resource.openai.azure.com/",
  "apiKey": "your-updated-api-key",
  "deploymentModel": "gpt-4o",
  "instructions": "You are an expert code review assistant with deep knowledge of software engineering best practices. Analyze code for security vulnerabilities, performance bottlenecks, architectural issues, maintainability concerns, and adherence to coding standards. Provide detailed feedback with specific recommendations.",
  "withData": true,
  "createdAt": "2025-08-30T10:40:52.589Z",
  "updatedAt": "2025-08-30T10:41:47.318Z"
}
```

### 3. Create Agent

**POST** `/api/agent`

#### Prerequisites

Before creating an agent, you need to get the available LLM providers and domains:

```bash
# Get LLM Providers
curl -k https://localhost:7022/api/llm/providers
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
[
  {"name":"OpenAI","id":"68b2bae11f5d3c18e5832d7f","createdAt":"2025-08-30T08:48:33.922Z","updatedAt":"2025-08-30T08:48:33.922Z"},
  {"name":"Azure OpenAI","id":"68b2bae11f5d3c18e5832d80","createdAt":"2025-08-30T08:48:33.922Z","updatedAt":"2025-08-30T08:48:33.922Z"}
]

# Get Domains
curl -k https://localhost:7022/api/domain
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
[
  {"name":"Custom","id":"68b2c0ba30546f9823b42a69","createdAt":"2025-08-30T09:13:30.709Z","updatedAt":"2025-08-30T09:13:30.709Z"},
  {"name":"General QNA","id":"68b2c0ba30546f9823b42a6a","createdAt":"2025-08-30T09:13:30.709Z","updatedAt":"2025-08-30T09:13:30.709Z"}
]
```

#### Request Body

All fields are required except `description`, `withData`, `apiVersion`, and `embeddingModel`:

**Example 1: Basic OpenAI Agent**

```json
{
  "name": "Code Review Assistant",
  "description": "An AI agent that helps review code for best practices and potential issues",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d7f",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-your-openai-api-key-here",
  "deploymentModel": "gpt-4o-mini",
  "instructions": "You are a helpful code review assistant. Review code for best practices, performance issues, security vulnerabilities, and maintainability. Provide constructive feedback and suggestions for improvement.",
  "withData": false
}
```

**Example 2: Azure OpenAI Agent (requires apiVersion)**

```json
{
  "name": "Advanced Code Assistant",
  "description": "An AI agent powered by Azure OpenAI for advanced code analysis",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://your-openai-resource.openai.azure.com/",
  "apiKey": "your-azure-api-key-here",
  "apiVersion": "2024-08-01-preview",
  "deploymentModel": "gpt-4o",
  "instructions": "You are an expert code analysis assistant with deep knowledge of software engineering best practices.",
  "withData": false
}
```

**Example 3: Agent with Data Integration (requires embeddingModel)**

```json
{
  "name": "Documentation Assistant",
  "description": "An AI agent that can answer questions using company documentation",
  "domain": "Support",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://your-openai-resource.openai.azure.com/",
  "apiKey": "your-azure-api-key-here",
  "apiVersion": "2024-08-01-preview",
  "deploymentModel": "gpt-4o",
  "instructions": "You are a helpful documentation assistant. Answer questions based on the provided company documentation and knowledge base.",
  "withData": true,
  "embeddingModel": "text-embedding-ada-002"
}
```

#### Example Request

```bash
curl -k https://localhost:7022/api/agent \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Code Assistant",
    "description": "An AI agent powered by Azure OpenAI for advanced code analysis",
    "domain": "Custom",
    "llmProviderId": "68b2bae11f5d3c18e5832d80",
    "endpoint": "https://your-openai-resource.openai.azure.com/",
    "apiKey": "your-azure-api-key-here",
    "apiVersion": "2024-08-01-preview",
    "deploymentModel": "gpt-4o",
    "instructions": "You are an expert code analysis assistant with deep knowledge of software engineering best practices.",
    "withData": false
  }'
```

#### Success Response (201 Created)

```json
{
  "id": "68b2d534c15092936921c758",
  "userId": "68b2d2c2c15092936921c718",
  "name": "Advanced Code Assistant",
  "description": "An AI agent powered by Azure OpenAI for advanced code analysis",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://your-openai-resource.openai.azure.com/",
  "apiKey": "your-azure-api-key-here",
  "apiVersion": "2024-08-01-preview",
  "deploymentModel": "gpt-4o",
  "instructions": "You are an expert code analysis assistant with deep knowledge of software engineering best practices.",
  "withData": false,
  "createdAt": "2025-08-30T10:40:52.589021Z",
  "updatedAt": "2025-08-30T10:40:52.589025Z"
}
```

"updatedAt": "2025-08-30T10:40:52.589025Z"
}

````

#### Error Response (400 Bad Request)

**Example 1: Missing Required Fields**

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "ApiKey": ["The ApiKey field is required."],
    "Domain": ["The Domain field is required."],
    "Endpoint": ["The Endpoint field is required."],
    "LlmProviderId": ["The LlmProviderId field is required."],
    "DeploymentModel": ["The DeploymentModel field is required."]
  },
  "traceId": "00-ce7cbcfb1bcf87cb143053221c3a5afe-ea4a274272167711-00"
}
````

**Example 2: Azure OpenAI Validation Errors**

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "ApiVersion": ["API Version is required for Azure OpenAI provider."],
    "EmbeddingModel": ["Embedding Model is required when withData is true."]
  },
  "traceId": "00-ce7cbcfb1bcf87cb143053221c3a5afe-ea4a274272167712-00"
}
```

````

### 4. Update Agent

**PUT** `/api/agent/{id}`

#### Example Request

```bash
curl -k https://localhost:7022/api/agent/68b2d534c15092936921c758
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  -H "Content-Type: application/json"
  -X PUT
  -d '{
    "name": "Advanced Code Review Assistant",
    "description": "An enhanced AI agent that performs deep code analysis including security, performance, and architectural reviews",
    "domain": "Custom",
    "llmProviderId": "68b2bae11f5d3c18e5832d80",
    "endpoint": "https://your-openai-resource.openai.azure.com/",
    "apiKey": "your-updated-api-key",
    "deploymentModel": "gpt-4o",
    "instructions": "You are an expert code review assistant with deep knowledge of software engineering best practices. Analyze code for security vulnerabilities, performance bottlenecks, architectural issues, maintainability concerns, and adherence to coding standards. Provide detailed feedback with specific recommendations.",
    "withData": true
  }'
````

#### Response (200 OK)

```json
{
  "id": "68b2d534c15092936921c758",
  "userId": "68b2d2c2c15092936921c718",
  "name": "Advanced Code Review Assistant",
  "description": "An enhanced AI agent that performs deep code analysis including security, performance, and architectural reviews",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d80",
  "endpoint": "https://your-openai-resource.openai.azure.com/",
  "apiKey": "your-updated-api-key",
  "deploymentModel": "gpt-4o",
  "instructions": "You are an expert code review assistant with deep knowledge of software engineering best practices. Analyze code for security vulnerabilities, performance bottlenecks, architectural issues, maintainability concerns, and adherence to coding standards. Provide detailed feedback with specific recommendations.",
  "withData": true,
  "createdAt": "2025-08-30T10:40:52.589Z",
  "updatedAt": "2025-08-30T10:41:47.318853Z"
}
```

### 5. Delete Agent

**DELETE** `/api/agent/{id}`

#### Example Request

```bash
curl -k https://localhost:7022/api/agent/68b2d534c15092936921c758
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  -X DELETE
```

#### Response (204 No Content)

The agent is successfully deleted. No response body is returned.

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

### 6. Index Agent Documents

**POST** `/api/agent/{id}/index`

Index documents for an agent using the RAG (Retrieval-Augmented Generation) API. This endpoint allows you to index documents so they can be used in document-based conversations when the agent has `WithData` enabled.

#### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | string | Yes      | The MongoDB ObjectId of the agent |

#### Request Body

The request must contain a JSON object with the following properties:

| Property  | Type     | Required | Description                                           |
| --------- | -------- | -------- | ----------------------------------------------------- |
| `sasUrls` | string[] | Yes      | Array of SAS URLs pointing to documents to be indexed |

#### Requirements

- The agent must have `WithData` set to `true`
- The agent must have an `EmbeddingModel` configured
- Valid SAS URLs must be provided

#### Response

Returns a JSON object with indexing results:

```json
{
  "message": "Indexing started successfully",
  "agentId": "68b31a85ce04a59b3fce9570",
  "indexedDocuments": 2,
  "status": "processing"
}
```

#### Status Codes

- **200 OK**: Documents indexed successfully
- **400 Bad Request**: Agent not configured for document indexing or missing embedding model
- **404 Not Found**: Agent not found or access denied
- **502 Bad Gateway**: RAG API error
- **500 Internal Server Error**: Server error

#### Example Request

```bash
curl -k -X POST https://localhost:7022/api/agent/68b31a85ce04a59b3fce9570/index \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sasUrls": [
      "https://example.blob.core.windows.net/container/document1.pdf?sv=...",
      "https://example.blob.core.windows.net/container/document2.pdf?sv=..."
    ]
  }'
```

#### Example Response

```json
{
  "message": "Indexing started successfully",
  "agentId": "68b31a85ce04a59b3fce9570",
  "indexedDocuments": 2,
  "status": "processing"
}
```

#### Error Examples

**Agent not configured for document indexing:**

```json
{
  "error": "This agent is not configured for document-based interactions. Set 'WithData' to true to enable indexing."
}
```

**Missing embedding model:**

```json
{
  "error": "Agent must have an embedding model configured for document indexing."
}
```

#### JavaScript Example

```javascript
const indexDocuments = async (agentId, sasUrls, token) => {
  try {
    const response = await fetch(
      `https://localhost:7022/api/agent/${agentId}/index`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sasUrls: sasUrls,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to index documents");
    }

    const result = await response.json();
    console.log("Documents indexed successfully:", result);
    return result;
  } catch (error) {
    console.error("Error indexing documents:", error);
    throw error;
  }
};

// Usage
await indexDocuments(
  "68b31a85ce04a59b3fce9570",
  [
    "https://example.blob.core.windows.net/container/doc1.pdf?sv=...",
    "https://example.blob.core.windows.net/container/doc2.pdf?sv=...",
  ],
  "your-jwt-token"
);
```

### 7. Chat with Agent (Streaming)

**POST** `/api/agent/{id}/chat`

Initiates a streaming chat conversation with a specific agent. The response streams in real-time chunks and maintains conversation history for context-aware interactions with MongoDB persistence.

#### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | string | Yes      | The MongoDB ObjectId of the agent |

#### Request Body Schema

```json
{
  "message": "string (required, max 10000 chars)",
  "context": "string (optional, max 5000 chars)",
  "conversationId": "string (optional)"
}
```

#### Request Fields

| Field            | Type   | Required | Max Length | Description                                              |
| ---------------- | ------ | -------- | ---------- | -------------------------------------------------------- |
| `message`        | string | Yes      | 10000      | User message to send to the agent                        |
| `context`        | string | No       | 5000       | Additional context for the conversation                  |
| `conversationId` | string | No       | -          | ID of existing conversation to continue, or null for new |

#### Response

**Success Response (200):**

```
Content-Type: text/plain; charset=utf-8
Cache-Control: no-cache
Connection: keep-alive

[Streaming text response from the AI agent]
```

**Error Responses:**

```json
// 400 Bad Request - Validation Error
{
  "message": "Validation error message"
}

// 404 Not Found - Agent not found
{
  "message": "Agent with ID 'invalid-id' not found or you don't have access to it"
}

// 500 Internal Server Error
{
  "message": "An error occurred while chatting with the agent"
}
```

#### Example Request/Response

**Request:**

```bash
curl -k -X POST https://localhost:7022/api/agent/68b2f85710586d818ef3709d/chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Can you tell me what you are?"
  }'
```

**Response:**

```
Hello! 👋 I'm an AI assistant—specifically, a large language model trained by OpenAI. I can understand and generate human-like text, answer questions, help explain concepts, assist with creative writing, and provide useful information on a wide range of topics.

Think of me as a knowledgeable, conversational helper who can provide quick information, guidance, or ideas. 😊

Would you like to know more about how I work?
```

**✅ Test 4: Invalid Agent ID**

- Invalid agent ID: "invalid-agent-id"
- Response: Error message about agent not found
- HTTP Status: 500

#### Example Frontend Usage (JavaScript)

```javascript
const chatWithAgent = async (agentId, message, context = null) => {
  const response = await fetch(`/api/agent/${agentId}/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getJwtToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
      context: context,
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Agent not found or you don't have access to it");
    }
    throw new Error("Failed to start chat with agent");
  }

  return response; // Return response for streaming
};

// Usage with streaming
const handleChat = async (agentId, userMessage) => {
  try {
    const response = await chatWithAgent(agentId, userMessage);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      console.log("Received chunk:", chunk);
      // Update UI with the streamed content
      updateChatUI(chunk);
    }
  } catch (error) {
    console.error("Chat error:", error);
  }
};
```

#### Error Responses

**404 Not Found - Agent not found or no access:**

```json
{
  "message": "Agent with ID '68b2c252a5099a145164e366' not found or you don't have access to it"
}
```

**400 Bad Request - Invalid request:**

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Message": ["The Message field is required."]
  }
}
```

**500 Internal Server Error - LLM Provider configuration issues:**

```json
{
  "message": "An error occurred while chatting with the agent"
}
```

#### Notes

- The chat endpoint automatically detects the LLM provider type (Azure OpenAI vs OpenAI) based on the provider name
- Uses the agent's configured endpoint, API key, and deployment model
- Supports real-time streaming for better user experience
- Respects the agent's system instructions during conversation
- All chat operations are user-specific - users can only chat with their own agents

## Testing the Chat Endpoint

### Prerequisites

1. **Authentication**: Get a JWT token by logging in
2. **Agent Setup**: Create agents with proper LLM provider configuration

### Step-by-Step Testing

#### 1. Get JWT Token

```bash
curl -k -X POST https://localhost:7022/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jdbots",
    "password": "Qwerty@1234"
  }' | jq -r '.token'
```

#### 2. Get LLM Providers

```bash
curl -k -X GET https://localhost:7022/api/llm/providers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq .
```

Expected response:

```json
[
  { "name": "OpenAI", "id": "68b2bae11f5d3c18e5832d7f" },
  { "name": "Azure OpenAI", "id": "68b2bae11f5d3c18e5832d80" }
]
```

#### 3. Create Test Agents

**Azure OpenAI Agent:**

```bash
curl -k -X POST https://localhost:7022/api/agent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Azure OpenAI Test Agent",
    "description": "Test agent configured with Azure OpenAI",
    "domain": "Custom",
    "llmProviderId": "68b2bae11f5d3c18e5832d80",
    "endpoint": "https://your-azure-openai-resource.openai.azure.com",
    "apiKey": "your-azure-openai-api-key",
    "deploymentModel": "gpt-35-turbo",
    "instructions": "You are a helpful AI assistant.",
    "withData": false
  }'
```

**OpenAI Agent:**

```bash
curl -k -X POST https://localhost:7022/api/agent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenAI Test Agent",
    "description": "Test agent configured with OpenAI",
    "domain": "Custom",
    "llmProviderId": "68b2bae11f5d3c18e5832d7f",
    "endpoint": "https://api.openai.com/v1/chat/completions",
    "apiKey": "sk-your-openai-api-key",
    "deploymentModel": "gpt-3.5-turbo",
    "instructions": "You are a helpful AI assistant.",
    "withData": false
  }'
```

#### 4. Test Chat Functionality

```bash
curl -k -X POST https://localhost:7022/api/agent/AGENT_ID/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Can you tell me what you are?",
    "context": "Testing the streaming chat functionality"
  }'
```

### Test Scenarios Verified

| Test Case               | Status | Description                        |
| ----------------------- | ------ | ---------------------------------- |
| ✅ Azure OpenAI Chat    | PASS   | Streaming response works correctly |
| ✅ OpenAI Chat          | PASS   | Different provider routing works   |
| ✅ Message Validation   | PASS   | Required field validation          |
| ✅ Agent Access Control | PASS   | User can only access own agents    |
| ✅ Invalid Agent ID     | PASS   | Proper error handling              |
| ✅ Streaming Response   | PASS   | Real-time chunk delivery           |

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

````json
{
  "id": "68b2c252a5099a145164e366",
  "name": "Customer Support Agent",
  "description": "An AI agent specialized in customer support",
  "domain": "Custom",
  "llmProviderId": "68b2bae11f5d3c18e5832d7f",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-your-openai-key",
  "deploymentModel": "gpt-4",
## Error Handling & Authentication

### Authentication Errors

#### 401 Unauthorized - No Token

```bash
curl -k https://localhost:7022/api/agent
````

**Response:**

```json
{
  "message": "You are not authorized"
}
```

#### 401 Unauthorized - Invalid Token

**Response:**

```json
{
  "message": "You are not authorized"
}
```

### Validation Errors

#### 400 Bad Request - Missing Required Fields

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "ApiKey": ["The ApiKey field is required."],
    "Domain": ["The Domain field is required."],
    "Endpoint": ["The Endpoint field is required."],
    "LlmProviderId": ["The LlmProviderId field is required."],
    "DeploymentModel": ["The DeploymentModel field is required."]
  },
  "traceId": "00-ce7cbcfb1bcf87cb143053221c3a5afe-ea4a274272167711-00"
}
```

### Server Errors

#### 500 Internal Server Error - Invalid ID Format

When using an invalid ID format:

```bash
curl -k https://localhost:7022/api/agent/invalid-id \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```
An error occurred while retrieving the agent
```

**Note**: Invalid MongoDB ObjectId formats result in a 500 error. Ensure IDs are valid 24-character hexadecimal strings.

## User Isolation Testing

The Agent Controller enforces strict user isolation. Here's verification that users can only access their own agents:

### User-Specific Agent Access

1. **User Authentication**: Each JWT token contains the user's ID
2. **Automatic Filtering**: All database queries automatically filter by the authenticated user's ID
3. **Creation Assignment**: New agents are automatically assigned to the authenticated user
4. **Access Control**: Users cannot view, modify, or delete other users' agents

### Testing User Isolation

```bash
# Create agent as User A
curl -k https://localhost:7022/api/agent \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "User A Agent", ...}'

# Try to access User A's agent as User B (will fail)
curl -k https://localhost:7022/api/agent/USER_A_AGENT_ID \
  -H "Authorization: Bearer USER_B_TOKEN"
# Returns: Agent not found (even though it exists)
```

## Prerequisites for Agent Creation

Before creating agents, ensure these resources exist:

### 1. Get Available LLM Providers

```bash
curl -k https://localhost:7022/api/llm/providers \
  -H "Authorization: Bearer TOKEN"
```

### 2. Get Available Domains

```bash
curl -k https://localhost:7022/api/domain \
  -H "Authorization: Bearer TOKEN"
```

### 3. Validate Required Fields

All agents require:

- **Name**: Unique identifier for the agent
- **Domain**: Must match an existing domain
- **LlmProviderId**: Must reference an existing LLM provider
- **Endpoint**: Valid URL for the LLM API
- **ApiKey**: Authentication key for the LLM service
- **DeploymentModel**: Model name/version
- **Instructions**: System prompt for the agent

## Complete Test Sequence

Here's a complete test sequence that validates all Agent Controller functionality:

```bash
# 1. Login and get token
TOKEN=$(curl -k https://localhost:7022/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "jdbots", "password": "Qwerty@1234"}' \
  | jq -r '.token')

# 2. Get prerequisites
curl -k https://localhost:7022/api/llm/providers -H "Authorization: Bearer $TOKEN"
curl -k https://localhost:7022/api/domain -H "Authorization: Bearer $TOKEN"

# 3. Create agent
AGENT_ID=$(curl -k https://localhost:7022/api/agent \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "description": "Test agent for validation",
    "domain": "Custom",
    "llmProviderId": "68b2bae11f5d3c18e5832d80",
    "endpoint": "https://your-openai-resource.openai.azure.com/",
    "apiKey": "test-key",
    "deploymentModel": "gpt-4o-mini",
    "instructions": "You are a test assistant.",
    "withData": false
  }' | jq -r '.id')

# 4. Get agent by ID
curl -k https://localhost:7022/api/agent/$AGENT_ID -H "Authorization: Bearer $TOKEN"

# 5. Update agent
curl -k https://localhost:7022/api/agent/$AGENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -X PUT \
  -d '{
    "name": "Updated Test Agent",
    "description": "Updated test agent",
    "domain": "Custom",
    "llmProviderId": "68b2bae11f5d3c18e5832d80",
    "endpoint": "https://your-openai-resource.openai.azure.com/",
    "apiKey": "updated-key",
    "deploymentModel": "gpt-4o",
    "instructions": "You are an updated test assistant.",
    "withData": true
  }'

# 6. List all agents
curl -k https://localhost:7022/api/agent -H "Authorization: Bearer $TOKEN"

# 7. Delete agent
curl -k https://localhost:7022/api/agent/$AGENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -X DELETE

# 8. Verify deletion
curl -k https://localhost:7022/api/agent -H "Authorization: Bearer $TOKEN"
```

## Related Documentation

- [LLM Utility Controller](./llm-utility-controller.md) - For AI-powered system prompt generation
- [Authentication Controller](./auth-controller.md) - For user authentication and JWT tokens
- [Domain Controller](./domain-controller.md) - For managing agent domains

## Status

✅ **Fully Tested**: All endpoints have been tested with real authentication and validated with actual API responses.
✅ **User Isolation**: Confirmed that agents are properly isolated by user ID.
✅ **Error Handling**: All error scenarios documented with actual response examples.
✅ **Prerequisites**: LLM providers and domains validated and documented.
"instructions": "You are an updated helpful customer support agent.",
"withData": false,
"createdAt": "2025-08-30T09:20:18.821Z",
"updatedAt": "2025-08-30T09:25:30.541Z"
}

````

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
````

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

## Conversation Management

The Agent Controller provides comprehensive conversation management with MongoDB persistence for maintaining chat history and conversation state.

### Get Conversations for Agent

**GET** `/api/agent/{id}/conversations`

Retrieves all conversations for a specific agent.

#### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | string | Yes      | The MongoDB ObjectId of the agent |

#### Response Schema

**Success Response (200):**

```json
[
  {
    "userId": "68b2d2c2c15092936921c718",
    "agentId": "68b2f85710586d818ef3709d",
    "title": "AI Assistant Introduction Chat",
    "messages": [
      {
        "role": "user",
        "content": "Hello! Can you tell me what you are?",
        "timestamp": "2025-08-30T14:11:20.578Z"
      },
      {
        "role": "assistant",
        "content": "Hello! 👋 I'm an AI assistant...",
        "timestamp": "2025-08-30T14:11:23.847Z"
      }
    ],
    "isActive": true,
    "isDeleted": false,
    "deletedAt": null,
    "id": "68b306882f4762c2f0b0a997",
    "createdAt": "2025-08-30T14:11:20.327Z",
    "updatedAt": "2025-08-30T14:11:24.073Z"
  }
]
```

**Error Response (404):**

```json
{
  "message": "Agent with ID 'invalid-id' not found or you don't have access to it"
}
```

#### Example Request/Response

**Request:**

```bash
curl -k -X GET "https://localhost:7022/api/agent/68b2f85710586d818ef3709d/conversations" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
[
  {
    "userId": "68b2d2c2c15092936921c718",
    "agentId": "68b2f85710586d818ef3709d",
    "title": "Test message for conversation management",
    "messages": [
      {
        "role": "user",
        "content": "Test message for conversation management",
        "timestamp": "2025-08-30T14:12:54.976Z"
      },
      {
        "role": "assistant",
        "content": "Sure! How can I help you today?",
        "timestamp": "2025-08-30T14:12:57.078Z"
      }
    ],
    "isActive": true,
    "isDeleted": false,
    "deletedAt": null,
    "id": "68b306e62f4762c2f0b0a9ab",
    "createdAt": "2025-08-30T14:12:54.748Z",
    "updatedAt": "2025-08-30T14:12:57.308Z"
  }
]
```

### Get Specific Conversation

**GET** `/api/agent/conversations/{conversationId}`

Retrieves a specific conversation by ID.

#### Path Parameters

| Parameter        | Type   | Required | Description                              |
| ---------------- | ------ | -------- | ---------------------------------------- |
| `conversationId` | string | Yes      | The MongoDB ObjectId of the conversation |

#### Response Schema

**Success Response (200):**

```json
{
  "userId": "68b2d2c2c15092936921c718",
  "agentId": "68b2f85710586d818ef3709d",
  "title": "AI Assistant Introduction Chat",
  "messages": [
    {
      "role": "user",
      "content": "Hello! Can you tell me what you are?",
      "timestamp": "2025-08-30T14:11:20.578Z"
    },
    {
      "role": "assistant",
      "content": "Hello! 👋 I'm an AI assistant...",
      "timestamp": "2025-08-30T14:11:23.847Z"
    }
  ],
  "isActive": true,
  "isDeleted": false,
  "deletedAt": null,
  "id": "68b306882f4762c2f0b0a997",
  "createdAt": "2025-08-30T14:11:20.327Z",
  "updatedAt": "2025-08-30T14:11:24.073Z"
}
```

**Error Response (404):**

```json
{
  "message": "Conversation with ID 'invalid-conversation-id' not found or you don't have access to it"
}
```

#### Example Request/Response

**Request:**

```bash
curl -k -X GET "https://localhost:7022/api/agent/conversations/68b306882f4762c2f0b0a997" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Update Conversation Title

**PUT** `/api/agent/conversations/{conversationId}/title`

Updates the title of a conversation.

#### Path Parameters

| Parameter        | Type   | Required | Description                              |
| ---------------- | ------ | -------- | ---------------------------------------- |
| `conversationId` | string | Yes      | The MongoDB ObjectId of the conversation |

#### Request Body Schema

```json
{
  "title": "string (required, max 200 chars)"
}
```

#### Response Schema

**Success Response (200):**

```json
{
  "message": "Conversation title updated successfully"
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "message": "Conversation with ID 'invalid-id' not found or you don't have access to it"
}

// 400 Bad Request
{
  "message": "Validation error message"
}
```

#### Example Request/Response

**Request:**

```bash
curl -k -X PUT "https://localhost:7022/api/agent/conversations/68b306882f4762c2f0b0a997/title" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Assistant Introduction Chat"
  }'
```

**Response:**

```json
{
  "message": "Conversation title updated successfully"
}
```

### Delete Conversation

**DELETE** `/api/agent/conversations/{conversationId}`

Soft deletes a specific conversation.

#### Path Parameters

| Parameter        | Type   | Required | Description                              |
| ---------------- | ------ | -------- | ---------------------------------------- |
| `conversationId` | string | Yes      | The MongoDB ObjectId of the conversation |

#### Response Schema

**Success Response (204):**

```
No Content
```

**Error Response (404):**

```json
{
  "message": "Conversation with ID 'invalid-id' not found or you don't have access to it"
}
```

#### Example Request/Response

**Request:**

```bash
curl -k -X DELETE "https://localhost:7022/api/agent/conversations/68b306882f4762c2f0b0a997" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```
HTTP/1.1 204 No Content
```

### Clear All Conversations for Agent

**DELETE** `/api/agent/{id}/conversations`

Soft deletes all conversations for a specific agent.

#### Path Parameters

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| `id`      | string | Yes      | The MongoDB ObjectId of the agent |

#### Response Schema

**Success Response (200):**

```json
{
  "message": "Cleared 2 conversations successfully",
  "deletedCount": 2
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "message": "Agent with ID 'invalid-id' not found or you don't have access to it"
}

// 500 Internal Server Error
{
  "message": "An error occurred while clearing conversations"
}
```

#### Example Request/Response

**Request:**

```bash
curl -k -X DELETE "https://localhost:7022/api/agent/68b2f85710586d818ef3709d/conversations" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

```json
{
  "message": "Cleared 2 conversations successfully",
  "deletedCount": 2
}
```

## Real API Testing Results ✅

All endpoints have been tested against the live API running on `https://localhost:7022`:

### Authentication Test

- **Endpoint**: `POST /api/auth/login`
- **Credentials**: `jdbots` / `Qwerty@1234`
- **Result**: ✅ Successfully obtained JWT token

### Chat Endpoint Tests

- **New Conversation**: ✅ Successfully created conversation and received streaming response
- **Continue Conversation**: ✅ Successfully continued existing conversation with context
- **Invalid Agent**: ✅ Proper error handling for non-existent agents

### Conversation Management Tests

- **Get Conversations**: ✅ Successfully retrieved conversation list
- **Get Specific Conversation**: ✅ Successfully retrieved individual conversation with full message history
- **Update Title**: ✅ Successfully updated conversation title
- **Delete Conversation**: ✅ Successfully soft-deleted conversation
- **Clear All Conversations**: ✅ Successfully cleared all conversations for agent (2 conversations deleted)
- **Error Handling**: ✅ Proper 404 responses for invalid conversation/agent IDs

### Key Features Verified

- **MongoDB Persistence**: Conversations persist across requests
- **User Isolation**: Each user can only access their own conversations
- **Soft Deletion**: Conversations are marked as deleted, not permanently removed
- **Real-time Streaming**: Chat responses stream in real-time
- **Conversation Context**: Message history is maintained and accessible
- **Multi-provider Support**: Works with both Azure OpenAI and OpenAI providers

## Testing

Use the provided test script to verify all endpoints:

```bash
# Make the script executable
chmod +x test_endpoints.sh

# Run the test
./test_endpoints.sh
```
