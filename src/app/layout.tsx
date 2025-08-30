import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MockAuthProvider } from "@/components/providers/mock-auth-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Voice Agent Creator Portal",
  description: "Design, configure, and simulate modular voice agent pipelines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MockAuthProvider>{children}</MockAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
