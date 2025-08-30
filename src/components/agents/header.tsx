"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, Download, Upload } from "lucide-react";
import Link from "next/link";

export function AgentsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Voice Agents</h1>
        <p className="text-muted-foreground mt-1">
          Manage and configure your voice agent pipelines
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button asChild>
          <Link href="/agents/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Agent
          </Link>
        </Button>
      </div>
    </div>
  );
}
