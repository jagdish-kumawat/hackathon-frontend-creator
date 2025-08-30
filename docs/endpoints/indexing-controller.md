# Indexing Controller API Documentation

## Overview

The Indexing Controller provides operations for managing document indexing in the system. All endpoints require JWT Bearer token authentication. Each indexing operation is associated with a specific user, and users can only access and manage their own indexing operations.

**Base URL:** `https://localhost:7022/api/indexing`

## Authentication & User Isolation

All endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

**Important**: All indexing operations are user-specific:

- Users can only create, view, and manage their own indexing operations
- Indexing access is automatically filtered by the authenticated user's ID
- The system prevents unauthorized access to other users' indexing data

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

### IndexingJob Model

```json
{
  "id": "string",
  "userId": "string (automatic - set from authenticated user)",
  "agentId": "string",
  "status": "pending | processing | completed | failed",
  "totalDocuments": "number",
  "processedDocuments": "number",
  "failedDocuments": "number",
  "embeddingModel": "string",
  "indexName": "string",
  "documentSources": ["string"],
  "startedAt": "datetime",
  "completedAt": "datetime (optional)",
  "errorMessage": "string (optional)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Create Indexing Job Request

**Note**: The `userId` field is automatically set from the authenticated user's JWT token and should not be included in the request.

```json
{
  "agentId": "string (required, valid ObjectId)",
  "embeddingModel": "string (required, max 100 chars)",
  "documentSources": ["string"] (required, array of file paths or URLs),
  "indexName": "string (optional, auto-generated if not provided)"
}
```

### IndexingJob Response

```json
{
  "id": "string",
  "userId": "string",
  "agentId": "string",
  "status": "string",
  "totalDocuments": "number",
  "processedDocuments": "number",
  "failedDocuments": "number",
  "embeddingModel": "string",
  "indexName": "string",
  "documentSources": ["string"],
  "startedAt": "datetime",
  "completedAt": "datetime",
  "errorMessage": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Endpoints

### 1. Get All Indexing Jobs (with Pagination and Filtering)

**GET** `/api/indexing`

**Access**: Returns only indexing jobs owned by the authenticated user.

#### Query Parameters

- `page` (optional): Page number, default 1
- `pageSize` (optional): Items per page, default 10, max 100
- `agentId` (optional): Filter by agent ID (from user's agents only)
- `status` (optional): Filter by status (pending, processing, completed, failed)

#### Example Request

```bash
curl -k https://localhost:7022/api/indexing \
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

#### Response (With Jobs)

```json
{
  "items": [
    {
      "id": "68b2d534c15092936921c759",
      "userId": "68b2d2c2c15092936921c718",
      "agentId": "68b2d534c15092936921c758",
      "status": "completed",
      "totalDocuments": 15,
      "processedDocuments": 15,
      "failedDocuments": 0,
      "embeddingModel": "text-embedding-ada-002",
      "indexName": "agent-docs-index-20250830",
      "documentSources": [
        "/uploads/document1.pdf",
        "/uploads/document2.docx",
        "/uploads/document3.txt"
      ],
      "startedAt": "2025-08-30T10:45:00.000Z",
      "completedAt": "2025-08-30T10:47:30.000Z",
      "errorMessage": null,
      "createdAt": "2025-08-30T10:45:00.000Z",
      "updatedAt": "2025-08-30T10:47:30.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

### 2. Get Indexing Job by ID

**GET** `/api/indexing/{id}`

#### Example Request

```bash
curl -k https://localhost:7022/api/indexing/68b2d534c15092936921c759 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response

```json
{
  "id": "68b2d534c15092936921c759",
  "userId": "68b2d2c2c15092936921c718",
  "agentId": "68b2d534c15092936921c758",
  "status": "completed",
  "totalDocuments": 15,
  "processedDocuments": 15,
  "failedDocuments": 0,
  "embeddingModel": "text-embedding-ada-002",
  "indexName": "agent-docs-index-20250830",
  "documentSources": [
    "/uploads/document1.pdf",
    "/uploads/document2.docx",
    "/uploads/document3.txt"
  ],
  "startedAt": "2025-08-30T10:45:00.000Z",
  "completedAt": "2025-08-30T10:47:30.000Z",
  "errorMessage": null,
  "createdAt": "2025-08-30T10:45:00.000Z",
  "updatedAt": "2025-08-30T10:47:30.000Z"
}
```

### 3. Create Indexing Job

**POST** `/api/indexing`

#### Prerequisites

Before creating an indexing job, ensure you have:

1. A valid agent ID (from agents that belong to the authenticated user)
2. Document sources (uploaded files or accessible URLs)
3. An appropriate embedding model name

#### Request Body

```json
{
  "agentId": "68b2d534c15092936921c758",
  "embeddingModel": "text-embedding-ada-002",
  "documentSources": [
    "/uploads/user-manual.pdf",
    "/uploads/product-specs.docx",
    "/uploads/faq.txt"
  ],
  "indexName": "custom-agent-knowledge-base"
}
```

#### Example Request

```bash
curl -k https://localhost:7022/api/indexing \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "68b2d534c15092936921c758",
    "embeddingModel": "text-embedding-ada-002",
    "documentSources": [
      "/uploads/user-manual.pdf",
      "/uploads/product-specs.docx",
      "/uploads/faq.txt"
    ],
    "indexName": "custom-agent-knowledge-base"
  }'
```

#### Success Response (201 Created)

```json
{
  "id": "68b2d534c15092936921c759",
  "userId": "68b2d2c2c15092936921c718",
  "agentId": "68b2d534c15092936921c758",
  "status": "pending",
  "totalDocuments": 3,
  "processedDocuments": 0,
  "failedDocuments": 0,
  "embeddingModel": "text-embedding-ada-002",
  "indexName": "custom-agent-knowledge-base",
  "documentSources": [
    "/uploads/user-manual.pdf",
    "/uploads/product-specs.docx",
    "/uploads/faq.txt"
  ],
  "startedAt": null,
  "completedAt": null,
  "errorMessage": null,
  "createdAt": "2025-08-30T10:50:00.000Z",
  "updatedAt": "2025-08-30T10:50:00.000Z"
}
```

#### Error Response (400 Bad Request)

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "AgentId": ["The AgentId field is required."],
    "EmbeddingModel": ["The EmbeddingModel field is required."],
    "DocumentSources": ["At least one document source is required."]
  },
  "traceId": "00-ce7cbcfb1bcf87cb143053221c3a5afe-ea4a274272167711-00"
}
```

### 4. Delete Indexing Job

**DELETE** `/api/indexing/{id}`

**Note**: This will stop any active indexing process and remove the job record. The indexed documents may remain in the vector store depending on implementation.

#### Example Request

```bash
curl -k https://localhost:7022/api/indexing/68b2d534c15092936921c759 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -X DELETE
```

#### Response (204 No Content)

The indexing job is successfully deleted. No response body is returned.

### 5. Get Indexing Job Status

**GET** `/api/indexing/{id}/status`

This endpoint provides real-time status updates for active indexing jobs.

#### Example Request

```bash
curl -k https://localhost:7022/api/indexing/68b2d534c15092936921c759/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response

```json
{
  "id": "68b2d534c15092936921c759",
  "status": "processing",
  "totalDocuments": 15,
  "processedDocuments": 8,
  "failedDocuments": 1,
  "progress": 53.33,
  "currentDocument": "/uploads/technical-manual.pdf",
  "estimatedTimeRemaining": "00:03:45",
  "lastUpdated": "2025-08-30T10:46:15.000Z"
}
```

## Status Values

- **pending**: Job created but not yet started
- **processing**: Currently indexing documents
- **completed**: All documents processed successfully
- **failed**: Job failed due to an error

## Common Embedding Models

- `text-embedding-ada-002` (OpenAI)
- `text-embedding-3-small` (OpenAI)
- `text-embedding-3-large` (OpenAI)
- Custom embedding models supported by the LLM provider

## Error Responses

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: User doesn't have access to the specified agent
- **404 Not Found**: Indexing job not found
- **400 Bad Request**: Invalid request data or validation errors
- **409 Conflict**: Indexing job already exists for the agent with the same index name

## Frontend Integration Example

```javascript
// Create a new indexing job
const createIndexingJob = async (jobData) => {
  const response = await fetch("/api/indexing", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getJwtToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    throw new Error("Failed to create indexing job");
  }

  return response.json();
};

// Poll for status updates
const pollIndexingStatus = async (jobId) => {
  const response = await fetch(`/api/indexing/${jobId}/status`, {
    headers: {
      Authorization: `Bearer ${getJwtToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get indexing status");
  }

  return response.json();
};
```

## Best Practices

1. **Document Sources**: Ensure all document sources are accessible and properly formatted
2. **Embedding Models**: Choose appropriate embedding models based on your LLM provider and use case
3. **Index Names**: Use descriptive, unique index names to avoid conflicts
4. **Polling**: Poll status endpoints reasonably (every 5-10 seconds) to avoid overwhelming the server
5. **Error Handling**: Implement proper error handling for failed indexing jobs
6. **Cleanup**: Consider deleting completed jobs periodically to manage storage
