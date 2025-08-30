"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Upload,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import {
  useIndexingJobs,
  useCreateIndexingJob,
  useDeleteIndexingJob,
  useIndexingJobStatus,
} from "@/hooks/use-indexing";
import { CreateIndexingJobRequest, IndexingJob } from "@/types/agent-api";
import { toast } from "sonner";

interface IndexingManagerProps {
  agentId?: string;
  showCreateForm?: boolean;
}

export function IndexingManager({
  agentId,
  showCreateForm = true,
}: IndexingManagerProps) {
  const [formData, setFormData] = useState<Partial<CreateIndexingJobRequest>>({
    agentId: agentId || "",
    embeddingModel: "text-embedding-ada-002",
    documentSources: [],
    indexName: "",
  });
  const [documentSource, setDocumentSource] = useState("");
  const [showForm, setShowForm] = useState(false);

  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    refetch,
  } = useIndexingJobs(agentId ? { agentId } : undefined);
  const { createJob, loading: creating } = useCreateIndexingJob();
  const { deleteJob, loading: deleting } = useDeleteIndexingJob();

  const handleAddDocumentSource = () => {
    if (!documentSource.trim()) return;

    setFormData((prev) => ({
      ...prev,
      documentSources: [...(prev.documentSources || []), documentSource.trim()],
    }));
    setDocumentSource("");
  };

  const handleRemoveDocumentSource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documentSources:
        prev.documentSources?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.agentId ||
      !formData.embeddingModel ||
      !formData.documentSources?.length
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createJob(formData as CreateIndexingJobRequest);
      toast.success("Indexing job created successfully");
      setShowForm(false);
      setFormData({
        agentId: agentId || "",
        embeddingModel: "text-embedding-ada-002",
        documentSources: [],
        indexName: "",
      });
      refetch();
    } catch (error) {
      toast.error("Failed to create indexing job");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJob(id);
      toast.success("Indexing job deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete indexing job");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Indexing</h2>
          <p className="text-muted-foreground">
            Manage document indexing for agent knowledge base
          </p>
        </div>
        {showCreateForm && (
          <Button onClick={() => setShowForm(true)} disabled={creating}>
            <Upload className="h-4 w-4 mr-2" />
            Create Index Job
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Indexing Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentId">Agent ID *</Label>
                <Input
                  id="agentId"
                  value={formData.agentId || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agentId: e.target.value,
                    }))
                  }
                  placeholder="Enter agent ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="embeddingModel">Embedding Model *</Label>
                <Select
                  value={formData.embeddingModel || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, embeddingModel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select embedding model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-embedding-ada-002">
                      text-embedding-ada-002
                    </SelectItem>
                    <SelectItem value="text-embedding-3-small">
                      text-embedding-3-small
                    </SelectItem>
                    <SelectItem value="text-embedding-3-large">
                      text-embedding-3-large
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="indexName">Index Name (Optional)</Label>
                <Input
                  id="indexName"
                  value={formData.indexName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      indexName: e.target.value,
                    }))
                  }
                  placeholder="Auto-generated if not provided"
                />
              </div>

              <div className="space-y-2">
                <Label>Document Sources *</Label>
                <div className="flex gap-2">
                  <Input
                    value={documentSource}
                    onChange={(e) => setDocumentSource(e.target.value)}
                    placeholder="Enter file path or URL"
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddDocumentSource())
                    }
                  />
                  <Button
                    type="button"
                    onClick={handleAddDocumentSource}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {formData.documentSources &&
                  formData.documentSources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.documentSources.map((source, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          {source}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => handleRemoveDocumentSource(index)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Create Job
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Indexing Jobs</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={jobsLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${jobsLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </CardHeader>
        <CardContent>
          {jobsError && <div className="text-red-600 mb-4">{jobsError}</div>}

          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading indexing jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No indexing jobs found
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <IndexingJobCard
                  key={job.id}
                  job={job}
                  onDelete={handleDelete}
                  deleting={deleting}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface IndexingJobCardProps {
  job: IndexingJob;
  onDelete: (id: string) => void;
  deleting: boolean;
}

function IndexingJobCard({ job, onDelete, deleting }: IndexingJobCardProps) {
  const { status, isPolling, startPolling, stopPolling } = useIndexingJobStatus(
    job.id,
    job.status === "processing"
  );

  const currentStatus = status || {
    id: job.id,
    status: job.status,
    totalDocuments: job.totalDocuments,
    processedDocuments: job.processedDocuments,
    failedDocuments: job.failedDocuments,
    progress:
      job.totalDocuments > 0
        ? (job.processedDocuments / job.totalDocuments) * 100
        : 0,
    lastUpdated: job.updatedAt,
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(currentStatus.status)}
              <Badge className={getStatusColor(currentStatus.status)}>
                {currentStatus.status.toUpperCase()}
              </Badge>
              <span className="font-medium">{job.indexName}</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Agent: {job.agentId} • Model: {job.embeddingModel}
            </div>

            {currentStatus.status === "processing" && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {currentStatus.processedDocuments}/
                    {currentStatus.totalDocuments}
                  </span>
                </div>
                <Progress value={currentStatus.progress} className="h-2" />
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              {job.documentSources.length} document(s) • Created:{" "}
              {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStatus.status === "processing" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isPolling ? stopPolling : startPolling}
                    >
                      {isPolling ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isPolling ? "Stop monitoring" : "Start monitoring"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={deleting}>
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Indexing Job</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this indexing job? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(job.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "processing":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
