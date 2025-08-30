"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="lg:pl-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Design and manage your voice agent pipelines
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </div>
      </div>
    </div>
  );
}
