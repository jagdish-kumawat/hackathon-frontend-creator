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
  Play,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { useAgents } from "@/hooks/use-agents";

function getStatusBadge(domain: string) {
  const domainColors: Record<string, string> = {
    healthcare:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    support: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    sales:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    education:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  };

  return (
    domainColors[domain.toLowerCase()] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  );
}

export function RecentAgents() {
  const { agents, loading, error } = useAgents({ pageSize: 5 });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Recent Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading agents...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Recent Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <span className="ml-2 text-red-600">Failed to load agents</span>
        </CardContent>
      </Card>
    );
  }

  const recentAgents = agents?.items || [];

  if (recentAgents.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Recent Agents
          </CardTitle>
          <Link href="/agents">
            <Button variant="outline" size="sm">
              Create Agent
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No agents yet</h3>
            <p className="text-muted-foreground">
              Create your first agent to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{agent.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {agent.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge
                      variant="secondary"
                      className={getStatusBadge(agent.domain)}
                    >
                      {agent.domain}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimestamp(agent.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right text-sm hidden sm:block">
                  <div className="font-medium">Active</div>
                  <div className="text-muted-foreground">
                    {agent.withData ? "With Data" : "No Data"}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/agents`}>
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
