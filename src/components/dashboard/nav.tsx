"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Bot,
  Settings,
  Sun,
  Moon,
  Menu,
  Command,
  Search,
  Bell,
  User,
  Zap,
  Palette,
  BookOpen,
  MoreHorizontal,
  LogOut,
  FolderOpen,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Bot },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Gallery", href: "/gallery", icon: Palette },
  { name: "File Manager", href: "/file-manager", icon: FolderOpen },
  { name: "Plugins", href: "/plugins", icon: Zap },
  { name: "Playground", href: "/playground", icon: Command },
  {
    name: "User Management",
    href: "/user-management",
    icon: User,
  },
  { name: "Docs", href: "/docs", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardNav() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b">
            <Bot className="h-8 w-8 text-primary" />
            <span className="ml-2 text-lg font-semibold">Voice Creator</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname === "/" && item.href === "/dashboard");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Theme toggle */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-full"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              Toggle theme
            </Button>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="lg:pl-64 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search agents, adapters, docs..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Command className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Profile with Logout */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.fullName || user?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.username || "Authenticated"}
                </p>
              </div>
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={logout}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
