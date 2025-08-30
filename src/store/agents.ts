import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  AgentConfig,
  AdapterConfigMeta,
  SimulationSession,
  UIState,
  WorkspaceSettings,
} from "@/types/agents";
import { generateId } from "@/lib/utils";

interface AgentsState {
  agents: AgentConfig[];
  currentAgent: AgentConfig | null;

  // CRUD operations
  createAgent: (
    agent: Omit<AgentConfig, "id" | "createdAt" | "updatedAt">
  ) => AgentConfig;
  updateAgent: (id: string, updates: Partial<AgentConfig>) => void;
  deleteAgent: (id: string) => void;
  duplicateAgent: (id: string) => AgentConfig | null;
  getAgent: (id: string) => AgentConfig | null;
  setCurrentAgent: (agent: AgentConfig | null) => void;

  // Import/Export
  importAgent: (agentData: AgentConfig) => void;
  exportAgent: (id: string) => AgentConfig | null;
  exportAllAgents: () => AgentConfig[];
}

interface AdaptersState {
  adapters: AdapterConfigMeta[];

  // Adapter management
  addAdapter: (adapter: AdapterConfigMeta) => void;
  removeAdapter: (id: string) => void;
  updateAdapter: (id: string, updates: Partial<AdapterConfigMeta>) => void;
  getAdapter: (id: string) => AdapterConfigMeta | null;
  getAdaptersByKind: (kind: string) => AdapterConfigMeta[];
}

interface SimulationState {
  sessions: SimulationSession[];
  currentSession: SimulationSession | null;

  // Simulation operations
  startSession: (agentId: string) => SimulationSession;
  stopSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: any) => void;
  updateMetrics: (
    sessionId: string,
    metrics: Partial<SimulationSession["metrics"]>
  ) => void;
  clearSessions: () => void;
}

interface UIStoreState extends UIState {
  // UI actions
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  addNotification: (
    notification: Omit<UIState["notifications"][0], "id" | "timestamp" | "read">
  ) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

interface WorkspaceState {
  settings: WorkspaceSettings;
  updateSettings: (updates: Partial<WorkspaceSettings>) => void;
  resetSettings: () => void;
}

// Default adapters for the system
const defaultAdapters: AdapterConfigMeta[] = [
  {
    id: "whisper-local",
    kind: "stt",
    name: "Whisper Local",
    description: "OpenAI Whisper running locally with high accuracy",
    version: "1.0.0",
    author: "OpenAI",
    tags: ["local", "high-accuracy", "multilingual"],
    configSchema: {
      model: {
        type: "string",
        enum: ["tiny", "base", "small", "medium", "large"],
        default: "base",
      },
      language: { type: "string", default: "auto" },
      temperature: { type: "number", min: 0, max: 1, default: 0 },
    },
  },
  {
    id: "gpt4-mock",
    kind: "llm",
    name: "GPT-4 (Mock)",
    description: "Simulated GPT-4 responses for development and testing",
    version: "1.0.0",
    author: "OpenAI",
    tags: ["mock", "high-quality", "general-purpose"],
    configSchema: {
      temperature: { type: "number", min: 0, max: 2, default: 0.7 },
      maxTokens: { type: "number", min: 1, max: 4000, default: 1000 },
      topP: { type: "number", min: 0, max: 1, default: 1 },
    },
  },
  {
    id: "elevenlabs-mock",
    kind: "tts",
    name: "ElevenLabs (Mock)",
    description: "Simulated natural voice synthesis with emotional expression",
    version: "1.0.0",
    author: "ElevenLabs",
    tags: ["mock", "natural", "emotional"],
    configSchema: {
      voice: {
        type: "string",
        enum: ["bella", "rachel", "domi", "dave"],
        default: "bella",
      },
      stability: { type: "number", min: 0, max: 1, default: 0.75 },
      similarityBoost: { type: "number", min: 0, max: 1, default: 0.5 },
    },
  },
];

// Agents Store
export const useAgentsStore = create<AgentsState>()(
  persist(
    immer((set, get) => ({
      agents: [],
      currentAgent: null,

      createAgent: (agentData) => {
        const agent: AgentConfig = {
          ...agentData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          state.agents.push(agent);
        });

        return agent;
      },

      updateAgent: (id, updates) => {
        set((state) => {
          const index = state.agents.findIndex((a) => a.id === id);
          if (index !== -1) {
            state.agents[index] = {
              ...state.agents[index],
              ...updates,
              updatedAt: new Date().toISOString(),
            };
          }
        });
      },

      deleteAgent: (id) => {
        set((state) => {
          state.agents = state.agents.filter((a) => a.id !== id);
          if (state.currentAgent?.id === id) {
            state.currentAgent = null;
          }
        });
      },

      duplicateAgent: (id) => {
        const original = get().agents.find((a) => a.id === id);
        if (!original) return null;

        const duplicate = get().createAgent({
          ...original,
          name: `${original.name} (Copy)`,
          isDraft: true,
        });

        return duplicate;
      },

      getAgent: (id) => {
        return get().agents.find((a) => a.id === id) || null;
      },

      setCurrentAgent: (agent) => {
        set((state) => {
          state.currentAgent = agent;
        });
      },

      importAgent: (agentData) => {
        set((state) => {
          // Ensure unique ID
          const newAgent = {
            ...agentData,
            id: generateId(),
            updatedAt: new Date().toISOString(),
          };
          state.agents.push(newAgent);
        });
      },

      exportAgent: (id) => {
        return get().agents.find((a) => a.id === id) || null;
      },

      exportAllAgents: () => {
        return get().agents;
      },
    })),
    {
      name: "agents-store",
    }
  )
);

// Adapters Store
export const useAdaptersStore = create<AdaptersState>()(
  persist(
    immer((set, get) => ({
      adapters: defaultAdapters,

      addAdapter: (adapter) => {
        set((state) => {
          state.adapters.push(adapter);
        });
      },

      removeAdapter: (id) => {
        set((state) => {
          state.adapters = state.adapters.filter((a) => a.id !== id);
        });
      },

      updateAdapter: (id, updates) => {
        set((state) => {
          const index = state.adapters.findIndex((a) => a.id === id);
          if (index !== -1) {
            state.adapters[index] = { ...state.adapters[index], ...updates };
          }
        });
      },

      getAdapter: (id) => {
        return get().adapters.find((a) => a.id === id) || null;
      },

      getAdaptersByKind: (kind) => {
        return get().adapters.filter((a) => a.kind === kind);
      },
    })),
    {
      name: "adapters-store",
    }
  )
);

// Simulation Store
export const useSimulationStore = create<SimulationState>()(
  immer((set, get) => ({
    sessions: [],
    currentSession: null,

    startSession: (agentId) => {
      const session: SimulationSession = {
        id: generateId(),
        agentId,
        status: "running",
        messages: [],
        metrics: {
          totalLatencyMs: 0,
          sttLatencyMs: 0,
          llmLatencyMs: 0,
          ttsLatencyMs: 0,
          tokensUsed: 0,
          errorCount: 0,
        },
        startedAt: new Date().toISOString(),
      };

      set((state) => {
        state.sessions.push(session);
        state.currentSession = session;
      });

      return session;
    },

    stopSession: (sessionId) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId);
        if (session) {
          session.status = "completed";
          session.completedAt = new Date().toISOString();
        }
      });
    },

    addMessage: (sessionId, message) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId);
        if (session) {
          session.messages.push({
            ...message,
            id: generateId(),
            timestamp: Date.now(),
          });
        }
      });
    },

    updateMetrics: (sessionId, metrics) => {
      set((state) => {
        const session = state.sessions.find((s) => s.id === sessionId);
        if (session) {
          session.metrics = { ...session.metrics, ...metrics };
        }
      });
    },

    clearSessions: () => {
      set((state) => {
        state.sessions = [];
        state.currentSession = null;
      });
    },
  }))
);

// UI Store
export const useUIStore = create<UIStoreState>()(
  persist(
    immer((set) => ({
      sidebarOpen: false,
      commandPaletteOpen: false,
      currentTheme: "system",
      notifications: [],

      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        });
      },

      toggleCommandPalette: () => {
        set((state) => {
          state.commandPaletteOpen = !state.commandPaletteOpen;
        });
      },

      setTheme: (theme) => {
        set((state) => {
          state.currentTheme = theme;
        });
      },

      addNotification: (notification) => {
        set((state) => {
          state.notifications.push({
            ...notification,
            id: generateId(),
            timestamp: Date.now(),
            read: false,
          });
        });
      },

      markNotificationRead: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification) {
            notification.read = true;
          }
        });
      },

      clearNotifications: () => {
        set((state) => {
          state.notifications = [];
        });
      },
    })),
    {
      name: "ui-store",
    }
  )
);

// Workspace Store
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    immer((set) => ({
      settings: {
        name: "My Workspace",
        theme: {
          mode: "system",
          brandColor: "#3b82f6",
          radius: 8,
          enableAnimations: true,
        },
        preferences: {
          autoSave: true,
          showTooltips: true,
          enableKeyboardShortcuts: true,
          compactMode: false,
        },
      },

      updateSettings: (updates) => {
        set((state) => {
          state.settings = { ...state.settings, ...updates };
        });
      },

      resetSettings: () => {
        set((state) => {
          state.settings = {
            name: "My Workspace",
            theme: {
              mode: "system",
              brandColor: "#3b82f6",
              radius: 8,
              enableAnimations: true,
            },
            preferences: {
              autoSave: true,
              showTooltips: true,
              enableKeyboardShortcuts: true,
              compactMode: false,
            },
          };
        });
      },
    })),
    {
      name: "workspace-store",
    }
  )
);
