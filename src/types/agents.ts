import { z } from "zod";

// Adapter kinds
export type AdapterKind = "stt" | "llm" | "tts" | "tool" | "transform";

// Base adapter configuration
export const AdapterConfigMetaSchema = z.object({
  id: z.string(),
  kind: z.enum(["stt", "llm", "tts", "tool", "transform"]),
  name: z.string(),
  description: z.string(),
  docsUrl: z.string().optional(),
  version: z.string().default("1.0.0"),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  configSchema: z.record(z.any()), // JSON schema for UI generation
});

export type AdapterConfigMeta = z.infer<typeof AdapterConfigMetaSchema>;

// Simulation hooks for local testing (mock only)
export interface SimulationHooks {
  stt?: (
    input: ArrayBuffer
  ) => AsyncGenerator<{ text: string; confidence: number; timestamp: number }>;
  llm?: (input: {
    messages: { role: "system" | "user" | "assistant"; content: string }[];
  }) => AsyncGenerator<{ token: string; done?: boolean }>;
  tts?: (input: {
    text: string;
  }) => Promise<{ audioBuffer: Float32Array; duration: number }>;
  tool?: (input: {
    name: string;
    parameters: Record<string, unknown>;
  }) => Promise<{ result: unknown }>;
  transform?: (input: { data: unknown }) => Promise<{ data: unknown }>;
}

// Pipeline node configuration
export const PipelineNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["STT", "LLM", "TTS", "Tool", "Transform"]),
  adapterId: z.string(),
  label: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  config: z.record(z.any()).default({}),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
});

export type PipelineNode = z.infer<typeof PipelineNodeSchema>;

// Pipeline edge/connection
export const PipelineEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.string().default("default"),
});

export type PipelineEdge = z.infer<typeof PipelineEdgeSchema>;

// Tool definition for LLM function calling
export const ToolDefSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()), // JSON schema
});

export type ToolDef = z.infer<typeof ToolDefSchema>;

// Agent configuration schema
export const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  domain: z.string().optional(), // e.g., 'healthcare', 'support'

  // Pipeline configuration
  pipeline: z.object({
    nodes: z.array(PipelineNodeSchema),
    edges: z.array(PipelineEdgeSchema),
  }),

  // Prompt configuration
  prompts: z.object({
    system: z.string(),
    tools: z.array(ToolDefSchema).default([]),
    fewShot: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      )
      .default([]),
  }),

  // Policies and constraints
  policies: z.object({
    redactPII: z.boolean().default(true),
    blockSensitiveLogging: z.boolean().default(true),
    languages: z.array(z.string()).default(["en"]),
    maxLatencyMs: z.number().default(5000),
    enableProfanityFilter: z.boolean().default(true),
    allowedDomains: z.array(z.string()).default([]),
  }),

  // Example interactions and test cases
  examples: z
    .array(
      z.object({
        title: z.string(),
        input: z.string(),
        expectedOutput: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .default([]),

  // Knowledge base and data sources (mock)
  knowledgeBase: z
    .object({
      documents: z
        .array(
          z.object({
            id: z.string(),
            title: z.string(),
            content: z.string(),
            tags: z.array(z.string()).default([]),
          })
        )
        .default([]),
      intents: z
        .array(
          z.object({
            name: z.string(),
            description: z.string(),
            examples: z.array(z.string()),
          })
        )
        .default([]),
      entities: z
        .array(
          z.object({
            name: z.string(),
            type: z.enum(["text", "number", "date", "email", "phone"]),
            patterns: z.array(z.string()).default([]),
          })
        )
        .default([]),
    })
    .default({
      documents: [],
      intents: [],
      entities: [],
    }),

  // Versioning
  version: z.string().default("1.0.0"),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Draft status
  isDraft: z.boolean().default(true),
  isArchived: z.boolean().default(false),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// Simulation session state
export const SimulationSessionSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  status: z.enum(["idle", "running", "paused", "completed", "error"]),
  messages: z.array(
    z.object({
      id: z.string(),
      timestamp: z.number(),
      type: z.enum(["user", "agent", "system"]),
      content: z.string(),
      metadata: z.record(z.any()).optional(),
    })
  ),
  metrics: z.object({
    totalLatencyMs: z.number().default(0),
    sttLatencyMs: z.number().default(0),
    llmLatencyMs: z.number().default(0),
    ttsLatencyMs: z.number().default(0),
    tokensUsed: z.number().default(0),
    errorCount: z.number().default(0),
  }),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

export type SimulationSession = z.infer<typeof SimulationSessionSchema>;

// UI State types
export interface UIState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  currentTheme: "light" | "dark" | "system";
  notifications: Array<{
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message?: string;
    timestamp: number;
    read: boolean;
  }>;
}

// Workspace settings
export const WorkspaceSettingsSchema = z.object({
  name: z.string().default("My Workspace"),
  description: z.string().optional(),
  theme: z.object({
    mode: z.enum(["light", "dark", "system"]).default("system"),
    brandColor: z.string().default("#3b82f6"),
    radius: z.number().min(0).max(20).default(8),
    enableAnimations: z.boolean().default(true),
  }),
  preferences: z.object({
    autoSave: z.boolean().default(true),
    showTooltips: z.boolean().default(true),
    enableKeyboardShortcuts: z.boolean().default(true),
    compactMode: z.boolean().default(false),
  }),
});

export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>;

// Error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string, public code?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class SimulationError extends Error {
  constructor(
    message: string,
    public component?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "SimulationError";
  }
}
