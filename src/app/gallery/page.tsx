import { GalleryGrid } from "@/components/gallery/grid";
import { DashboardNav } from "@/components/dashboard/nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function GalleryPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="lg:pl-64 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Agent Gallery</h1>
            <p className="text-muted-foreground mt-1">
              Discover and use pre-built agent templates for common use cases
            </p>
          </div>
          <GalleryGrid />
        </main>
      </div>
    </AuthGuard>
  );
}
