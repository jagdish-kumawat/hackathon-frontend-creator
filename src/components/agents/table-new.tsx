"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Clock,
  Edit,
  Trash,
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { useAgents, useDomains } from "@/hooks/use-agents";
import { AgentForm } from "./agent-form";
import {
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
} from "@/types/agent-api";

export function AgentsTable() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    agents,
    loading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    updateFilters,
  } = useAgents();

  const { domains } = useDomains();

  // Handle search and filters
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    updateFilters({
      page: 1,
      pageSize: 10,
      name: term || undefined,
      domain: selectedDomain || undefined,
    });
  };

  const handleDomainFilter = (domain: string) => {
    setSelectedDomain(domain);
    setCurrentPage(1);
    updateFilters({
      page: 1,
      pageSize: 10,
      name: searchTerm || undefined,
      domain: domain || undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateFilters({
      page,
      pageSize: 10,
      name: searchTerm || undefined,
      domain: selectedDomain || undefined,
    });
  };

  // Form handlers
  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setFormMode("create");
    setShowForm(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleFormSubmit = async (
    data: CreateAgentRequest | UpdateAgentRequest
  ) => {
    try {
      setFormLoading(true);
      if (formMode === "create") {
        await createAgent(data as CreateAgentRequest);
      } else if (selectedAgent) {
        await updateAgent(selectedAgent.id, data as UpdateAgentRequest);
      }
      setShowForm(false);
      setSelectedAgent(null);
    } catch (error) {
      // Error is handled by the hook and displayed to user
      console.error("Form submit error:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      try {
        await deleteAgent(agent.id);
      } catch (error) {
        // Error is handled by the hook
        console.error("Delete error:", error);
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedAgent(null);
    setFormLoading(false);
  };

  if (showForm) {
    return (
      <AgentForm
        mode={formMode}
        initialData={selectedAgent || undefined}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isLoading={formLoading}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          {/* Domain Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedDomain} onValueChange={handleDomainFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All domains</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.name}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create Button */}
        <Button onClick={handleCreateAgent} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading agents...</span>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>Error: {error}</span>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && agents && agents.items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || selectedDomain
                ? "No agents match your search criteria."
                : "Get started by creating your first agent."}
            </p>
            <Button onClick={handleCreateAgent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Agents List */}
      {!loading && !error && agents && agents.items.length > 0 && (
        <>
          <div className="grid gap-4">
            {agents.items.map((agent) => (
              <Card key={agent.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold truncate">
                            {agent.name}
                          </h3>
                          <Badge variant="outline">{agent.domain}</Badge>
                          {agent.withData && (
                            <Badge variant="secondary">With Data</Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {agent.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Created {formatTimestamp(agent.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Model: {agent.deploymentModel}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAgent(agent)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAgent(agent)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {agents.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {agents.items.length} of {agents.totalCount} agents
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: agents.totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === agents.totalPages ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === agents.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
