import { useState, useCallback } from "react";
import { userApi } from "@/lib/user-api";
import {
  User,
  UpdateCurrentUserRequest,
  UpdateUserStatusRequest,
  UserStats,
  CurrentUserInfo,
} from "@/types/user";

export function useUserManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      errorMessage: string = "An error occurred"
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : errorMessage;
        setError(message);
        console.error(errorMessage, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    return handleApiCall(
      () => userApi.getCurrentUser(),
      "Failed to get current user"
    );
  }, [handleApiCall]);

  const updateCurrentUser = useCallback(
    async (userData: UpdateCurrentUserRequest): Promise<User | null> => {
      return handleApiCall(
        () => userApi.updateCurrentUser(userData),
        "Failed to update user profile"
      );
    },
    [handleApiCall]
  );

  const registerUser = useCallback(async (): Promise<User | null> => {
    return handleApiCall(
      () => userApi.registerUser(),
      "Failed to register user"
    );
  }, [handleApiCall]);

  const ensureUserExists = useCallback(async (): Promise<User | null> => {
    return handleApiCall(
      () => userApi.ensureUserExists(),
      "Failed to ensure user exists"
    );
  }, [handleApiCall]);

  const getTokenInfo =
    useCallback(async (): Promise<CurrentUserInfo | null> => {
      return handleApiCall(
        () => userApi.getTokenInfo(),
        "Failed to get token information"
      );
    }, [handleApiCall]);

  const getUserById = useCallback(
    async (id: string): Promise<User | null> => {
      return handleApiCall(
        () => userApi.getUserById(id),
        `Failed to get user with ID: ${id}`
      );
    },
    [handleApiCall]
  );

  const updateUserStatus = useCallback(
    async (
      id: string,
      statusData: UpdateUserStatusRequest
    ): Promise<User | null> => {
      return handleApiCall(
        () => userApi.updateUserStatus(id, statusData),
        `Failed to update status for user: ${id}`
      );
    },
    [handleApiCall]
  );

  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await handleApiCall(
        () => userApi.deleteUser(id),
        `Failed to delete user: ${id}`
      );
      return result !== null;
    },
    [handleApiCall]
  );

  const permanentDeleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await handleApiCall(
        () => userApi.permanentDeleteUser(id),
        `Failed to permanently delete user: ${id}`
      );
      return result !== null;
    },
    [handleApiCall]
  );

  const getUserStats = useCallback(
    async (tenantId?: string): Promise<UserStats | null> => {
      return handleApiCall(
        () => userApi.getUserStats(tenantId),
        "Failed to get user statistics"
      );
    },
    [handleApiCall]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    getCurrentUser,
    updateCurrentUser,
    registerUser,
    ensureUserExists,
    getTokenInfo,
    getUserById,
    updateUserStatus,
    deleteUser,
    permanentDeleteUser,
    getUserStats,
  };
}
