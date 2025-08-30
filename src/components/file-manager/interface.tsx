"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fileApiClient, FileInfo, StorageStats } from "@/lib/file-api";
import { useAgentsWithData } from "@/hooks/use-agents-with-data";
import { Agent } from "@/types/agent-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  Trash2,
  Search,
  RefreshCw,
  FileText,
  Image,
  File,
  FolderOpen,
  ChevronDown,
  AlertCircle,
  Plus,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// File upload constants
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks for large files

interface FileManagerInterfaceProps {
  className?: string;
}

export function FileManagerInterface({ className }: FileManagerInterfaceProps) {
  const {
    agents,
    loading: agentsLoading,
    error: agentsError,
  } = useAgentsWithData();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [uploadControllers, setUploadControllers] = useState<
    Record<string, AbortController>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set first agent as selected when agents load
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load files for selected agent
  const loadFiles = useCallback(async () => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      const response = await fileApiClient.getAgentFiles(selectedAgent.id, {
        page: currentPage,
        pageSize: 20,
        searchTerm: debouncedSearchTerm || undefined,
      });
      setFiles(response.items);
      setTotalPages(response.totalPages);

      // Load storage stats
      const statsResponse = await fileApiClient.getStorageStats({
        agentId: selectedAgent.id,
      });
      setStats(statsResponse);
      setError(null);
    } catch (error) {
      console.error("Failed to load files:", error);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [selectedAgent, currentPage, debouncedSearchTerm]);

  // Validate file size
  const validateFileSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
  };

  // Cancel upload
  const cancelUpload = (fileName: string) => {
    const controller = uploadControllers[fileName];
    if (controller) {
      controller.abort();
      setUploadControllers((prev) => {
        const newControllers = { ...prev };
        delete newControllers[fileName];
        return newControllers;
      });
      setUploadingFiles((prev) => prev.filter((name) => name !== fileName));
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileName];
        return newProgress;
      });
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file uploads with validation
  const handleFileUpload = async (uploadFiles: File[]) => {
    if (!selectedAgent || uploadFiles.length === 0) return;

    // Validate file sizes
    const invalidFiles = uploadFiles.filter((file) => !validateFileSize(file));
    if (invalidFiles.length > 0) {
      const fileDetails = invalidFiles
        .map((f) => `${f.name} (${formatFileSize(f.size)})`)
        .join(", ");
      setError(
        `Files exceed maximum size limit of ${formatFileSize(
          MAX_FILE_SIZE
        )}: ${fileDetails}`
      );
      return;
    }

    // Check total upload size
    const totalSize = uploadFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_FILE_SIZE * 5) {
      setError(
        `Total upload size too large (${formatFileSize(
          totalSize
        )}). Please upload fewer files at once.`
      );
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress({});
    setUploadingFiles(uploadFiles.map((f) => f.name));

    try {
      if (uploadFiles.length === 1) {
        const file = uploadFiles[0];
        await fileApiClient.uploadFile(
          file,
          selectedAgent.id,
          undefined,
          (progress) => {
            setUploadProgress({ [file.name]: progress });
          }
        );
        setSuccess(
          `Successfully uploaded ${file.name} (${formatFileSize(file.size)})`
        );
      } else {
        // For multiple files, upload them sequentially to avoid overwhelming the server
        for (let i = 0; i < uploadFiles.length; i++) {
          const file = uploadFiles[i];
          await fileApiClient.uploadFile(
            file,
            selectedAgent.id,
            undefined,
            (progress) => {
              setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
            }
          );
        }
        const totalSizeFormatted = formatFileSize(totalSize);
        setSuccess(
          `Successfully uploaded ${uploadFiles.length} files (${totalSizeFormatted})`
        );
      }
      await loadFiles();
    } catch (error) {
      console.error("Failed to upload files:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload files"
      );
    } finally {
      setUploading(false);
      setUploadProgress({});
      setUploadingFiles([]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input to allow same file selection
    event.target.value = "";
  };

  // Handle drag and drop events
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      // Quick validation before upload
      const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map((f) => f.name).join(", ");
        setError(
          `Files too large (max ${formatFileSize(MAX_FILE_SIZE)}): ${fileNames}`
        );
        return;
      }
      handleFileUpload(files);
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Download file
  const handleDownloadFile = async (file: FileInfo) => {
    try {
      // Use browser-friendly download that returns SAS URL
      const downloadResponse = await fileApiClient.downloadFile(file.id, {
        expiryHours: 1, // 1 hour expiry
        permissions: "r", // read-only
      });

      // For browser-friendly downloads, open the SAS URL directly
      const a = document.createElement("a");
      a.href = downloadResponse.sasUrl;
      a.download = file.fileName;
      a.target = "_blank"; // Open in new tab for PDFs, images, etc.
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download file:", error);
      setError("Failed to download file");
    }
  };

  // View file in browser (for PDFs, images, documents)
  const handleViewFile = async (file: FileInfo) => {
    try {
      // Use browser-friendly download that returns SAS URL
      const downloadResponse = await fileApiClient.downloadFile(file.id, {
        expiryHours: 2, // 2 hours for viewing
        permissions: "r", // read-only
      });

      // Open the SAS URL directly in a new tab for viewing
      window.open(downloadResponse.sasUrl, "_blank");
    } catch (error) {
      console.error("Failed to view file:", error);
      setError("Failed to view file");
    }
  };

  // Helper function to check if file can be viewed in browser
  const canViewInBrowser = (file: FileInfo): boolean => {
    const viewableTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "text/plain",
      "text/html",
      "text/css",
      "text/javascript",
      "application/json",
    ];
    return viewableTypes.includes(file.contentType.toLowerCase());
  };

  // Delete files
  const handleDeleteFiles = async (fileIds: string[]) => {
    if (
      !confirm(`Are you sure you want to delete ${fileIds.length} file(s)?`)
    ) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await Promise.all(
        fileIds.map((id) => fileApiClient.deleteFile(id, false))
      );
      setSelectedFiles(new Set());
      setSuccess(`Successfully deleted ${fileIds.length} file(s)`);
      await loadFiles();
    } catch (error) {
      console.error("Failed to delete files:", error);
      setError("Failed to delete files");
    }
  };

  // Dropzone for file uploads
  const getRootProps = () => ({
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onClick: openFilePicker,
  });

  const getInputProps = () => ({
    type: "file" as const,
    multiple: true,
    onChange: handleFileInputChange,
    style: { display: "none" },
  });

  // Get file icon based on type
  const getFileIcon = (file: FileInfo) => {
    const ext = file.fileExtension.toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg"].includes(ext)) {
      return <Image className="h-5 w-5" />;
    }
    if ([".txt", ".md", ".doc", ".docx", ".pdf"].includes(ext)) {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle agent selection
  const handleAgentChange = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setCurrentPage(1);
      setSelectedFiles(new Set());
      setError(null);
      setSuccess(null);
    }
  };

  // Initialize
  useEffect(() => {
    if (selectedAgent) {
      loadFiles();
    }
  }, [selectedAgent, loadFiles]);

  if (agentsLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Loading Agents</h3>
          <p className="text-muted-foreground">
            Fetching your data-enabled agents...
          </p>
        </div>
      </div>
    );
  }

  if (agentsError) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Agents</h3>
          <p className="text-muted-foreground mb-4">{agentsError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Agents Found</h3>
          <p className="text-muted-foreground mb-4">
            You need agents with data capabilities to manage files.
          </p>
          <Button asChild>
            <a href="/agents/new" className="inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Data Agent
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 p-6 space-y-6", className)}>
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {success}
        </div>
      )}

      {/* Header and Agent Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-muted-foreground">
            Manage files for your data-enabled agents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="agent-select">Agent:</Label>
            <div className="relative">
              <select
                id="agent-select"
                value={selectedAgent?.id || ""}
                onChange={(e) => handleAgentChange(e.target.value)}
                className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <Button
            onClick={loadFiles}
            disabled={loading || !selectedAgent}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Files</div>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Storage Used</div>
            <div className="text-2xl font-bold">{stats.totalSizeFormatted}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Active Files</div>
            <div className="text-2xl font-bold">{stats.activeFiles}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">File Types</div>
            <div className="text-2xl font-bold">
              {Object.keys(stats.filesByExtension).length}
            </div>
          </Card>
        </div>
      )}

      {/* File Upload Area */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          (!selectedAgent || uploading) && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        {uploading ? (
          <div className="space-y-4">
            <p className="text-lg font-medium">Uploading files...</p>
            {uploadingFiles.map((fileName) => (
              <div key={fileName} className="max-w-md mx-auto">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="truncate flex-1">{fileName}</span>
                  <div className="flex items-center gap-2">
                    <span>{uploadProgress[fileName] || 0}%</span>
                    <Button
                      onClick={() => cancelUpload(fileName)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[fileName] || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : isDragActive ? (
          <p>Drop files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              Supports all file types. Multiple files can be uploaded at once.
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>
        )}
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedFiles.size > 0 && (
          <Button
            onClick={() => handleDeleteFiles(Array.from(selectedFiles))}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedFiles.size})
          </Button>
        )}
      </div>

      {/* Files Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={
                      files.length > 0 && selectedFiles.size === files.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(new Set(files.map((f) => f.id)));
                      } else {
                        setSelectedFiles(new Set());
                      }
                    }}
                  />
                </th>
                <th className="p-4">Name</th>
                <th className="p-4">Size</th>
                <th className="p-4">Type</th>
                <th className="p-4">Modified</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading files...
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No files found. Upload some files to get started.
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedFiles);
                          if (e.target.checked) {
                            newSelected.add(file.id);
                          } else {
                            newSelected.delete(file.id);
                          }
                          setSelectedFiles(newSelected);
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <div>
                          <div className="font-medium">{file.displayName}</div>
                          {file.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {file.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {file.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{file.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {file.fileSizeFormatted}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {file.fileExtension}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(file.updatedAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {canViewInBrowser(file) && (
                          <Button
                            onClick={() => handleViewFile(file)}
                            size="sm"
                            variant="ghost"
                            title="View in browser"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDownloadFile(file)}
                          size="sm"
                          variant="ghost"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteFiles([file.id])}
                          size="sm"
                          variant="ghost"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                size="sm"
                variant="outline"
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                size="sm"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
