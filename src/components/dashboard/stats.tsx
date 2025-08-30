"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Clock, CheckCircle, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Total Agents",
    value: "8",
    change: "+2 this week",
    icon: Bot,
    trend: "up",
  },
  {
    name: "Avg Latency",
    value: "245ms",
    change: "-15ms from last week",
    icon: Clock,
    trend: "down",
  },
  {
    name: "Success Rate",
    value: "99.2%",
    change: "+0.5% from last week",
    icon: CheckCircle,
    trend: "up",
  },
  {
    name: "Adapters",
    value: "24",
    change: "+3 new adapters",
    icon: TrendingUp,
    trend: "up",
  },
];

export function DashboardStats() {
  return (
    <div className="lg:pl-64">
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
    </div>
  );
}
