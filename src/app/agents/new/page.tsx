"use client";

import { useState } from "react";
import { DashboardNav } from "@/components/dashboard/nav";
import { CreateAgentWizard } from "@/components/agents/create-wizard";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function NewAgentPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="lg:pl-64 container mx-auto px-4 py-8">
          <CreateAgentWizard />
        </main>
      </div>
    </AuthGuard>
  );
}
