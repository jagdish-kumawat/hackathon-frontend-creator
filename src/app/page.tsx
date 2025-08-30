"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Mic,
  Brain,
  Volume2,
  ArrowRight,
  Users,
  Zap,
  Shield,
  CheckCircle,
  Star,
  Play,
  Headphones,
  MessageSquare,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

export default function HomePage() {
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();

  // Ensure theme is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    console.log(
      "Component mounted, theme:",
      theme,
      "systemTheme:",
      systemTheme
    );
  }, [theme, systemTheme]);

  const toggleTheme = () => {
    if (!mounted) {
      console.log("Not mounted yet, ignoring toggle");
      return;
    }

    const currentTheme = theme === "system" ? systemTheme : theme;
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    console.log("Toggling theme:", {
      current: currentTheme,
      new: newTheme,
      theme,
      systemTheme,
    });
    setTheme(newTheme);
  };

  const handleLogin = async () => {
    setIsLoginLoading(true);
    try {
      await login();
      // Redirect will be handled by auth guard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoginLoading(false);
    }
  };

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Debug info - remove in production */}
      {mounted && (
        <div className="fixed top-4 right-4 z-50 bg-black/10 dark:bg-white/10 text-xs p-2 rounded">
          Theme: {theme} | System: {systemTheme} | Resolved:{" "}
          {theme === "system" ? systemTheme : theme}
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VoiceAI Creator
            </span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="#features">Features</Link>
            </Button>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="#pricing">Pricing</Link>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              disabled={!mounted}
              className="relative"
              title={`Current theme: ${theme}, System: ${systemTheme}`}
            >
              {mounted ? (
                <>
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </>
              ) : (
                <div className="h-4 w-4 animate-pulse bg-gray-300 rounded" />
              )}
              <span className="sr-only">Toggle theme (Current: {theme})</span>
            </Button>

            <Button
              onClick={handleLogin}
              disabled={isLoginLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span className="hidden sm:inline">Signing in...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    Sign in with Microsoft
                  </span>
                  <span className="sm:hidden">Sign in</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          <Badge
            variant="secondary"
            className="mb-6 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          >
            🚀 Now with Microsoft Entra ID Integration
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Build Voice Agents
            <br />
            Without Code
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create powerful voice assistants with our drag-and-drop pipeline
            editor. Connect STT, LLM, and TTS components to build custom
            conversational AI experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={handleLogin}
              disabled={isLoginLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
            >
              {isLoginLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Getting Started...
                </>
              ) : (
                <>
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Pipeline Visualization */}
          <div className="relative max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-green-700 dark:text-green-300">
                    Speech-to-Text
                  </CardTitle>
                  <CardDescription>
                    Convert voice to text with high accuracy
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-700 dark:text-blue-300">
                    Large Language Model
                  </CardTitle>
                  <CardDescription>
                    Process and generate intelligent responses
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="relative bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-purple-700 dark:text-purple-300">
                    Text-to-Speech
                  </CardTitle>
                  <CardDescription>
                    Generate natural-sounding voice output
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Connection arrows for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/4 transform -translate-y-1/2">
              <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <div className="hidden md:block absolute top-1/2 right-1/4 transform -translate-y-1/2">
              <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 bg-white/50 dark:bg-gray-900/50"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Everything You Need to Build Voice Agents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful tools and integrations for every step of your voice AI
              journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Settings className="w-10 h-10 text-blue-600 mb-4" />
                <CardTitle>Visual Pipeline Editor</CardTitle>
                <CardDescription>
                  Drag and drop components to build complex voice workflows
                  without writing code
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Headphones className="w-10 h-10 text-green-600 mb-4" />
                <CardTitle>Real-time Testing</CardTitle>
                <CardDescription>
                  Test your voice agents instantly with our built-in playground
                  and simulation engine
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MessageSquare className="w-10 h-10 text-purple-600 mb-4" />
                <CardTitle>Pre-built Templates</CardTitle>
                <CardDescription>
                  Start with industry-specific templates for healthcare,
                  support, sales, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="w-10 h-10 text-orange-600 mb-4" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Share agents, collaborate on designs, and manage permissions
                  with your team
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="w-10 h-10 text-yellow-600 mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Optimized performance with sub-second response times and
                  real-time streaming
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Microsoft Entra ID integration with enterprise-grade security
                  and compliance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Your First Voice Agent?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers and businesses creating the future of
            conversational AI
          </p>
          <Button
            size="lg"
            onClick={handleLogin}
            disabled={isLoginLoading}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 font-semibold"
          >
            {isLoginLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                Signing in with Microsoft...
              </>
            ) : (
              <>
                Start Building Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">VoiceAI Creator</span>
              </div>
              <p className="text-gray-400">
                Build the future of conversational AI with our no-code voice
                agent platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VoiceAI Creator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
