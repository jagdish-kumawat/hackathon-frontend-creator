"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { useAgents, useLlmProviders } from "@/hooks/use-agents";

export function DashboardStats() {
  const { agents, loading } = useAgents();
  const { providers } = useLlmProviders();

  const totalAgents = agents?.totalCount || 0;
  const totalProviders = providers?.length || 0;

  const stats = [
    {
      name: "Total Agents",
      value: loading ? "..." : totalAgents.toString(),
      change: `${totalAgents} active`,
      icon: Bot,
      trend: "up",
    },
    {
      name: "LLM Providers",
      value: loading ? "..." : totalProviders.toString(),
      change: `${totalProviders} configured`,
      icon: TrendingUp,
      trend: "up",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.name} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p
              className={`text-xs ${
                stat.trend === "up"
                  ? "text-green-600 dark:text-green-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
