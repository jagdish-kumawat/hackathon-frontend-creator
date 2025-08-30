import { TokenManager } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7022";

export interface FileInfo {
  id: string;
  fileName: string;
  blobName: string;
  containerName: string;
  contentType: string;
  sizeBytes: number;
  fileExtension: string;
  contentMD5?: string;
  eTag?: string;
  uploadedByUserId: string;
  agentId: string;
  category?: string;
  metadata: Record<string, any>;
  tags: string[];
  isPublic: boolean;
  storageUrl: string;
  lastAccessedAt: string;
  downloadCount: number;
  isDeleted: boolean;
  deletedAt?: string;
  displayName: string;
  fileSizeFormatted: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedFilesResponse {
  items: FileInfo[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface StorageStats {
  totalFiles: number;
  totalSizeBytes: number;
  activeFiles: number;
  deletedFiles: number;
  filesByExtension: Record<string, number>;
  filesByCategory: Record<string, number>;
  totalSizeFormatted: string;
}

export interface FileMetadataUpdate {
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SasTokenRequest {
  expiryHours: number;
  permissions: string;
}

export interface SasTokenResponse {
  sasUrl: string;
  expiresAt: string;
}

export interface DownloadUrlResponse {
  sasUrl: string;
  expiresAt: string;
}

class FileApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (multipart uploads)
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData: { message?: string };
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
        throw new Error(errorData.message || "An error occurred");
      }

      // Handle empty responses (like DELETE)
      if (response.status === 204) {
        return undefined as T;
      }

      // Handle file downloads
      if (response.headers.get("content-disposition")) {
        return response.blob() as T;
      }

      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // Upload single file
  async uploadFile(
    file: File,
    agentId: string,
    customFileName?: string,
    onProgress?: (progress: number) => void
  ): Promise<FileInfo> {
    // For very large files (>50MB), consider chunked upload
    const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

    if (file.size > LARGE_FILE_THRESHOLD && onProgress) {
      // For now, we'll use regular upload with progress
      // In the future, this could be enhanced with chunked upload
      console.log(
        `Uploading large file: ${file.name} (${this.formatFileSize(file.size)})`
      );
    }

    const formData = new FormData();
    formData.append("File", file);
    formData.append("AgentId", agentId);
    if (customFileName) {
      formData.append("CustomFileName", customFileName);
    }

    // Use XMLHttpRequest for progress tracking if callback provided
    if (onProgress) {
      return this.uploadWithProgress("/api/files/upload", formData, onProgress);
    }

    return this.request<FileInfo>("/api/files/upload", {
      method: "POST",
      body: formData,
    });
  }

  // Helper method to format file size
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Upload with progress tracking
  private async uploadWithProgress<T>(
    endpoint: string,
    formData: FormData,
    onProgress: (progress: number) => void
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Set timeout for large files (10 minutes)
      xhr.timeout = 10 * 60 * 1000;

      // Set up progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || "Upload failed"));
          } catch {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred during upload"));
      });

      // Handle timeout
      xhr.addEventListener("timeout", () => {
        reject(
          new Error(
            "Upload timed out. File may be too large or connection is slow."
          )
        );
      });

      // Set up request
      xhr.open("POST", url);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      // Send request
      xhr.send(formData);
    });
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    agentId: string
  ): Promise<FileInfo[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("Files", file));
    formData.append("AgentId", agentId);

    return this.request<FileInfo[]>("/api/files/upload-multiple", {
      method: "POST",
      body: formData,
    });
  }

  // List files for an agent
  async getAgentFiles(
    agentId: string,
    options: {
      page?: number;
      pageSize?: number;
      category?: string;
      fileExtension?: string;
      searchTerm?: string;
      includeDeleted?: boolean;
    } = {}
  ): Promise<PagedFilesResponse> {
    const params = new URLSearchParams();

    // Add AgentId as query parameter as per API docs
    params.append("AgentId", agentId);

    // Add optional parameters with capitalized names to match API docs
    if (options.page) params.append("Page", options.page.toString());
    if (options.pageSize)
      params.append("PageSize", options.pageSize.toString());
    if (options.category) params.append("Category", options.category);
    if (options.fileExtension)
      params.append("FileExtension", options.fileExtension);
    if (options.searchTerm) params.append("SearchTerm", options.searchTerm);
    if (options.includeDeleted) params.append("IncludeDeleted", "true");

    const queryString = params.toString();
    const endpoint = `/api/files?${queryString}`;

    return this.request<PagedFilesResponse>(endpoint);
  }

  // List files with flexible filtering
  async getFiles(
    options: {
      page?: number;
      pageSize?: number;
      userId?: string;
      agentId?: string;
      category?: string;
      fileExtension?: string;
      searchTerm?: string;
      includeDeleted?: boolean;
    } = {}
  ): Promise<PagedFilesResponse> {
    const params = new URLSearchParams();

    // Add parameters with capitalized names to match API
    if (options.page) params.append("Page", options.page.toString());
    if (options.pageSize)
      params.append("PageSize", options.pageSize.toString());
    if (options.userId) params.append("UserId", options.userId);
    if (options.agentId) params.append("AgentId", options.agentId);
    if (options.category) params.append("Category", options.category);
    if (options.fileExtension)
      params.append("FileExtension", options.fileExtension);
    if (options.searchTerm) params.append("SearchTerm", options.searchTerm);
    if (options.includeDeleted) params.append("IncludeDeleted", "true");

    const queryString = params.toString();
    const endpoint = `/api/files${queryString ? `?${queryString}` : ""}`;

    return this.request<PagedFilesResponse>(endpoint);
  }

  // Get file details
  async getFileDetails(fileId: string): Promise<FileInfo> {
    return this.request<FileInfo>(`/api/files/${fileId}`);
  }

  // Download file (Browser-Friendly) - Returns SAS URL
  async downloadFile(
    fileId: string,
    options: {
      expiryHours?: number;
      permissions?: string;
    } = {}
  ): Promise<DownloadUrlResponse> {
    const params = new URLSearchParams();
    if (options.expiryHours)
      params.append("expiryHours", options.expiryHours.toString());
    if (options.permissions) params.append("permissions", options.permissions);

    const queryString = params.toString();
    const endpoint = `/api/files/${fileId}/download${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request<DownloadUrlResponse>(endpoint);
  }

  // Download file (Direct) - Returns file content as blob
  async downloadFileDirect(fileId: string): Promise<Blob> {
    return this.request<Blob>(`/api/files/${fileId}/download-direct`);
  }

  // Update file metadata
  async updateFileMetadata(
    fileId: string,
    metadata: FileMetadataUpdate
  ): Promise<FileInfo> {
    return this.request<FileInfo>(`/api/files/${fileId}/metadata`, {
      method: "PUT",
      body: JSON.stringify(metadata),
    });
  }

  // Generate SAS token
  async generateSasToken(
    fileId: string,
    request: SasTokenRequest
  ): Promise<SasTokenResponse> {
    return this.request<SasTokenResponse>(`/api/files/${fileId}/sas-token`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Get storage statistics
  async getStorageStats(filters?: {
    userId?: string;
    agentId?: string;
  }): Promise<StorageStats> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.agentId) params.append("agentId", filters.agentId);

    const queryString = params.toString();
    const endpoint = `/api/files/stats${queryString ? `?${queryString}` : ""}`;

    return this.request<StorageStats>(endpoint);
  }

  // Delete file
  async deleteFile(fileId: string, hardDelete = false): Promise<void> {
    const params = new URLSearchParams();
    if (hardDelete) params.append("hardDelete", "true");

    const queryString = params.toString();
    const endpoint = `/api/files/${fileId}${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request<void>(endpoint, {
      method: "DELETE",
    });
  }

  // Copy file
  async copyFile(
    fileId: string,
    destinationContainer: string,
    newFileName?: string
  ): Promise<void> {
    return this.request<void>(`/api/files/${fileId}/copy`, {
      method: "POST",
      body: JSON.stringify({
        destinationContainer,
        newFileName,
      }),
    });
  }

  // Check if file exists
  async checkFileExists(
    containerName: string,
    blobName: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/files/${containerName}/${blobName}`,
        {
          method: "HEAD",
          headers: {
            Authorization: `Bearer ${TokenManager.getToken()}`,
          },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  // Download file by blob name
  async downloadFileByBlobName(
    containerName: string,
    blobName: string
  ): Promise<Blob> {
    return this.request<Blob>(
      `/api/files/${containerName}/${blobName}/download`
    );
  }
}

export const fileApiClient = new FileApiClient();
