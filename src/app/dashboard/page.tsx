import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardStats } from "@/components/dashboard/stats";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentAgents } from "@/components/dashboard/recent-agents";
import { DashboardNav } from "@/components/dashboard/nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="lg:pl-64">
          <div className="container mx-auto px-4 py-8 space-y-8 lg:py-6 pt-20 lg:pt-6">
            <DashboardHeader />
            <DashboardStats />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <RecentAgents />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
