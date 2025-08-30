import { useState, useEffect, useCallback } from "react";
import {
  IndexingJob,
  CreateIndexingJobRequest,
  PagedIndexingJobsResponse,
  IndexingJobStatus,
  IndexingFilters,
} from "@/types/agent-api";
import { indexingApiClient } from "@/lib/indexing-api";

// Hook for managing indexing jobs list
export function useIndexingJobs(filters?: IndexingFilters) {
  const [data, setData] = useState<PagedIndexingJobsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await indexingApiClient.getIndexingJobs(filters);
      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch indexing jobs"
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs: data?.items || [],
    pagination: data
      ? {
          page: data.page,
          pageSize: data.pageSize,
          totalCount: data.totalCount,
          totalPages: data.totalPages,
        }
      : null,
    loading,
    error,
    refetch: fetchJobs,
  };
}

// Hook for managing a single indexing job
export function useIndexingJob(id: string | null) {
  const [job, setJob] = useState<IndexingJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await indexingApiClient.getIndexingJobById(id);
      setJob(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch indexing job"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return {
    job,
    loading,
    error,
    refetch: fetchJob,
  };
}

// Hook for creating indexing jobs
export function useCreateIndexingJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = useCallback(
    async (data: CreateIndexingJobRequest): Promise<IndexingJob> => {
      setLoading(true);
      setError(null);
      try {
        const response = await indexingApiClient.createIndexingJob(data);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create indexing job";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createJob,
    loading,
    error,
  };
}

// Hook for deleting indexing jobs
export function useDeleteIndexingJob() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJob = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await indexingApiClient.deleteIndexingJob(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete indexing job";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteJob,
    loading,
    error,
  };
}

// Hook for polling indexing job status
export function useIndexingJobStatus(id: string | null, autoStart = false) {
  const [status, setStatus] = useState<IndexingJobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const startPolling = useCallback(async () => {
    if (!id || isPolling) return;

    setIsPolling(true);
    setLoading(true);
    setError(null);

    try {
      for await (const statusUpdate of indexingApiClient.pollIndexingStatus(
        id
      )) {
        setStatus(statusUpdate);
        setLoading(false);

        // Stop polling if completed or failed
        if (
          statusUpdate.status === "completed" ||
          statusUpdate.status === "failed"
        ) {
          break;
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to poll indexing status"
      );
    } finally {
      setIsPolling(false);
      setLoading(false);
    }
  }, [id, isPolling]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  const fetchStatus = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await indexingApiClient.getIndexingJobStatus(id);
      setStatus(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch indexing status"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoStart && id && !isPolling) {
      startPolling();
    }
  }, [autoStart, id, isPolling, startPolling]);

  return {
    status,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    fetchStatus,
  };
}

// Hook for combined indexing operations
export function useIndexingOperations() {
  const {
    createJob,
    loading: creating,
    error: createError,
  } = useCreateIndexingJob();
  const {
    deleteJob,
    loading: deleting,
    error: deleteError,
  } = useDeleteIndexingJob();

  return {
    createJob,
    deleteJob,
    loading: creating || deleting,
    error: createError || deleteError,
  };
}
