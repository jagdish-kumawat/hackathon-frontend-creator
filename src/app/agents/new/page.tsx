"use client";

import { DashboardNav } from "@/components/dashboard/nav";
import { AgentForm } from "@/components/agents/agent-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateAgentRequest, UpdateAgentRequest } from "@/types/agent-api";
import { apiClient } from "@/lib/agent-api";

export default function NewAgentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    data: CreateAgentRequest | UpdateAgentRequest
  ) => {
    try {
      setIsLoading(true);
      await apiClient.createAgent(data as CreateAgentRequest);
      router.push("/agents");
    } catch (error) {
      console.error("Failed to create agent:", error);
      throw error; // Let the form handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/agents");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="lg:pl-64 container mx-auto px-4 py-8">
          <AgentForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
