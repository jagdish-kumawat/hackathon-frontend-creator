import { DashboardNav } from "@/components/dashboard/nav";
import { AuthGuard } from "@/components/auth/auth-guard";
import { UserProfile } from "@/components/user/user-profile-safe";
import { UserStatsComponent } from "@/components/user/user-stats";
import { UserApiDebug } from "@/components/user/user-api-debug";
import { ProductionReadinessStatus } from "@/components/user/production-status";
import { DevOnly } from "@/lib/dev-utils";

export default function UserManagementPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="lg:pl-64">
          <div className="container mx-auto px-4 py-8 space-y-8 lg:py-6 pt-20 lg:pt-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage your user profile and view user statistics
              </p>
            </div>

            <div className="space-y-8">
              <UserProfile />
              <UserStatsComponent />
              <ProductionReadinessStatus />
              <DevOnly>
                <UserApiDebug />
              </DevOnly>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
