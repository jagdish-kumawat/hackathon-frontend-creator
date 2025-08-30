// Agent domain types based on API documentation
export interface Agent {
  id: string;
  name: string;
  description: string;
  domain: string;
  llmProviderId: string;
  endpoint: string;
  apiKey: string;
  apiVersion?: string; // Only for Azure OpenAI
  deploymentModel: string;
  instructions: string;
  withData: boolean;
  embeddingModel?: string; // Only when withData is true
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
  apiVersion?: string; // Only for Azure OpenAI
  deploymentModel: string;
  instructions: string;
  withData: boolean;
  embeddingModel?: string; // Only when withData is true
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  domain?: string;
  llmProviderId?: string;
  endpoint?: string;
  apiKey?: string;
  apiVersion?: string; // Only for Azure OpenAI
  deploymentModel?: string;
  instructions?: string;
  withData?: boolean;
  embeddingModel?: string; // Only when withData is true
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

// Indexing-related types
export interface IndexingJob {
  id: string;
  userId: string;
  agentId: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: number;
  embeddingModel: string;
  indexName: string;
  documentSources: string[];
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIndexingJobRequest {
  agentId: string;
  embeddingModel: string;
  documentSources: string[];
  indexName?: string;
}

export interface IndexingJobStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: number;
  progress: number;
  currentDocument?: string;
  estimatedTimeRemaining?: string;
  lastUpdated: string;
}

export interface PagedIndexingJobsResponse {
  items: IndexingJob[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface IndexingFilters {
  page?: number;
  pageSize?: number;
  agentId?: string;
  status?: "pending" | "processing" | "completed" | "failed";
}
