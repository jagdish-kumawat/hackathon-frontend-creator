/**
 * Production-safe logger utility
 * Only logs in development mode or when explicitly enabled
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface Logger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

class ProductionSafeLogger implements Logger {
  private isEnabled(level: LogLevel): boolean {
    // Always allow errors and warnings
    if (level === "error" || level === "warn") {
      return true;
    }

    // Allow debug and info only in development or when explicitly enabled
    return (
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true"
    );
  }

  debug(...args: any[]): void {
    if (this.isEnabled("debug")) {
      console.debug("[DEBUG]", ...args);
    }
  }

  info(...args: any[]): void {
    if (this.isEnabled("info")) {
      console.info("[INFO]", ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.isEnabled("warn")) {
      console.warn("[WARN]", ...args);
    }
  }

  error(...args: any[]): void {
    if (this.isEnabled("error")) {
      console.error("[ERROR]", ...args);
    }
  }
}

// Export a singleton instance
export const logger = new ProductionSafeLogger();

// Helper function to conditionally execute debug code
export function runInDevelopment(fn: () => void): void {
  if (process.env.NODE_ENV === "development") {
    fn();
  }
}
