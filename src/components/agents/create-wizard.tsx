"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Bot,
  Stethoscope,
  Headphones,
  Check,
  Mic,
  MessageSquare,
  Volume2,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: "Basics", description: "Name and domain" },
  { id: 2, name: "Template", description: "Choose starting point" },
  { id: 3, name: "Adapters", description: "Select STT, LLM, TTS" },
  { id: 4, name: "Configuration", description: "Prompts and policies" },
  { id: 5, name: "Review", description: "Confirm and create" },
];

const domains = [
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Patient intake, symptoms, medical assistance",
    icon: Stethoscope,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    id: "support",
    name: "Customer Support",
    description: "Help desk, troubleshooting, escalations",
    icon: Headphones,
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  {
    id: "sales",
    name: "Sales & Marketing",
    description: "Lead qualification, product demos",
    icon: Bot,
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Start from scratch with your own requirements",
    icon: Sparkles,
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
];

const templates = [
  {
    id: "healthcare-intake",
    name: "Healthcare Intake Assistant",
    description: "Collect patient information, symptoms, and medical history",
    domain: "healthcare",
    adapters: {
      stt: "Whisper Local",
      llm: "GPT-4 Medical",
      tts: "Azure Neural Voice",
    },
    features: ["HIPAA Compliant", "Medical Terminology", "Symptom Assessment"],
  },
  {
    id: "support-bot",
    name: "Customer Support Agent",
    description:
      "Handle inquiries, troubleshoot issues, and escalate when needed",
    domain: "support",
    adapters: {
      stt: "Google STT",
      llm: "Claude Support",
      tts: "ElevenLabs Professional",
    },
    features: ["Multi-language", "Escalation Logic", "Knowledge Base"],
  },
  {
    id: "blank",
    name: "Blank Agent",
    description: "Start with minimal configuration and build from scratch",
    domain: "custom",
    adapters: {
      stt: "Basic STT",
      llm: "Basic LLM",
      tts: "Basic TTS",
    },
    features: ["Minimal Setup", "Full Customization", "Open Architecture"],
  },
];

const mockAdapters = {
  stt: [
    {
      id: "whisper-local",
      name: "Whisper Local",
      description: "OpenAI Whisper running locally",
      latency: "200ms",
    },
    {
      id: "azure-stt",
      name: "Azure Speech Services",
      description: "Microsoft cloud STT",
      latency: "150ms",
    },
    {
      id: "google-stt",
      name: "Google Cloud Speech",
      description: "Google cloud STT",
      latency: "180ms",
    },
  ],
  llm: [
    {
      id: "gpt4-mock",
      name: "GPT-4 (Mock)",
      description: "Simulated GPT-4 responses",
      latency: "800ms",
    },
    {
      id: "claude-mock",
      name: "Claude (Mock)",
      description: "Simulated Claude responses",
      latency: "600ms",
    },
    {
      id: "llama-local",
      name: "Llama Local",
      description: "Local Llama model",
      latency: "1200ms",
    },
  ],
  tts: [
    {
      id: "elevenlabs-mock",
      name: "ElevenLabs (Mock)",
      description: "Simulated natural voice",
      latency: "400ms",
    },
    {
      id: "azure-tts",
      name: "Azure Neural Voice",
      description: "Microsoft neural TTS",
      latency: "300ms",
    },
    {
      id: "coqui-local",
      name: "Coqui TTS Local",
      description: "Open source local TTS",
      latency: "500ms",
    },
  ],
};

export function CreateAgentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    domain: "",
    template: "",
    adapters: {
      stt: "",
      llm: "",
      tts: "",
    },
    systemPrompt: "",
    policies: {
      redactPII: true,
      languages: ["en"],
    },
  });

  const updateFormData = (updates: any) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="e.g., Healthcare Assistant"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  updateFormData({ description: e.target.value })
                }
                placeholder="Briefly describe what this agent will do..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-4">Domain</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domains.map((domain) => (
                  <Card
                    key={domain.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      formData.domain === domain.id ? "ring-2 ring-primary" : ""
                    )}
                    onClick={() => updateFormData({ domain: domain.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={cn("p-2 rounded-lg", domain.color)}>
                          <domain.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{domain.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {domain.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Choose a Template</h3>
              <div className="space-y-4">
                {templates
                  .filter(
                    (t) =>
                      !formData.domain ||
                      t.domain === formData.domain ||
                      t.domain === "custom"
                  )
                  .map((template) => (
                    <Card
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        formData.template === template.id
                          ? "ring-2 ring-primary"
                          : ""
                      )}
                      onClick={() =>
                        updateFormData({
                          template: template.id,
                          adapters: template.adapters,
                        })
                      }
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>STT: {template.adapters.stt}</span>
                              <span>LLM: {template.adapters.llm}</span>
                              <span>TTS: {template.adapters.tts}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                              {template.features.map((feature) => (
                                <Badge
                                  key={feature}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {formData.template === template.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {Object.entries(mockAdapters).map(([type, adapters]) => (
              <div key={type}>
                <div className="flex items-center space-x-2 mb-4">
                  {type === "stt" && <Mic className="h-5 w-5" />}
                  {type === "llm" && <MessageSquare className="h-5 w-5" />}
                  {type === "tts" && <Volume2 className="h-5 w-5" />}
                  <h4 className="font-medium capitalize">{type} Adapter</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {adapters.map((adapter) => (
                    <Card
                      key={adapter.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        formData.adapters[
                          type as keyof typeof formData.adapters
                        ] === adapter.id
                          ? "ring-2 ring-primary"
                          : ""
                      )}
                      onClick={() =>
                        updateFormData({
                          adapters: {
                            ...formData.adapters,
                            [type]: adapter.id,
                          },
                        })
                      }
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{adapter.name}</h5>
                            {formData.adapters[
                              type as keyof typeof formData.adapters
                            ] === adapter.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {adapter.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {adapter.latency}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                System Prompt
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) =>
                  updateFormData({ systemPrompt: e.target.value })
                }
                placeholder="You are a helpful assistant that..."
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Policies</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.policies.redactPII}
                    onChange={(e) =>
                      updateFormData({
                        policies: {
                          ...formData.policies,
                          redactPII: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className="text-sm">Redact PII in logs</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Your Agent</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p>{formData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Domain
                  </label>
                  <p className="capitalize">{formData.domain}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p>{formData.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Adapters
                </label>
                <div className="space-y-1 mt-1">
                  <p className="text-sm">STT: {formData.adapters.stt}</p>
                  <p className="text-sm">LLM: {formData.adapters.llm}</p>
                  <p className="text-sm">TTS: {formData.adapters.tts}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Agent</h1>
        <p className="text-muted-foreground mt-1">
          Build a new voice agent with our step-by-step wizard
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                  step.id <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.id <= currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-4",
                    step.id < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {steps[currentStep - 1].name}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={
            currentStep === steps.length
              ? () => console.log("Creating agent...", formData)
              : nextStep
          }
        >
          {currentStep === steps.length ? "Create Agent" : "Next"}
          {currentStep < steps.length && (
            <ChevronRight className="h-4 w-4 ml-2" />
          )}
        </Button>
      </div>
    </div>
  );
}
