import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardStats } from "@/components/dashboard/stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentAgents } from "@/components/dashboard/recent-agents";
import { DashboardNav } from "@/components/dashboard/nav";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <DashboardHeader />
        <DashboardStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentAgents />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}
