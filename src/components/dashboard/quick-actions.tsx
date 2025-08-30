"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle,
  Palette,
  Zap,
  FileText,
  Play,
  Settings,
  Import,
  BookOpen,
} from "lucide-react";

const actions = [
  {
    title: "New Agent",
    description: "Create a new voice agent from scratch",
    icon: PlusCircle,
    href: "/agents/new",
    variant: "default" as const,
  },
  {
    title: "Browse Templates",
    description: "Start from healthcare or support templates",
    icon: Palette,
    href: "/gallery",
    variant: "outline" as const,
  },
  {
    title: "Install Adapter",
    description: "Add new STT, LLM, or TTS adapters",
    icon: Zap,
    href: "/plugins",
    variant: "outline" as const,
  },
  {
    title: "Import Agent",
    description: "Upload an existing agent configuration",
    icon: Import,
    href: "#",
    variant: "outline" as const,
  },
  {
    title: "Test Playground",
    description: "Try out your agents with mock simulation",
    icon: Play,
    href: "/playground",
    variant: "outline" as const,
  },
  {
    title: "Read Docs",
    description: "Learn about building voice agents",
    icon: BookOpen,
    href: "/docs",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Button
              variant={action.variant}
              className="w-full justify-start h-auto p-4"
            >
              <div className="flex items-start space-x-3">
                <action.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
