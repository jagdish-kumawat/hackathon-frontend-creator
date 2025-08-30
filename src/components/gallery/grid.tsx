"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Headphones,
  Users,
  ShoppingCart,
  Building2,
  GraduationCap,
  Download,
  Star,
  Eye,
  Clock,
} from "lucide-react";

const templates = [
  {
    id: "healthcare-intake",
    name: "Healthcare Intake Assistant",
    description:
      "Comprehensive patient intake system with symptom assessment and medical history collection. HIPAA compliant with medical terminology support.",
    domain: "Healthcare",
    icon: Stethoscope,
    color: "bg-blue-500",
    features: [
      "HIPAA Compliant",
      "Medical Terminology",
      "Symptom Assessment",
      "Multi-language",
    ],
    adapters: {
      stt: "Whisper Medical",
      llm: "GPT-4 Medical",
      tts: "Azure Neural Voice",
    },
    stats: {
      downloads: 1200,
      rating: 4.8,
      lastUpdated: "2 days ago",
    },
    preview:
      "Hello, I'm here to help with your medical intake. Can you tell me about your symptoms?",
  },
  {
    id: "customer-support",
    name: "Customer Support Agent",
    description:
      "Advanced customer service bot with escalation logic, sentiment analysis, and knowledge base integration.",
    domain: "Support",
    icon: Headphones,
    color: "bg-green-500",
    features: [
      "Escalation Logic",
      "Sentiment Analysis",
      "KB Integration",
      "Multi-channel",
    ],
    adapters: {
      stt: "Google STT",
      llm: "Claude Support",
      tts: "ElevenLabs Professional",
    },
    stats: {
      downloads: 2100,
      rating: 4.9,
      lastUpdated: "1 week ago",
    },
    preview:
      "Hi! I'm here to help resolve any issues you might have. What can I assist you with today?",
  },
  {
    id: "sales-assistant",
    name: "Sales Qualification Bot",
    description:
      "Lead qualification and product recommendation system with CRM integration and conversion tracking.",
    domain: "Sales",
    icon: ShoppingCart,
    color: "bg-purple-500",
    features: [
      "Lead Qualification",
      "Product Matching",
      "CRM Integration",
      "Analytics",
    ],
    adapters: {
      stt: "Azure STT",
      llm: "GPT-4 Sales",
      tts: "Amazon Polly",
    },
    stats: {
      downloads: 890,
      rating: 4.6,
      lastUpdated: "3 days ago",
    },
    preview:
      "Welcome! I'd love to help you find the perfect solution for your needs. What are you looking for?",
  },
  {
    id: "hr-onboarding",
    name: "HR Onboarding Assistant",
    description:
      "Streamline employee onboarding with automated paperwork, policy explanations, and Q&A support.",
    domain: "Human Resources",
    icon: Users,
    color: "bg-orange-500",
    features: [
      "Document Processing",
      "Policy Q&A",
      "Progress Tracking",
      "Compliance",
    ],
    adapters: {
      stt: "Whisper Local",
      llm: "GPT-4 HR",
      tts: "Azure Neural Voice",
    },
    stats: {
      downloads: 650,
      rating: 4.7,
      lastUpdated: "5 days ago",
    },
    preview:
      "Welcome to the team! I'm here to help you through your onboarding process. Let's get started!",
  },
  {
    id: "education-tutor",
    name: "AI Tutor Assistant",
    description:
      "Personalized learning assistant with adaptive questioning, progress tracking, and curriculum alignment.",
    domain: "Education",
    icon: GraduationCap,
    color: "bg-indigo-500",
    features: [
      "Adaptive Learning",
      "Progress Tracking",
      "Curriculum Aligned",
      "Multi-subject",
    ],
    adapters: {
      stt: "Google STT",
      llm: "GPT-4 Education",
      tts: "ElevenLabs Natural",
    },
    stats: {
      downloads: 780,
      rating: 4.5,
      lastUpdated: "1 week ago",
    },
    preview:
      "Hi there! I'm your learning assistant. What subject would you like to explore today?",
  },
  {
    id: "property-assistant",
    name: "Real Estate Assistant",
    description:
      "Property inquiry handler with listing integration, appointment scheduling, and lead capture.",
    domain: "Real Estate",
    icon: Building2,
    color: "bg-teal-500",
    features: [
      "Listing Integration",
      "Appointment Scheduling",
      "Lead Capture",
      "Market Data",
    ],
    adapters: {
      stt: "Azure STT",
      llm: "Claude Real Estate",
      tts: "Amazon Polly",
    },
    stats: {
      downloads: 420,
      rating: 4.4,
      lastUpdated: "4 days ago",
    },
    preview:
      "Hello! I can help you find your perfect home. What type of property are you looking for?",
  },
];

export function GalleryGrid() {
  const handleUseTemplate = (template: any) => {
    console.log("Using template:", template.id);
    // This would navigate to agent creation with the template pre-filled
  };

  const handlePreview = (template: any) => {
    console.log("Previewing template:", template.id);
    // This would open a preview modal or page
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="group hover:shadow-lg transition-all duration-200"
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${template.color} bg-opacity-10`}>
                <template.icon
                  className={`h-6 w-6 ${template.color.replace(
                    "bg-",
                    "text-"
                  )}`}
                />
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.stats.rating}</span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Download className="h-3 w-3" />
                  <span>{template.stats.downloads}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {template.name}
              </CardTitle>
              <Badge variant="outline" className="w-fit">
                {template.domain}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {template.description}
            </p>

            <div className="space-y-3">
              <div>
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Features
                </h5>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="text-xs"
                    >
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Pipeline
                </h5>
                <div className="text-xs space-y-1">
                  <div>STT: {template.adapters.stt}</div>
                  <div>LLM: {template.adapters.llm}</div>
                  <div>TTS: {template.adapters.tts}</div>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <h5 className="text-xs font-medium mb-1">Sample Interaction</h5>
                <p className="text-xs text-muted-foreground italic">
                  &ldquo;{template.preview}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Updated {template.stats.lastUpdated}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                size="sm"
                onClick={() => handlePreview(template)}
                variant="outline"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => handleUseTemplate(template)}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
