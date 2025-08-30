import { useState, useEffect } from "react";
import { apiClient } from "@/lib/agent-api";
import { Agent } from "@/types/agent-api";

export function useAgentsWithData() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getAgents({ pageSize: 100 });
      const dataAgents = response.items.filter((agent) => agent.withData);
      setAgents(dataAgents);
    } catch (err) {
      console.error("Failed to load agents:", err);
      setError(err instanceof Error ? err.message : "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    refetch: loadAgents,
  };
}
