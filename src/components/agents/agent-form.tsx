"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLlmProviders, useDomains } from "@/hooks/use-agents";
import {
  CreateAgentRequest,
  UpdateAgentRequest,
  Agent,
} from "@/types/agent-api";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { llmUtilityApiClient } from "@/lib/llm-utility-api";
import { toast } from "sonner";

interface AgentFormProps {
  onSubmit: (data: CreateAgentRequest | UpdateAgentRequest) => Promise<void>;
  onCancel: () => void;
  initialData?: Agent;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function AgentForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  mode,
}: AgentFormProps) {
  const [formData, setFormData] = useState<CreateAgentRequest>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    domain: initialData?.domain || "",
    llmProviderId: initialData?.llmProviderId || "",
    endpoint: initialData?.endpoint || "",
    apiKey: initialData?.apiKey || "",
    apiVersion: initialData?.apiVersion || "",
    deploymentModel: initialData?.deploymentModel || "",
    instructions: initialData?.instructions || "",
    withData: initialData?.withData || false,
    embeddingModel: initialData?.embeddingModel || "",
  });

  const [customDomain, setCustomDomain] = useState("");
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [isGeneratingInstructions, setIsGeneratingInstructions] =
    useState(false);

  const {
    providers,
    loading: providersLoading,
    error: providersError,
  } = useLlmProviders();
  const {
    domains,
    loading: domainsLoading,
    error: domainsError,
  } = useDomains();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle initial data when domains are loaded
  useEffect(() => {
    if (initialData?.domain && domains.length > 0) {
      const domainExists = domains.some((d) => d.name === initialData.domain);
      if (!domainExists || initialData.domain === "Custom") {
        setShowCustomDomain(true);
        setCustomDomain(
          initialData.domain === "Custom" ? "" : initialData.domain
        );
      }
    }
  }, [initialData?.domain, domains]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.name.length > 100)
      newErrors.name = "Name must be 100 characters or less";

    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.description.length > 500)
      newErrors.description = "Description must be 500 characters or less";

    const finalDomain = showCustomDomain ? customDomain : formData.domain;
    if (!finalDomain.trim()) newErrors.domain = "Domain is required";
    if (finalDomain.length > 50)
      newErrors.domain = "Domain must be 50 characters or less";

    if (!formData.llmProviderId)
      newErrors.llmProviderId = "LLM Provider is required";

    if (!formData.endpoint.trim()) newErrors.endpoint = "Endpoint is required";
    try {
      new URL(formData.endpoint);
    } catch {
      newErrors.endpoint = "Endpoint must be a valid URL";
    }

    if (!formData.apiKey.trim()) newErrors.apiKey = "API Key is required";
    if (formData.apiKey.length > 200)
      newErrors.apiKey = "API Key must be 200 characters or less";

    if (!formData.deploymentModel.trim())
      newErrors.deploymentModel = "Deployment Model is required";
    if (formData.deploymentModel.length > 100)
      newErrors.deploymentModel =
        "Deployment Model must be 100 characters or less";

    // Check if Azure OpenAI is selected
    const selectedProvider = providers.find(
      (p) => p.id === formData.llmProviderId
    );
    const isAzureOpenAI = selectedProvider?.name === "Azure OpenAI";

    // API Version validation (only for Azure OpenAI)
    if (isAzureOpenAI && !formData.apiVersion?.trim()) {
      newErrors.apiVersion = "API Version is required for Azure OpenAI";
    }
    if (formData.apiVersion && formData.apiVersion.length > 50) {
      newErrors.apiVersion = "API Version must be 50 characters or less";
    }

    // Embedding Model validation (only when withData is true)
    if (formData.withData && !formData.embeddingModel?.trim()) {
      newErrors.embeddingModel = "Embedding Model is required when using data";
    }
    if (formData.embeddingModel && formData.embeddingModel.length > 100) {
      newErrors.embeddingModel =
        "Embedding Model must be 100 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateInstructions = async () => {
    if (
      !formData.name.trim() ||
      (!formData.domain.trim() && !customDomain.trim())
    ) {
      toast.error(
        "Please fill in the agent name and domain before generating instructions"
      );
      return;
    }

    setIsGeneratingInstructions(true);
    setFormData((prev) => ({ ...prev, instructions: "" }));

    // Clear any previous errors
    setErrors((prev) => ({ ...prev, instructions: "" }));

    try {
      const finalDomain = showCustomDomain ? customDomain : formData.domain;

      toast.info("Generating AI-powered instructions...", {
        description: `Creating instructions for ${formData.name} in ${finalDomain} domain`,
        duration: 2000,
      });

      for await (const chunk of llmUtilityApiClient.generateInstructions({
        agentName: formData.name,
        domain: finalDomain,
        description: formData.description || undefined,
      })) {
        setFormData((prev) => ({
          ...prev,
          instructions: prev.instructions + chunk,
        }));
      }

      toast.success("Instructions generated successfully!", {
        description: "You can now review and edit the generated instructions",
      });
    } catch (error) {
      console.error("Failed to generate instructions:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate instructions";

      toast.error("Failed to generate instructions", {
        description: errorMessage,
      });

      setErrors((prev) => ({
        ...prev,
        instructions: errorMessage,
      }));
    } finally {
      setIsGeneratingInstructions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const finalData = {
      ...formData,
      domain: showCustomDomain ? customDomain : formData.domain,
    };

    try {
      await onSubmit(finalData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleDomainChange = (value: string) => {
    // Check if the selected domain is "Custom" (from backend)
    const selectedDomain = domains.find((d) => d.name === value);
    if (value === "Custom" || selectedDomain?.name === "Custom") {
      setShowCustomDomain(true);
      setFormData((prev) => ({ ...prev, domain: "" }));
    } else {
      setShowCustomDomain(false);
      setCustomDomain("");
      setFormData((prev) => ({ ...prev, domain: value }));
    }
  };

  if (providersLoading || domainsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading form data...</span>
        </CardContent>
      </Card>
    );
  }

  if (providersError || domainsError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-destructive">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>
            Failed to load form data: {providersError || domainsError}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create New Agent" : "Edit Agent"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter agent name"
              maxLength={100}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what this agent does"
              maxLength={500}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain *</Label>
            <Select
              value={showCustomDomain ? "Custom" : formData.domain}
              onValueChange={handleDomainChange}
            >
              <SelectTrigger
                className={errors.domain ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.name}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showCustomDomain && (
              <Input
                value={customDomain}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCustomDomain(e.target.value)
                }
                placeholder="Enter custom domain name"
                maxLength={50}
                className={errors.domain ? "border-destructive" : ""}
              />
            )}
            {errors.domain && (
              <p className="text-sm text-destructive">{errors.domain}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="llmProviderId">LLM Provider *</Label>
            <Select
              value={formData.llmProviderId}
              onValueChange={(value: string) =>
                setFormData((prev) => ({ ...prev, llmProviderId: value }))
              }
            >
              <SelectTrigger
                className={errors.llmProviderId ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select an LLM provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.llmProviderId && (
              <p className="text-sm text-destructive">{errors.llmProviderId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint *</Label>
            <Input
              id="endpoint"
              value={formData.endpoint}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, endpoint: e.target.value }))
              }
              placeholder="https://api.openai.com/v1/chat/completions"
              className={errors.endpoint ? "border-destructive" : ""}
            />
            {errors.endpoint && (
              <p className="text-sm text-destructive">{errors.endpoint}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
              }
              placeholder="Enter your API key"
              maxLength={200}
              className={errors.apiKey ? "border-destructive" : ""}
            />
            {errors.apiKey && (
              <p className="text-sm text-destructive">{errors.apiKey}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deploymentModel">Deployment Model *</Label>
            <Input
              id="deploymentModel"
              value={formData.deploymentModel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  deploymentModel: e.target.value,
                }))
              }
              placeholder="gpt-4, gpt-3.5-turbo, etc."
              maxLength={100}
              className={errors.deploymentModel ? "border-destructive" : ""}
            />
            {errors.deploymentModel && (
              <p className="text-sm text-destructive">
                {errors.deploymentModel}
              </p>
            )}
          </div>

          {/* API Version field - only show for Azure OpenAI */}
          {(() => {
            const selectedProvider = providers.find(
              (p) => p.id === formData.llmProviderId
            );
            const isAzureOpenAI = selectedProvider?.name === "Azure OpenAI";

            if (!isAzureOpenAI) return null;

            return (
              <div className="space-y-2">
                <Label htmlFor="apiVersion">API Version *</Label>
                <Input
                  id="apiVersion"
                  value={formData.apiVersion || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      apiVersion: e.target.value,
                    }))
                  }
                  placeholder="2024-08-01-preview"
                  maxLength={50}
                  className={errors.apiVersion ? "border-destructive" : ""}
                />
                {errors.apiVersion && (
                  <p className="text-sm text-destructive">
                    {errors.apiVersion}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  API version for Azure OpenAI service (e.g.,
                  2024-08-01-preview)
                </p>
              </div>
            );
          })()}

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="withData"
                checked={formData.withData}
                onCheckedChange={(checked: boolean) =>
                  setFormData((prev) => ({ ...prev, withData: checked }))
                }
              />
              <Label htmlFor="withData" className="text-sm font-medium">
                Enable data integration (RAG)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Allow this agent to use external data sources and documents
            </p>
          </div>

          {/* Embedding Model field - only show when withData is true */}
          {formData.withData && (
            <div className="space-y-2">
              <Label htmlFor="embeddingModel">Embedding Model *</Label>
              <Input
                id="embeddingModel"
                value={formData.embeddingModel || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    embeddingModel: e.target.value,
                  }))
                }
                placeholder="text-embedding-ada-002, text-embedding-3-small, etc."
                maxLength={100}
                className={errors.embeddingModel ? "border-destructive" : ""}
              />
              {errors.embeddingModel && (
                <p className="text-sm text-destructive">
                  {errors.embeddingModel}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Model to use for document embeddings (required for data
                integration)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="instructions">Instructions *</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateInstructions}
                      disabled={isGeneratingInstructions || isLoading}
                      className="h-8 px-3 gap-1.5"
                    >
                      {isGeneratingInstructions ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-xs font-medium">AI Writer</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>
                      Generate AI-powered instructions based on agent name and
                      domain
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({
                  ...prev,
                  instructions: e.target.value,
                }))
              }
              placeholder="You are a helpful assistant..."
              maxLength={2000}
              className={`min-h-[100px] ${
                errors.instructions ? "border-destructive" : ""
              }`}
              disabled={isGeneratingInstructions}
            />
            {errors.instructions && (
              <p className="text-sm text-destructive">{errors.instructions}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === "create" ? "Create Agent" : "Update Agent"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
