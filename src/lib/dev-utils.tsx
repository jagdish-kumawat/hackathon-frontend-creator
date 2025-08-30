"use client";

import React, { ReactNode } from "react";

interface DevOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders its children in development mode.
 * In production, it renders the fallback (or nothing if no fallback provided).
 */
export function DevOnly({ children, fallback = null }: DevOnlyProps) {
  // Only render children in development mode
  if (process.env.NODE_ENV !== "development") {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if we're in development mode
 */
export function useIsDevelopment() {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if debug features should be enabled
 * Can be overridden with NEXT_PUBLIC_ENABLE_DEBUG environment variable
 */
export function isDebugEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true"
  );
}
