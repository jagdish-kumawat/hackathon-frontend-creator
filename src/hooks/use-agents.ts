import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/agent-api";
import {
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
  PagedAgentsResponse,
  LlmProvider,
  Domain,
  AgentFilters,
} from "@/types/agent-api";

export function useAgents(initialFilters: AgentFilters = {}) {
  const [agents, setAgents] = useState<PagedAgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AgentFilters>(initialFilters);

  const fetchAgents = useCallback(
    async (filtersToUse = filters) => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getAgents(filtersToUse);
        setAgents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch agents");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const createAgent = useCallback(
    async (data: CreateAgentRequest): Promise<Agent> => {
      try {
        const newAgent = await apiClient.createAgent(data);
        // Refresh the list
        await fetchAgents();
        return newAgent;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to create agent"
        );
      }
    },
    [fetchAgents]
  );

  const updateAgent = useCallback(
    async (id: string, data: UpdateAgentRequest): Promise<Agent> => {
      try {
        const updatedAgent = await apiClient.updateAgent(id, data);
        // Refresh the list
        await fetchAgents();
        return updatedAgent;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update agent"
        );
      }
    },
    [fetchAgents]
  );

  const deleteAgent = useCallback(
    async (id: string): Promise<void> => {
      try {
        await apiClient.deleteAgent(id);
        // Refresh the list
        await fetchAgents();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to delete agent"
        );
      }
    },
    [fetchAgents]
  );

  const updateFilters = useCallback(
    (newFilters: AgentFilters) => {
      setFilters(newFilters);
      fetchAgents(newFilters);
    },
    [fetchAgents]
  );

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    loading,
    error,
    filters,
    createAgent,
    updateAgent,
    deleteAgent,
    updateFilters,
    refetch: fetchAgents,
  };
}

export function useLlmProviders() {
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getLlmProviders();
        setProviders(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch LLM providers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return { providers, loading, error };
}

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getDomains();
        setDomains(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch domains"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  return { domains, loading, error };
}

export function useAgent(id: string | null) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setAgent(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchAgent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getAgent(id);
        setAgent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch agent");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  return { agent, loading, error };
}
