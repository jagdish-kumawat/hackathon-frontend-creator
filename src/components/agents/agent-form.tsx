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
import { useLlmProviders, useDomains } from "@/hooks/use-agents";
import {
  CreateAgentRequest,
  UpdateAgentRequest,
  Agent,
} from "@/types/agent-api";
import { Loader2, AlertCircle } from "lucide-react";

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
    deploymentModel: initialData?.deploymentModel || "",
    instructions: initialData?.instructions || "",
    withData: initialData?.withData || false,
  });

  const [customDomain, setCustomDomain] = useState("");
  const [showCustomDomain, setShowCustomDomain] = useState(false);

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

    if (!formData.instructions.trim())
      newErrors.instructions = "Instructions are required";
    if (formData.instructions.length > 2000)
      newErrors.instructions = "Instructions must be 2000 characters or less";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions *</Label>
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
            />
            {errors.instructions && (
              <p className="text-sm text-destructive">{errors.instructions}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="withData"
              checked={formData.withData}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                setFormData((prev) => ({ ...prev, withData: !!checked }))
              }
            />
            <Label htmlFor="withData">Uses additional data</Label>
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
