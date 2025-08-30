import {
  IndexingJob,
  CreateIndexingJobRequest,
  PagedIndexingJobsResponse,
  IndexingJobStatus,
  IndexingFilters,
} from "@/types/agent-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7022";

class IndexingApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        error || `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.json();
  }

  async getIndexingJobs(
    filters?: IndexingFilters
  ): Promise<PagedIndexingJobsResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.pageSize)
      params.append("pageSize", filters.pageSize.toString());
    if (filters?.agentId) params.append("agentId", filters.agentId);
    if (filters?.status) params.append("status", filters.status);

    const url = `${BASE_URL}/api/indexing${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PagedIndexingJobsResponse>(response);
  }

  async getIndexingJobById(id: string): Promise<IndexingJob> {
    const response = await fetch(`${BASE_URL}/api/indexing/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<IndexingJob>(response);
  }

  async createIndexingJob(
    data: CreateIndexingJobRequest
  ): Promise<IndexingJob> {
    const response = await fetch(`${BASE_URL}/api/indexing`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<IndexingJob>(response);
  }

  async deleteIndexingJob(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/indexing/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        error || `HTTP ${response.status}: ${response.statusText}`
      );
    }
  }

  async getIndexingJobStatus(id: string): Promise<IndexingJobStatus> {
    const response = await fetch(`${BASE_URL}/api/indexing/${id}/status`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<IndexingJobStatus>(response);
  }

  // Helper method to poll for status updates
  async *pollIndexingStatus(
    id: string,
    intervalMs: number = 5000
  ): AsyncGenerator<IndexingJobStatus, void, unknown> {
    while (true) {
      try {
        const status = await this.getIndexingJobStatus(id);
        yield status;

        // Stop polling if the job is completed or failed
        if (status.status === "completed" || status.status === "failed") {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error("Error polling indexing status:", error);
        throw error;
      }
    }
  }
}

export const indexingApiClient = new IndexingApiClient();
