import { TokenManager } from "./auth";
import {
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
  PagedAgentsResponse,
  LlmProvider,
  Domain,
  AgentFilters,
} from "@/types/agent-api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7022";

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData: { message?: string };
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        throw new Error(errorData.message || "An error occurred");
      }

      // Handle empty responses (like DELETE)
      if (response.status === 204) {
        return undefined as T;
      }

      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // Agent endpoints
  async getAgents(filters: AgentFilters = {}): Promise<PagedAgentsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.pageSize)
      params.append("pageSize", filters.pageSize.toString());
    if (filters.domain) params.append("domain", filters.domain);
    if (filters.name) params.append("name", filters.name);

    const queryString = params.toString();
    const endpoint = `/api/agent${queryString ? `?${queryString}` : ""}`;

    return this.request<PagedAgentsResponse>(endpoint);
  }

  async getAgent(id: string): Promise<Agent> {
    return this.request<Agent>(`/api/agent/${id}`);
  }

  async createAgent(data: CreateAgentRequest): Promise<Agent> {
    return this.request<Agent>("/api/agent", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAgent(id: string, data: UpdateAgentRequest): Promise<Agent> {
    return this.request<Agent>(`/api/agent/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAgent(id: string): Promise<void> {
    return this.request<void>(`/api/agent/${id}`, {
      method: "DELETE",
    });
  }

  // LLM Provider endpoints
  async getLlmProviders(): Promise<LlmProvider[]> {
    return this.request<LlmProvider[]>("/api/llm/providers");
  }

  // Domain endpoints
  async getDomains(): Promise<Domain[]> {
    return this.request<Domain[]>("/api/domain");
  }
}

export const apiClient = new ApiClient();
