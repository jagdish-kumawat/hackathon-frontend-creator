"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Clock,
  MoreHorizontal,
  Edit,
  Copy,
  Download,
  Play,
  Trash,
  Stethoscope,
  Headphones,
  Users,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

// Extended mock data for agents
const agents = [
  {
    id: "1",
    name: "Healthcare Assistant",
    description:
      "Comprehensive patient intake and symptom assessment with medical history collection",
    status: "active",
    domain: "healthcare",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    latency: 245,
    successRate: 99.2,
    tags: ["medical", "intake", "symptoms"],
    icon: Stethoscope,
    adapters: {
      stt: "Whisper Local",
      llm: "GPT-4 Mock",
      tts: "ElevenLabs Mock",
    },
  },
  {
    id: "2",
    name: "Customer Support Bot",
    description:
      "Handle customer inquiries, complaints, and escalations with human handoff",
    status: "draft",
    domain: "support",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    latency: 180,
    successRate: 97.8,
    tags: ["support", "escalation", "chat"],
    icon: Headphones,
    adapters: {
      stt: "Azure STT Mock",
      llm: "Claude Mock",
      tts: "Azure TTS Mock",
    },
  },
  {
    id: "3",
    name: "Appointment Scheduler",
    description:
      "Schedule, reschedule, and manage appointments with calendar integration",
    status: "active",
    domain: "healthcare",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    latency: 320,
    successRate: 98.5,
    tags: ["scheduling", "calendar", "appointments"],
    icon: Calendar,
    adapters: {
      stt: "Whisper Local",
      llm: "Llama Mock",
      tts: "Coqui TTS Mock",
    },
  },
  {
    id: "4",
    name: "Sales Assistant",
    description: "Product recommendations and sales process automation",
    status: "testing",
    domain: "sales",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    latency: 280,
    successRate: 96.1,
    tags: ["sales", "recommendations", "products"],
    icon: ShoppingCart,
    adapters: {
      stt: "Google STT Mock",
      llm: "GPT-3.5 Mock",
      tts: "Amazon Polly Mock",
    },
  },
  {
    id: "5",
    name: "HR Onboarding",
    description:
      "Guide new employees through onboarding process and answer HR questions",
    status: "active",
    domain: "hr",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    latency: 195,
    successRate: 99.7,
    tags: ["hr", "onboarding", "employees"],
    icon: Users,
    adapters: {
      stt: "Whisper Local",
      llm: "GPT-4 Mock",
      tts: "Azure TTS Mock",
    },
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "draft":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "testing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

export function AgentsTable() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-6 border rounded-xl hover:bg-muted/30 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <agent.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-lg">{agent.name}</h4>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(agent.status)}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {agent.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated {formatTimestamp(agent.updatedAt)}
                    </span>
                    <span>STT: {agent.adapters.stt}</span>
                    <span>LLM: {agent.adapters.llm}</span>
                    <span>TTS: {agent.adapters.tts}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {agent.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right space-y-1">
                  <div className="text-sm font-medium">
                    {agent.latency}ms avg
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {agent.successRate}% success
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8"
                  >
                    <Link href={`/agents/${agent.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
