import { SimulationHooks } from "@/types/agents";

// Mock data for simulation
const sampleTranscripts = [
  "Hello, I'm having trouble with my account.",
  "I need to schedule an appointment for next week.",
  "Can you help me with my order status?",
  "I'm experiencing some technical difficulties.",
  "I'd like to update my personal information.",
];

const sampleResponses = [
  "I understand you're having issues with your account. Let me help you with that.",
  "I'd be happy to help you schedule an appointment. What time works best for you?",
  "Let me check your order status for you right away.",
  "I'm sorry to hear about the technical difficulties. Let's troubleshoot this together.",
  "I can help you update your information. What would you like to change?",
];

const medicalResponses = [
  "Thank you for calling our healthcare facility. How can I assist you today?",
  "I understand you'd like to discuss your symptoms. Can you tell me more about what you're experiencing?",
  "Let me help you schedule that appointment with the appropriate specialist.",
  "Based on what you've described, I'd recommend speaking with one of our medical professionals.",
  "I'll need to collect some basic information first to ensure we provide you with the best care.",
];

// Generate fake STT transcription
export async function* mockSTT(
  audioBuffer: ArrayBuffer
): AsyncGenerator<{ text: string; confidence: number; timestamp: number }> {
  // Simulate processing time
  await new Promise((resolve) =>
    setTimeout(resolve, 100 + Math.random() * 200)
  );

  const transcript =
    sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
  const words = transcript.split(" ");

  // Emit words progressively
  let currentText = "";
  for (let i = 0; i < words.length; i++) {
    await new Promise((resolve) =>
      setTimeout(resolve, 50 + Math.random() * 100)
    );
    currentText += (i > 0 ? " " : "") + words[i];

    yield {
      text: currentText,
      confidence: 0.85 + Math.random() * 0.15,
      timestamp: Date.now(),
    };
  }
}

// Generate fake LLM response
export async function* mockLLM(input: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
}): AsyncGenerator<{ token: string; done?: boolean }> {
  // Simulate processing time
  await new Promise((resolve) =>
    setTimeout(resolve, 200 + Math.random() * 400)
  );

  // Choose response based on context
  const lastMessage = input.messages[input.messages.length - 1]?.content || "";
  const isHealthcare = input.messages.some(
    (m) =>
      m.content.toLowerCase().includes("medical") ||
      m.content.toLowerCase().includes("health") ||
      m.content.toLowerCase().includes("doctor") ||
      m.content.toLowerCase().includes("symptom")
  );

  const responses = isHealthcare ? medicalResponses : sampleResponses;
  const response = responses[Math.floor(Math.random() * responses.length)];

  // Stream tokens
  const words = response.split(" ");
  for (let i = 0; i < words.length; i++) {
    await new Promise((resolve) =>
      setTimeout(resolve, 30 + Math.random() * 70)
    );

    yield {
      token: (i > 0 ? " " : "") + words[i],
      done: i === words.length - 1,
    };
  }
}

// Generate fake TTS audio
export async function mockTTS(input: {
  text: string;
}): Promise<{ audioBuffer: Float32Array; duration: number }> {
  // Simulate processing time
  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 500)
  );

  // Generate fake audio data (simple sine wave)
  const sampleRate = 22050;
  const duration = Math.max(1, input.text.length * 0.1); // ~100ms per character
  const samples = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(samples);

  // Generate multiple frequency components for more natural sound
  for (let i = 0; i < samples; i++) {
    const time = i / sampleRate;
    const fade = Math.exp(-time * 2); // Exponential decay

    // Mix multiple frequencies to simulate speech
    buffer[i] =
      fade *
      (0.3 * Math.sin(2 * Math.PI * 200 * time) + // Base frequency
        0.2 * Math.sin(2 * Math.PI * 400 * time) + // First harmonic
        0.1 * Math.sin(2 * Math.PI * 600 * time) + // Second harmonic
        0.05 * (Math.random() * 2 - 1)); // Noise for realism
  }

  return {
    audioBuffer: buffer,
    duration,
  };
}

// Generate fake tool response
export async function mockTool(input: {
  name: string;
  parameters: Record<string, unknown>;
}): Promise<{ result: unknown }> {
  await new Promise((resolve) =>
    setTimeout(resolve, 100 + Math.random() * 300)
  );

  switch (input.name) {
    case "schedule_appointment":
      return {
        result: {
          appointmentId: `apt_${Math.random().toString(36).substring(7)}`,
          date: new Date(
            Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "confirmed",
        },
      };

    case "check_order_status":
      return {
        result: {
          orderId: input.parameters.orderId || "unknown",
          status: ["pending", "processing", "shipped", "delivered"][
            Math.floor(Math.random() * 4)
          ],
          estimatedDelivery: new Date(
            Date.now() + Math.random() * 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      };

    case "get_account_info":
      return {
        result: {
          accountId: "acc_12345",
          status: "active",
          lastLogin: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      };

    default:
      return {
        result: {
          message: `Tool ${input.name} executed successfully`,
          parameters: input.parameters,
          timestamp: new Date().toISOString(),
        },
      };
  }
}

// Transform data (e.g., text processing, format conversion)
export async function mockTransform(input: {
  data: unknown;
}): Promise<{ data: unknown }> {
  await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));

  if (typeof input.data === "string") {
    // Example transformations
    return {
      data: {
        original: input.data,
        cleaned: input.data.toLowerCase().trim(),
        wordCount: input.data.split(" ").length,
        sentiment: Math.random() > 0.5 ? "positive" : "negative",
        entities: extractMockEntities(input.data),
      },
    };
  }

  return { data: input.data };
}

function extractMockEntities(
  text: string
): Array<{ type: string; value: string; confidence: number }> {
  const entities: Array<{ type: string; value: string; confidence: number }> =
    [];

  // Mock entity extraction
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phonePattern = /\b\d{3}-\d{3}-\d{4}\b/g;
  const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g;

  const emails = text.match(emailPattern) || [];
  const phones = text.match(phonePattern) || [];
  const dates = text.match(datePattern) || [];

  emails.forEach((email) => {
    entities.push({ type: "email", value: email, confidence: 0.95 });
  });

  phones.forEach((phone) => {
    entities.push({ type: "phone", value: phone, confidence: 0.9 });
  });

  dates.forEach((date) => {
    entities.push({ type: "date", value: date, confidence: 0.85 });
  });

  return entities;
}

// Main simulation orchestrator
export class VoiceAgentSimulator {
  private sttHook?: SimulationHooks["stt"];
  private llmHook?: SimulationHooks["llm"];
  private ttsHook?: SimulationHooks["tts"];
  private toolHook?: SimulationHooks["tool"];
  private transformHook?: SimulationHooks["transform"];

  constructor(hooks: SimulationHooks = {}) {
    this.sttHook = hooks.stt || mockSTT;
    this.llmHook = hooks.llm || mockLLM;
    this.ttsHook = hooks.tts || mockTTS;
    this.toolHook = hooks.tool || mockTool;
    this.transformHook = hooks.transform || mockTransform;
  }

  async *simulateConversation(
    audioInput: ArrayBuffer,
    systemPrompt: string = ""
  ) {
    const startTime = Date.now();

    try {
      // Step 1: Speech-to-Text
      yield {
        step: "stt",
        status: "processing",
        message: "Converting speech to text...",
      };

      let transcription = "";
      if (this.sttHook) {
        for await (const chunk of this.sttHook(audioInput)) {
          transcription = chunk.text;
          yield {
            step: "stt",
            status: "streaming",
            data: chunk,
            message: `Transcribing: "${chunk.text}"`,
          };
        }
      }

      const sttEndTime = Date.now();
      yield {
        step: "stt",
        status: "completed",
        data: { text: transcription },
        latency: sttEndTime - startTime,
        message: `Transcription complete: "${transcription}"`,
      };

      // Step 2: Language Model Processing
      yield {
        step: "llm",
        status: "processing",
        message: "Generating response...",
      };

      const messages = [
        {
          role: "system" as const,
          content: systemPrompt || "You are a helpful assistant.",
        },
        { role: "user" as const, content: transcription },
      ];

      let response = "";
      if (this.llmHook) {
        for await (const token of this.llmHook({ messages })) {
          response += token.token;
          yield {
            step: "llm",
            status: "streaming",
            data: { token: token.token, fullResponse: response },
            message: `Generating: "${response}"`,
          };
        }
      }

      const llmEndTime = Date.now();
      yield {
        step: "llm",
        status: "completed",
        data: { response },
        latency: llmEndTime - sttEndTime,
        message: `Response generated: "${response}"`,
      };

      // Step 3: Text-to-Speech
      yield {
        step: "tts",
        status: "processing",
        message: "Converting text to speech...",
      };

      let audioResult;
      if (this.ttsHook) {
        audioResult = await this.ttsHook({ text: response });
      }

      const ttsEndTime = Date.now();
      yield {
        step: "tts",
        status: "completed",
        data: audioResult,
        latency: ttsEndTime - llmEndTime,
        message: "Audio generation complete",
      };

      // Final summary
      yield {
        step: "complete",
        status: "completed",
        data: {
          transcription,
          response,
          audio: audioResult,
          totalLatency: ttsEndTime - startTime,
          sttLatency: sttEndTime - startTime,
          llmLatency: llmEndTime - sttEndTime,
          ttsLatency: ttsEndTime - llmEndTime,
        },
        message: "Conversation simulation complete",
      };
    } catch (error) {
      yield {
        step: "error",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Simulation failed",
      };
    }
  }

  // Generate mock waveform data for visualization
  generateMockWaveform(
    audioBuffer: Float32Array,
    width: number = 200
  ): number[] {
    const samples = audioBuffer.length;
    const step = Math.max(1, Math.floor(samples / width));
    const waveform: number[] = [];

    for (let i = 0; i < samples; i += step) {
      // Calculate RMS for this segment
      let sum = 0;
      const segmentEnd = Math.min(i + step, samples);
      for (let j = i; j < segmentEnd; j++) {
        sum += audioBuffer[j] * audioBuffer[j];
      }
      const rms = Math.sqrt(sum / (segmentEnd - i));
      waveform.push(rms);
    }

    return waveform;
  }
}

// Export default simulator instance
export const defaultSimulator = new VoiceAgentSimulator();
