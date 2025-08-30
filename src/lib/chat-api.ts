import { TokenManager } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7022";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId: string;
  title: string;
  messages: ChatMessage[];
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  message: string;
  context?: string;
  conversationId?: string;
}

export interface ChatSession {
  id: string;
  agentId: string;
  agentName: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTitleRequest {
  title: string;
}

export class ChatApiClient {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = TokenManager.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Start a streaming chat with an agent
   */
  async streamChatWithAgent(
    agentId: string,
    request: ChatRequest
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const url = `${API_BASE_URL}/api/agent/${agentId}/chat`;
    const headers = await this.getAuthHeaders();

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
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
      throw new Error(errorData.message || "Failed to start chat with agent");
    }

    if (!response.body) {
      throw new Error("No response body available for streaming");
    }

    return response.body.getReader();
  }

  /**
   * Process streaming response from chat
   */
  async processStreamingResponse(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
      }
    } catch (error) {
      onError(
        error instanceof Error ? error : new Error("Stream processing failed")
      );
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Send a message and get complete streaming response
   */
  async chatWithAgent(
    agentId: string,
    message: string,
    context?: string,
    conversationId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const reader = await this.streamChatWithAgent(agentId, {
          message,
          context,
          conversationId,
        });

        let fullResponse = "";

        await this.processStreamingResponse(
          reader,
          (chunk) => {
            fullResponse += chunk;
            onChunk?.(chunk);
          },
          () => {
            resolve(fullResponse);
          },
          (error) => {
            reject(error);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get all conversations for an agent
   */
  async getConversationsForAgent(agentId: string): Promise<Conversation[]> {
    const url = `${API_BASE_URL}/api/agent/${agentId}/conversations`;
    const headers = await this.getAuthHeaders();

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || "Failed to fetch conversations");
    }

    return response.json();
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const url = `${API_BASE_URL}/api/agent/conversations/${conversationId}`;
    const headers = await this.getAuthHeaders();

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || "Failed to fetch conversation");
    }

    return response.json();
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(
    conversationId: string,
    title: string
  ): Promise<void> {
    const url = `${API_BASE_URL}/api/agent/conversations/${conversationId}/title`;
    const headers = await this.getAuthHeaders();

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(
        errorData.message || "Failed to update conversation title"
      );
    }
  }

  /**
   * Delete a specific conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const url = `${API_BASE_URL}/api/agent/conversations/${conversationId}`;
    const headers = await this.getAuthHeaders();

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || "Failed to delete conversation");
    }
  }

  /**
   * Clear all conversations for an agent
   */
  async clearAllConversations(
    agentId: string
  ): Promise<{ message: string; deletedCount: number }> {
    const url = `${API_BASE_URL}/api/agent/${agentId}/conversations`;
    const headers = await this.getAuthHeaders();

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || "Failed to clear conversations");
    }

    return response.json();
  }
}

export const chatApi = new ChatApiClient();
