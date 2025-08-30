import { create } from "zustand";
import { chatApi, ChatMessage, Conversation } from "@/lib/chat-api";

export interface ChatState {
  // Current conversation
  currentConversation: Conversation | null;

  // All conversations for the selected agent
  conversations: Conversation[];

  // UI state
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessageId: string | null;

  // Selected agent
  selectedAgentId: string | null;
  selectedAgentName: string | null;

  // Actions
  setSelectedAgent: (agentId: string, agentName: string) => void;
  loadConversations: () => Promise<void>;
  startNewConversation: () => void;
  loadConversation: (conversationId: string) => Promise<void>;
  sendMessage: (message: string, context?: string) => Promise<void>;
  updateConversationTitle: (
    conversationId: string,
    title: string
  ) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearAllConversations: () => Promise<void>;
  clearCurrentConversation: () => void;
  setIsLoading: (loading: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentConversation: null,
  conversations: [],
  isLoading: false,
  isStreaming: false,
  streamingMessageId: null,
  selectedAgentId: null,
  selectedAgentName: null,

  setSelectedAgent: (agentId: string, agentName: string) => {
    set({
      selectedAgentId: agentId,
      selectedAgentName: agentName,
      currentConversation: null,
      conversations: [],
    });
  },

  loadConversations: async () => {
    const { selectedAgentId } = get();
    if (!selectedAgentId) return;

    set({ isLoading: true });
    try {
      const conversations = await chatApi.getConversationsForAgent(
        selectedAgentId
      );
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error("Failed to load conversations:", error);
      set({ isLoading: false });
    }
  },

  startNewConversation: () => {
    set({ currentConversation: null });
  },

  loadConversation: async (conversationId: string) => {
    set({ isLoading: true });
    try {
      const conversation = await chatApi.getConversation(conversationId);
      set({ currentConversation: conversation, isLoading: false });
    } catch (error) {
      console.error("Failed to load conversation:", error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (message: string, context?: string) => {
    const state = get();
    if (!state.selectedAgentId) {
      throw new Error("No agent selected");
    }

    // Create user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    // Create initial assistant message
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    // Update current conversation with new messages
    set((prevState) => ({
      currentConversation: prevState.currentConversation
        ? {
            ...prevState.currentConversation,
            messages: [
              ...prevState.currentConversation.messages,
              userMessage,
              assistantMessage,
            ],
            updatedAt: new Date().toISOString(),
          }
        : {
            id: `temp_${Date.now()}`,
            userId: "",
            agentId: prevState.selectedAgentId!,
            title:
              message.substring(0, 50) + (message.length > 50 ? "..." : ""),
            messages: [userMessage, assistantMessage],
            isActive: true,
            isDeleted: false,
            deletedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
      isStreaming: true,
    }));

    try {
      await chatApi.chatWithAgent(
        state.selectedAgentId,
        message,
        context,
        state.currentConversation?.id,
        (chunk: string) => {
          // Update the assistant message with streaming content
          set((prevState) => ({
            currentConversation: prevState.currentConversation
              ? {
                  ...prevState.currentConversation,
                  messages: prevState.currentConversation.messages.map(
                    (msg, index) =>
                      index ===
                        prevState.currentConversation!.messages.length - 1 &&
                      msg.role === "assistant"
                        ? { ...msg, content: msg.content + chunk }
                        : msg
                  ),
                }
              : null,
          }));
        }
      );

      // Refresh conversations list to get the server-side conversation
      await get().loadConversations();
    } catch (error) {
      // Handle error by updating the assistant message
      set((prevState) => ({
        currentConversation: prevState.currentConversation
          ? {
              ...prevState.currentConversation,
              messages: prevState.currentConversation.messages.map(
                (msg, index) =>
                  index ===
                    prevState.currentConversation!.messages.length - 1 &&
                  msg.role === "assistant"
                    ? {
                        ...msg,
                        content:
                          "Sorry, I encountered an error. Please try again.",
                      }
                    : msg
              ),
            }
          : null,
      }));
      throw error;
    } finally {
      set({ isStreaming: false });
    }
  },

  updateConversationTitle: async (conversationId: string, title: string) => {
    try {
      await chatApi.updateConversationTitle(conversationId, title);
      // Update local state
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, title } : conv
        ),
        currentConversation:
          state.currentConversation?.id === conversationId
            ? { ...state.currentConversation, title }
            : state.currentConversation,
      }));
    } catch (error) {
      console.error("Failed to update conversation title:", error);
      throw error;
    }
  },

  deleteConversation: async (conversationId: string) => {
    try {
      await chatApi.deleteConversation(conversationId);
      // Update local state
      set((state) => ({
        conversations: state.conversations.filter(
          (conv) => conv.id !== conversationId
        ),
        currentConversation:
          state.currentConversation?.id === conversationId
            ? null
            : state.currentConversation,
      }));
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      throw error;
    }
  },

  clearAllConversations: async () => {
    const { selectedAgentId } = get();
    if (!selectedAgentId) return;

    try {
      await chatApi.clearAllConversations(selectedAgentId);
      set({ conversations: [], currentConversation: null });
    } catch (error) {
      console.error("Failed to clear conversations:", error);
      throw error;
    }
  },

  clearCurrentConversation: () => {
    set({ currentConversation: null });
  },

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setIsStreaming: (streaming: boolean) => {
    set({ isStreaming: streaming });
  },
}));
