"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, EyeOff, Settings, Database, Bug } from "lucide-react";

export function ProductionReadinessStatus() {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isDebugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";
  const isLoggingEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true";

  const features = [
    {
      name: "User Profile Management",
      status: "production",
      icon: <Settings className="h-4 w-4" />,
      description: "Safe profile editing and viewing",
    },
    {
      name: "User Statistics",
      status: "production",
      icon: <Database className="h-4 w-4" />,
      description: "Aggregate user metrics",
    },
    {
      name: "Authentication Flow",
      status: "production",
      icon: <Shield className="h-4 w-4" />,
      description: "Secure Entra ID authentication",
    },
    {
      name: "API Debug Panel",
      status: isDevelopment ? "development" : "hidden",
      icon: <Bug className="h-4 w-4" />,
      description: "API testing and debugging tools",
    },
    {
      name: "Token Information",
      status: isDevelopment ? "development" : "hidden",
      icon: <Eye className="h-4 w-4" />,
      description: "Token debugging endpoint",
    },
    {
      name: "Advanced User Details",
      status: isDevelopment ? "development" : "hidden",
      icon: <EyeOff className="h-4 w-4" />,
      description: "Internal user IDs and metadata",
    },
  ];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Production Readiness Status</h3>
          <Badge variant={isDevelopment ? "secondary" : "default"}>
            {isDevelopment ? "Development" : "Production"} Mode
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {feature.icon}
                <div>
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {feature.description}
                  </div>
                </div>
              </div>
              <Badge
                variant={
                  feature.status === "production"
                    ? "default"
                    : feature.status === "development"
                    ? "secondary"
                    : "outline"
                }
              >
                {feature.status === "production"
                  ? "✅ Production"
                  : feature.status === "development"
                  ? "🔧 Dev Only"
                  : "🚫 Hidden"}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Environment Configuration
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Environment:</span>
                <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
                  {process.env.NODE_ENV}
                </code>
              </div>
              {isDebugEnabled && (
                <div className="flex justify-between">
                  <span>Debug Override:</span>
                  <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 rounded">
                    Enabled
                  </code>
                </div>
              )}
              {isLoggingEnabled && (
                <div className="flex justify-between">
                  <span>Logging Override:</span>
                  <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 rounded">
                    Enabled
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isDevelopment && (isDebugEnabled || isLoggingEnabled) && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 dark:text-amber-400">⚠️</span>
              <div className="text-sm">
                <div className="font-medium text-amber-900 dark:text-amber-100">
                  Debug Features Enabled in Production
                </div>
                <div className="text-amber-700 dark:text-amber-300">
                  Debug or logging overrides are enabled. This is not
                  recommended for public production environments.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
