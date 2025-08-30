"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Design and manage your voice agent pipelines
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="flex-1 sm:flex-none">
          <Sparkles className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Templates</span>
          <span className="sm:hidden">Browse</span>
        </Button>
        <Button className="flex-1 sm:flex-none">
          <PlusCircle className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New Agent</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>
    </div>
  );
}
