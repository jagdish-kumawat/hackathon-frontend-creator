import { AgentsHeader } from "@/components/agents/header";
import { AgentsTable } from "@/components/agents/table";
import { DashboardNav } from "@/components/dashboard/nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AgentsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="lg:pl-64 container mx-auto px-4 py-8 space-y-8">
          <AgentsHeader />
          <AgentsTable />
        </main>
      </div>
    </AuthGuard>
  );
}
