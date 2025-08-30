import { PlaygroundInterface } from "@/components/playground/interface";
import { DashboardNav } from "@/components/dashboard/nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function PlaygroundPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="lg:pl-64 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Voice Agent Playground</h1>
            <p className="text-muted-foreground mt-1">
              Test and simulate your voice agents in real-time
            </p>
          </div>
          <PlaygroundInterface />
        </main>
      </div>
    </AuthGuard>
  );
}
