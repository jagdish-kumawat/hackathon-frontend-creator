"use client";

import { FileManagerInterface } from "@/components/file-manager/interface";
import { DashboardNav } from "@/components/dashboard/nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function FileManagerPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="lg:pl-64">
          <FileManagerInterface />
        </main>
      </div>
    </AuthGuard>
  );
}
