# LLM Utility Controller

## Overview

The LLM Utility Controller provides AI-powered system prompt generation capabilities using Azure OpenAI. It helps create comprehensive instructions for AI agents based on their name, domain, and optional description.

**Base URL:** `https://localhost:7022/api/chat`
**Endpoint:** `POST /instruction`

## Features

- **Authentication Required**: All operations require valid JWT authentication
- **Streaming Response**: Real-time text streaming for immediate feedback
- **Azure OpenAI Integration**: Powered by GPT models for high-quality instruction generation
- **Flexible Input**: Accepts agent name, domain, and optional description
- **Error Handling**: Robust error handling with appropriate HTTP status codes
- **Request Validation**: Comprehensive input validation with detailed error messages

## Endpoint

### POST `/api/chat/instruction`

Generates system prompt/instructions for an AI agent with streaming response.

**Full URL:** `https://localhost:7022/api/chat/instruction`

#### Request Body

```json
{
  "agentName": "string (required, 1-100 chars)",
  "domain": "string (required, 1-100 chars)",
  "description": "string (optional, max 500 chars)"
}
```

#### Parameters

- **agentName**: The name/role of the AI agent (e.g., "Customer Support Agent", "Sales Assistant")
- **domain**: The business domain or industry (e.g., "E-commerce", "Healthcare", "Finance")
- **description**: Optional additional context about the agent's specific responsibilities

#### Response

- **Content-Type**: `text/plain; charset=utf-8`
- **Streaming**: Yes (real-time text streaming)
- **Format**: Raw text streamed in real-time
- **Headers**:
  - `Cache-Control: no-cache`
  - `Connection: keep-alive`

#### Example Request

```http
POST https://localhost:7022/api/chat/instruction
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "agentName": "Customer Support Agent",
  "domain": "E-commerce",
  "description": "Handles customer inquiries about orders, returns, and product information"
}
```

#### Example Response

```
Below is a **comprehensive system prompt** tailored specifically for your **Customer Support Agent (E-commerce)**.
It contains **role definition**, **responsibilities**, **tone guidelines**, **interaction patterns**,
**domain-specific knowledge**, and more—designed to serve as a complete behavioral and operational guide for the AI.

---

## **System Prompt for AI – Customer Support Agent (E-commerce)**

**Agent Name:** Customer Support Agent
**Domain/Field:** E-commerce
**Primary Purpose:** Handle customer inquiries regarding orders, returns, and product information...

[Content continues streaming in real-time]
```

## Configuration

### Azure OpenAI Settings

Configure the following in your `appsettings.json`:

```json
{
  "AzureOpenAI": {
    "Endpoint": "https://your-openai-resource.openai.azure.com/",
    "ApiKey": "your-api-key-here",
    "DeploymentName": "your-gpt-deployment-name",
    "ApiVersion": "2024-08-01-preview"
  }
}
```

### Environment Variables (Recommended for Production)

```bash
AZURE_OPENAI_ENDPOINT=https://your-openai-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=your-gpt-deployment-name
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

## Dependencies

- **Azure.AI.OpenAI**: Version 2.3.0-beta.2
- **ASP.NET Core**: 9.0
- **Azure.Core**: For authentication

## Error Handling

### HTTP Status Codes

- **200 OK**: Successful instruction generation with streaming response
- **400 Bad Request**: Invalid request format or missing required fields
- **401 Unauthorized**: Missing or invalid JWT authentication token
- **500 Internal Server Error**: Azure OpenAI service errors or configuration issues
- **503 Service Unavailable**: Azure OpenAI service temporarily unavailable

### Error Response Examples

#### 400 Bad Request - Validation Errors

```http
HTTP/2 400
Content-Type: application/problem+json; charset=utf-8

{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Domain": [
      "The Domain field is required.",
      "The field Domain must be a string with a minimum length of 1 and a maximum length of 100."
    ],
    "AgentName": [
      "The AgentName field is required.",
      "The field AgentName must be a string with a minimum length of 1 and a maximum length of 100."
    ]
  },
  "traceId": "00-72a8c0efcc8dfe5088fee0874c8f93dc-bc635f5df3c0bb92-00"
}
```

#### 401 Unauthorized - Invalid Token

```http
HTTP/2 401
Content-Type: application/problem+json; charset=utf-8

{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401,
  "detail": "The request requires a valid access token."
}
```

## Authentication

### Requirements

- **JWT Token**: All requests require a valid JWT authentication token
- **Authorization Header**: Include `Authorization: Bearer <token>` in request headers

### Getting a JWT Token

1. **Login to get JWT token:**

```http
POST https://localhost:7022/api/auth/login
Content-Type: application/json

{
  "username": "jdbots",
  "password": "Qwerty@1234"
}
```

2. **Response contains the token:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "4IylF7+b7Lkg004wd/xUm4...",
  "expiresAt": "2025-08-31T10:31:17.767196Z",
  "user": {
    "id": "68b2d2c2c15092936921c718",
    "username": "jdbots",
    "email": "jagdish@dewiride.com",
    "firstName": "Jagdish",
    "lastName": "Kumawat",
    "fullName": "Jagdish Kumawat",
    "roles": ["Admin", "User"]
  }
}
```

3. **Use the token in subsequent requests:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Demo Credentials

For testing purposes, use the seeded admin user:

- **Username**: `jdbots`
- **Password**: `Qwerty@1234`

**⚠️ Security Note**: Change default passwords in production environments!

## Usage Examples

### Authentication Required

All examples below require a valid JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Basic Usage

```http
POST /api/llmutility/chat/instruction
{
  "agentName": "Sales Assistant",
  "domain": "Technology"
}
```

### With Description

```http
POST /api/llmutility/chat/instruction
{
  "agentName": "Technical Support Specialist",
  "domain": "Software Development",
  "description": "Provides debugging assistance and code review for development teams"
}
```

## Implementation Details

### Service Architecture

- **IAzureOpenAIService**: Interface for Azure OpenAI operations
- **AzureOpenAIService**: Implementation with streaming capabilities
- **LlmUtilityController**: HTTP endpoint controller
- **AzureOpenAISettings**: Configuration model

### Streaming Implementation

The endpoint uses `IAsyncEnumerable<string>` to provide real-time streaming of generated content, allowing clients to display results as they're generated rather than waiting for the complete response.

### Security Considerations

- **JWT Authentication**: All requests require valid JWT tokens
- **API Key Protection**: Azure OpenAI keys are stored securely in configuration/environment variables
- **No Sensitive Data Logging**: Tokens and API keys are never logged in plain text
- **Request Validation**: Input validation prevents injection attacks
- **Rate Limiting**: Should be implemented at the infrastructure level

## Testing

### Complete Testing Example

#### 1. Login to get JWT token

```bash
curl -k https://localhost:7022/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "jdbots", "password": "Qwerty@1234"}'
```

#### 2. Extract token from response and test the endpoint

```bash
curl -k https://localhost:7022/api/chat/instruction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "agentName": "Customer Support Agent",
    "domain": "E-commerce",
    "description": "Handles customer inquiries about orders, returns, and product information"
  }'
```

#### 3. Test with invalid request (should return 400)

```bash
curl -k https://localhost:7022/api/chat/instruction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"invalidField": "test"}'
```

#### 4. Test with invalid token (should return 401)

```bash
curl -k https://localhost:7022/api/chat/instruction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{
    "agentName": "Test Agent",
    "domain": "Test Domain"
  }'
```

### Expected Results

- ✅ **Login**: Returns JWT token and user information
- ✅ **Valid Request**: Streams comprehensive AI-generated instructions in real-time
- ✅ **Invalid Request**: Returns 400 with detailed validation errors
- ✅ **Invalid Token**: Returns 401 unauthorized

### Alternative Testing

Use the provided HTTP file (`Hackathon.Api.http`) in VS Code with the REST Client extension, or integrate with any HTTP client that supports streaming responses.
