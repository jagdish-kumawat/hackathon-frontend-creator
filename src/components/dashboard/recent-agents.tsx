"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Stethoscope,
  Headphones,
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

// Mock data for recent agents
const recentAgents = [
  {
    id: "1",
    name: "Healthcare Assistant",
    description: "Patient intake and symptom assessment",
    status: "active",
    domain: "healthcare",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    latency: 245,
    successRate: 99.2,
    icon: Stethoscope,
  },
  {
    id: "2",
    name: "Customer Support Bot",
    description: "Handle customer inquiries and escalations",
    status: "draft",
    domain: "support",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    latency: 180,
    successRate: 97.8,
    icon: Headphones,
  },
  {
    id: "3",
    name: "Appointment Scheduler",
    description: "Schedule and manage appointments",
    status: "active",
    domain: "healthcare",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    latency: 320,
    successRate: 98.5,
    icon: Bot,
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "draft":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

export function RecentAgents() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          Recent Agents
        </CardTitle>
        <Link href="/agents">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <agent.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{agent.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {agent.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <Badge
                      variant="secondary"
                      className={getStatusColor(agent.status)}
                    >
                      {agent.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(agent.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right text-sm">
                  <div className="font-medium">{agent.latency}ms</div>
                  <div className="text-muted-foreground">
                    {agent.successRate}%
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/agents/${agent.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
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
