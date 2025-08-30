"use client";

import { useState, useEffect, useCallback } from "react";
import { userApi } from "@/lib/user-api";
import { UserStats } from "@/types/user";
import { Card } from "@/components/ui/card";

interface UserStatsComponentProps {
  tenantId?: string;
  className?: string;
}

export function UserStatsComponent({
  tenantId,
  className,
}: UserStatsComponentProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getUserStats(tenantId);
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load user statistics"
      );
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          Loading user statistics...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-red-500">Error: {error}</div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      color: "bg-blue-500",
      description: "All registered users",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      color: "bg-green-500",
      description: "Currently active users",
    },
    {
      title: "Inactive Users",
      value: stats.inactiveUsers,
      color: "bg-yellow-500",
      description: "Temporarily inactive users",
    },
    {
      title: "Deleted Users",
      value: stats.deletedUsers,
      color: "bg-red-500",
      description: "Soft-deleted users",
    },
  ];

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">User Statistics</h3>
        {tenantId && (
          <p className="text-sm text-gray-600">
            Filtered by tenant: {tenantId}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <div className="w-6 h-6 bg-white rounded opacity-80"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
