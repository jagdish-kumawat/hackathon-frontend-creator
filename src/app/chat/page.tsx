import { ChatInterface } from "@/components/chat/chat-interface";
import { DashboardNav } from "@/components/dashboard/nav";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ChatPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="lg:pl-64">
          <ChatInterface />
        </main>
      </div>
    </AuthGuard>
  );
}
