"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "login" | "register";
}

export function AuthModal({
  isOpen,
  onClose,
  defaultView = "login",
}: AuthModalProps) {
  const [view, setView] = useState<"login" | "register">(defaultView);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
    // Redirect to dashboard after successful login/register
    window.location.href = "/dashboard";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {view === "login" ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setView("register")}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setView("login")}
          />
        )}
      </div>
    </div>
  );
}
