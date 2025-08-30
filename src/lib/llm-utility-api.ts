import { TokenManager } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7022";

export interface GenerateInstructionRequest {
  agentName: string;
  domain: string;
  description?: string;
}

export class LlmUtilityApiClient {
  /**
   * Generate AI instructions using streaming response
   * @param request The instruction generation request
   * @returns AsyncGenerator that yields chunks of the generated instructions
   */
  async *generateInstructions(
    request: GenerateInstructionRequest
  ): AsyncGenerator<string, void, unknown> {
    const url = `${API_BASE_URL}/api/chat/instruction`;
    const token = TokenManager.getToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let errorData: { message?: string; detail?: string };
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        throw new Error(
          errorData.detail || errorData.message || "An error occurred"
        );
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            yield chunk;
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Generate AI instructions with a simple string response (non-streaming)
   * @param request The instruction generation request
   * @returns Promise that resolves to the complete generated instructions
   */
  async generateInstructionsSimple(
    request: GenerateInstructionRequest
  ): Promise<string> {
    let result = "";

    for await (const chunk of this.generateInstructions(request)) {
      result += chunk;
    }

    return result;
  }
}

export const llmUtilityApiClient = new LlmUtilityApiClient();
