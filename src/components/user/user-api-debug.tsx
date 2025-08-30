"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useUserManagement } from "@/hooks/use-user-management";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsDevelopment } from "@/lib/dev-utils";
import { logger } from "@/lib/logger";

export function UserApiDebug() {
  const isDevelopment = useIsDevelopment();
  const { user, isAuthenticated } = useAuth();
  const { loading, error, clearError, getCurrentUser, getUserStats } =
    useUserManagement();

  const [debugData, setDebugData] = useState<any>(null);

  // Don't render anything in production
  if (!isDevelopment) {
    return null;
  }

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    clearError();
    setDebugData(null);

    try {
      logger.debug(`Running test: ${testName}`);
      const result = await testFn();
      setDebugData({ testName, result, success: true });
      logger.debug(`Test completed: ${testName}`, result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setDebugData({ testName, error: errorMsg, success: false });
      logger.error(`Test failed: ${testName}`, err);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          Please log in to test user APIs
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">User API Debug Panel</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <Button
            onClick={() => runTest("Get Current User", getCurrentUser)}
            disabled={loading}
            variant="outline"
          >
            Get Current User
          </Button>

          <Button
            onClick={() => runTest("Get User Stats", () => getUserStats())}
            disabled={loading}
            variant="outline"
          >
            Get User Stats
          </Button>
        </div>

        {loading && (
          <div className="text-center text-blue-600 mb-4">Loading...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <h4 className="text-red-800 font-medium">Error:</h4>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {debugData && (
          <div
            className={`border rounded-md p-4 ${
              debugData.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <h4
              className={`font-medium mb-2 ${
                debugData.success ? "text-green-800" : "text-red-800"
              }`}
            >
              Test: {debugData.testName}
            </h4>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(debugData.result || debugData.error, null, 2)}
            </pre>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Current Authentication State
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700">Current User:</h4>
            <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-700">
              Authentication Status:
            </h4>
            <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
              {JSON.stringify({ isAuthenticated }, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
