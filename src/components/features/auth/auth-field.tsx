"use client";

import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthField({
  label,
  name,
  type = "text",
  icon: Icon,
  required,
  minLength,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  icon?: LucideIcon;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="relative mt-2">
        {Icon && (
          <Icon
            className="pointer-events-none absolute start-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
        )}
        <input
          name={name}
          type={inputType}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            "input-hr",
            Icon && "input-hr--leading-icon",
            isPassword && "input-hr--trailing-icon"
          )}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute end-3 top-1/2 z-10 -translate-y-1/2 text-muted transition hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </label>
  );
}
