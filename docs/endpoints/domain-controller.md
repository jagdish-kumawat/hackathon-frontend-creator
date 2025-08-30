# Domain Controller API Documentation

## Overview

The Domain Controller provides read-only access to predefined domain categories for organizing agents. This is a simple list endpoint that returns all available domains.

**Base URL:** `https://localhost:7022/api/domain`

## Authentication

All endpoints require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Models

### Domain Model

```json
{
  "id": "string",
  "name": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Endpoints

### Get All Domains

**GET** `/api/domain`

Returns a list of all available domains that can be used when creating or filtering agents.

#### Response

```json
[
  {
    "id": "68b2c0ba30546f9823b42a69",
    "name": "Custom",
    "createdAt": "2025-08-30T09:15:38.673Z",
    "updatedAt": "2025-08-30T09:15:38.673Z"
  },
  {
    "id": "68b2c0ba30546f9823b42a6a",
    "name": "General QNA",
    "createdAt": "2025-08-30T09:15:38.673Z",
    "updatedAt": "2025-08-30T09:15:38.673Z"
  }
]
```

#### Error Responses

- **401 Unauthorized**: Missing or invalid JWT token

#### Example Frontend Usage

```javascript
const getDomains = async () => {
  const response = await fetch("/api/domain", {
    headers: {
      Authorization: `Bearer ${getJwtToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch domains");
  }

  return await response.json();
};
```

## Frontend Integration Examples

### React Hook for Domains

```javascript
import { useState, useEffect } from "react";

export const useDomains = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/domain", {
          headers: {
            Authorization: `Bearer ${getJwtToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch domains");
        }

        const domainsData = await response.json();
        setDomains(domainsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  return { domains, loading, error };
};
```

### Domain Dropdown Component

```javascript
import React from "react";
import { useDomains } from "./useDomains";

export const DomainSelect = ({ value, onChange, name = "domain" }) => {
  const { domains, loading, error } = useDomains();

  if (loading) return <div>Loading domains...</div>;
  if (error) return <div>Error loading domains: {error}</div>;

  return (
    <select
      name={name}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="form-select"
    >
      <option value="">Select a domain...</option>
      {domains.map((domain) => (
        <option key={domain.id} value={domain.name}>
          {domain.name}
        </option>
      ))}
    </select>
  );
};
```

### Domain Service Class

```javascript
class DomainService {
  constructor(baseUrl, getJwtToken) {
    this.baseUrl = baseUrl;
    this.getJwtToken = getJwtToken;
  }

  async getDomains() {
    const response = await fetch(`${this.baseUrl}/api/domain`, {
      headers: {
        Authorization: `Bearer ${this.getJwtToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch domains");
    }

    return await response.json();
  }

  async getDomainNames() {
    const domains = await this.getDomains();
    return domains.map((domain) => domain.name);
  }

  async getDomainById(id) {
    const domains = await this.getDomains();
    return domains.find((domain) => domain.id === id);
  }

  async getDomainByName(name) {
    const domains = await this.getDomains();
    return domains.find((domain) => domain.name === name);
  }
}
```

### Agent Form with Domain Selection

```javascript
import React, { useState } from "react";
import { DomainSelect } from "./DomainSelect";

export const AgentForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    domain: "",
    llmProviderId: "",
    endpoint: "",
    apiKey: "",
    deploymentModel: "",
    instructions: "",
    withData: false,
    ...initialData,
  });

  const handleDomainChange = (domain) => {
    setFormData((prev) => ({ ...prev, domain }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          required
          maxLength={500}
        />
      </div>

      <div className="form-group">
        <label htmlFor="domain">Domain:</label>
        <DomainSelect
          value={formData.domain}
          onChange={handleDomainChange}
          name="domain"
        />
      </div>

      {/* Other form fields... */}

      <button type="submit">Save Agent</button>
    </form>
  );
};
```

### Filter Agents by Domain

```javascript
import React, { useState, useEffect } from "react";
import { useDomains } from "./useDomains";

export const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const { domains } = useDomains();

  const fetchAgents = async (domain = null) => {
    const params = new URLSearchParams();
    if (domain) params.append("domain", domain);

    const response = await fetch(`/api/agent?${params}`, {
      headers: {
        Authorization: `Bearer ${getJwtToken()}`,
      },
    });

    const data = await response.json();
    setAgents(data.items);
  };

  useEffect(() => {
    fetchAgents(selectedDomain);
  }, [selectedDomain]);

  return (
    <div>
      <div className="filter-section">
        <label>Filter by Domain:</label>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          <option value="">All Domains</option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.name}>
              {domain.name}
            </option>
          ))}
        </select>
      </div>

      <div className="agents-list">
        {agents.map((agent) => (
          <div key={agent.id} className="agent-card">
            <h3>{agent.name}</h3>
            <p>{agent.description}</p>
            <span className="domain-badge">{agent.domain}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Available Domains

Currently, the system includes these predefined domains:

1. **Custom**: For user-defined specialized agents
2. **General QNA**: For general question-and-answer agents

## Usage Notes

- Domains are seeded automatically when the application starts
- The domain list is read-only - new domains can only be added through data seeding in the backend
- Domain names are used as string values when creating or filtering agents
- Domain filtering in the Agent Controller uses exact string matching (case-sensitive)
- It's recommended to cache the domain list in your frontend application since it rarely changes

## Related Endpoints

### Use domains with Agent Controller

- **Create Agent**: Use domain name in the `domain` field when creating an agent via `POST /api/agent`
- **Filter Agents**: Use domain name in the `domain` query parameter when listing agents via `GET /api/agent?domain=Custom`
- **Update Agent**: Use domain name in the `domain` field when updating an agent via `PUT /api/agent/{id}`

```json
// Unauthorized
{
  "message": "You are not authorized"
}

// Server error
{
  "message": "An error occurred while retrieving domains"
}
```

## Data Models

### Domain

| Field       | Type              | Description                                    |
| ----------- | ----------------- | ---------------------------------------------- |
| `id`        | string            | Unique identifier (MongoDB ObjectId)           |
| `name`      | string            | Domain name (e.g., "Custom", "General QNA")    |
| `createdAt` | string (ISO 8601) | UTC timestamp when the domain was created      |
| `updatedAt` | string (ISO 8601) | UTC timestamp when the domain was last updated |

## Usage Examples

### Frontend Integration (JavaScript/TypeScript)

```javascript
// Get all domains
const getDomains = async () => {
  try {
    const response = await fetch("/api/domain", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch domains");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching domains:", error);
    throw error;
  }
};

// Usage example for populating a dropdown
const populateDomainDropdown = async () => {
  try {
    const domains = await getDomains();
    const selectElement = document.getElementById("domain-select");

    // Clear existing options
    selectElement.innerHTML = '<option value="">Select a domain</option>';

    // Add domain options
    domains.forEach((domain) => {
      const option = document.createElement("option");
      option.value = domain.name;
      option.textContent = domain.name;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to populate domain dropdown:", error);
  }
};

// React Hook example
import { useState, useEffect } from "react";

const useDomains = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        const data = await getDomains();
        setDomains(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  return { domains, loading, error };
};

// Vue.js Composition API example
import { ref, onMounted } from "vue";

export function useDomains() {
  const domains = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const fetchDomains = async () => {
    try {
      loading.value = true;
      const data = await getDomains();
      domains.value = data;
      error.value = null;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchDomains);

  return {
    domains,
    loading,
    error,
    refetch: fetchDomains,
  };
}
```

### cURL Examples

```bash
# Get all domains
curl -k -X GET "https://localhost:7022/api/domain" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Pretty print the JSON response
curl -k -s "https://localhost:7022/api/domain" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq .
```

## Error Handling

### Common HTTP Status Codes

- **200 OK**: Successful request
- **401 Unauthorized**: Missing or invalid authentication token
- **500 Internal Server Error**: Server error

### Error Response Format

```json
{
  "message": "Error description"
}
```

## Integration with Agent Controller

The domain names returned by this endpoint can be used when creating or updating agents through the Agent Controller:

```javascript
// Example: Create an agent form with domain dropdown
const createAgentForm = async (formData) => {
  // Get available domains
  const domains = await getDomains();

  // Validate that the selected domain exists
  const selectedDomain = formData.domain;
  const validDomain = domains.find((d) => d.name === selectedDomain);

  if (!validDomain) {
    throw new Error(`Invalid domain: ${selectedDomain}`);
  }

  // Create the agent with validated domain
  const agentData = {
    name: formData.name,
    description: formData.description,
    domain: selectedDomain, // Use the domain name, not ID
    llmProviderId: formData.llmProviderId,
    endpoint: formData.endpoint,
    apiKey: formData.apiKey,
    deploymentModel: formData.deploymentModel,
    instructions: formData.instructions,
    withData: formData.withData,
  };

  return createAgent(agentData);
};
```

## Seeded Data

The system comes pre-seeded with the following domains:

1. **Custom**: For user-defined or specialized use cases
2. **General QNA**: For general question and answer scenarios

### Custom Domain Behavior

When a user selects "Custom" as the domain, your frontend should provide an option for the user to specify a custom domain name. However, note that the Agent Controller expects the domain field to be a string value, so you would use the custom name directly rather than "Custom".

Example:

```javascript
const handleDomainSelection = (selectedDomain) => {
  if (selectedDomain === "Custom") {
    // Show custom domain input field
    setShowCustomDomainInput(true);
  } else {
    // Use the selected domain directly
    setShowCustomDomainInput(false);
    setAgentDomain(selectedDomain);
  }
};

const handleCustomDomainInput = (customDomainName) => {
  // Use the custom domain name for the agent
  setAgentDomain(customDomainName);
};
```

## Notes

1. **Read-Only**: This controller only provides read access to domains
2. **No Pagination**: All domains are returned in a single request (the list is expected to be small)
3. **Seeded Data**: Domains are automatically seeded when the application starts
4. **Domain Names**: Use the `name` field (not `id`) when creating/updating agents
5. **Case Sensitivity**: Domain names are case-sensitive
6. **Custom Domains**: While "Custom" is a seeded domain, users can specify any domain name when creating agents

## Testing

Test the domain endpoint:

```bash
# Set your JWT token
TOKEN="your_jwt_token_here"

# Test the endpoint
curl -k -s "https://localhost:7022/api/domain" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Expected output:
# [
#   {
#     "name": "Custom",
#     "id": "...",
#     "createdAt": "...",
#     "updatedAt": "..."
#   },
#   {
#     "name": "General QNA",
#     "id": "...",
#     "createdAt": "...",
#     "updatedAt": "..."
#   }
# ]
```
