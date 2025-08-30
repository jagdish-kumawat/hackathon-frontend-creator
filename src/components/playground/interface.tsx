"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Square,
  Mic,
  MicOff,
  Volume2,
  Settings,
  Activity,
  Clock,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { defaultSimulator } from "@/lib/simulators";
import { useAgentsStore } from "@/store/agents";

interface SimulationStep {
  step: string;
  status: string;
  message: string;
  data?: any;
  latency?: number;
  error?: string;
}

export function PlaygroundInterface() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [transcription, setTranscription] = useState("");
  const [response, setResponse] = useState("");
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const { agents } = useAgentsStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRecording = async () => {
    setIsRecording(true);
    setSimulationSteps([]);
    setTranscription("");
    setResponse("");

    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      runSimulation();
    }, 3000);
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationSteps([]);

    // Create mock audio buffer
    const mockAudioBuffer = new ArrayBuffer(44100 * 2); // 2 seconds of audio
    const systemPrompt = selectedAgent
      ? agents.find((a) => a.id === selectedAgent)?.prompts.system ||
        "You are a helpful assistant."
      : "You are a helpful assistant.";

    try {
      for await (const step of defaultSimulator.simulateConversation(
        mockAudioBuffer,
        systemPrompt
      )) {
        setSimulationSteps((prev) => [...prev, step]);

        if (
          step.step === "stt" &&
          step.status === "completed" &&
          step.data &&
          "text" in step.data &&
          step.data.text
        ) {
          setTranscription(step.data.text);
        }

        if (
          step.step === "llm" &&
          step.status === "completed" &&
          step.data &&
          "response" in step.data &&
          step.data.response
        ) {
          setResponse(step.data.response);
        }

        if (
          step.step === "tts" &&
          step.status === "completed" &&
          step.data &&
          "audioBuffer" in step.data
        ) {
          // Generate waveform visualization
          const waveform = defaultSimulator.generateMockWaveform(
            step.data.audioBuffer,
            100
          );
          setWaveformData(waveform);
        }
      }
    } catch (error) {
      console.error("Simulation error:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case "stt":
        return <Mic className="h-4 w-4" />;
      case "llm":
        return <MessageCircle className="h-4 w-4" />;
      case "tts":
        return <Volume2 className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "streaming":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Control Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Mock Agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Button
                onClick={startRecording}
                disabled={isRecording || isSimulating}
                className="w-full"
                size="lg"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2 animate-pulse" />
                    Recording... ({isRecording ? "3s" : "0s"})
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>

              <Button
                onClick={runSimulation}
                disabled={isSimulating}
                variant="outline"
                className="w-full"
              >
                {isSimulating ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Simulation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {simulationSteps
                .filter((step) => step.latency)
                .map((step, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm capitalize">{step.step}</span>
                    <Badge variant="outline">{step.latency}ms</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Steps */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Pipeline Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {simulationSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step.step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize">
                        {step.step}
                      </span>
                      <Badge
                        variant="secondary"
                        className={getStepColor(step.status)}
                      >
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.message}
                    </p>
                    {step.latency && (
                      <p className="text-xs text-muted-foreground">
                        {step.latency}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {simulationSteps.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Start a recording or simulation to see pipeline steps
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Transcription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mic className="h-5 w-5 mr-2" />
              Transcription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted rounded-lg min-h-[100px]">
              {transcription ? (
                <p className="text-sm">{transcription}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Transcription will appear here...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted rounded-lg min-h-[100px]">
              {response ? (
                <p className="text-sm">{response}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Agent response will appear here...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Waveform */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Volume2 className="h-5 w-5 mr-2" />
              Audio Waveform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-24 bg-muted rounded-lg flex items-end justify-center p-2">
              {waveformData.length > 0 ? (
                <div className="flex items-end space-x-1 h-full">
                  {waveformData.map((amplitude, index) => (
                    <div
                      key={index}
                      className="bg-primary"
                      style={{
                        width: "2px",
                        height: `${Math.max(2, amplitude * 100)}%`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {waveformData.length > 0 && (
              <div className="mt-3">
                <Button size="sm" variant="outline" className="w-full">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Play Audio (Mock)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
