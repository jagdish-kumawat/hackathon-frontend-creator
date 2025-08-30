// Agent domain types based on API documentation
export interface Agent {
  id: string;
  name: string;
  description: string;
  domain: string;
  llmProviderId: string;
  endpoint: string;
  apiKey: string;
  deploymentModel: string;
  instructions: string;
  withData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  domain: string;
  llmProviderId: string;
  endpoint: string;
  apiKey: string;
  deploymentModel: string;
  instructions: string;
  withData: boolean;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  domain?: string;
  llmProviderId?: string;
  endpoint?: string;
  apiKey?: string;
  deploymentModel?: string;
  instructions?: string;
  withData?: boolean;
}

export interface PagedAgentsResponse {
  items: Agent[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface LlmProvider {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Domain {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentFilters {
  page?: number;
  pageSize?: number;
  domain?: string;
  name?: string;
}
