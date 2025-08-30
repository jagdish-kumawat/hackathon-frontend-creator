"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Square,
  Mic,
  Settings,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { useAgents } from "@/hooks/use-agents";

export function PlaygroundInterface() {
  const { agents, loading } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAgentData = agents?.items.find(
    (agent) => agent.id === selectedAgent
  );

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsProcessing(true);

    // Simulate processing for demo
    setTimeout(() => {
      setIsRecording(false);
      setIsProcessing(false);
    }, 3000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Playground Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Agent
            </label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent to test" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading agents...
                  </SelectItem>
                ) : agents?.items.length ? (
                  agents.items.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No agents available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedAgentData && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Selected Agent Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedAgentData.name}
                </div>
                <div>
                  <span className="font-medium">Domain:</span>{" "}
                  {selectedAgentData.domain}
                </div>
                <div>
                  <span className="font-medium">Description:</span>{" "}
                  {selectedAgentData.description}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Voice Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedAgent ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Please select an agent to start testing
              </p>
            </div>
          ) : (
            <>
              {/* Recording Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <Button
                    onClick={handleStartRecording}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}
                  >
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopRecording}
                    size="lg"
                    variant="destructive"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>

              {/* Status */}
              <div className="text-center">
                {isRecording && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording...</span>
                  </div>
                )}
                {isProcessing && !isRecording && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Processing...</span>
                  </div>
                )}
                {!isRecording && !isProcessing && (
                  <Badge variant="outline">Ready</Badge>
                )}
              </div>

              {/* Placeholder for results */}
              <div className="bg-muted/50 p-6 rounded-lg text-center">
                <p className="text-muted-foreground">
                  Voice testing interface ready. This playground will integrate
                  with your backend voice processing pipeline once it's
                  available.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
