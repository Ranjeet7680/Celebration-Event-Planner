import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs font-semibold gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 active:scale-[0.98]",
    secondary:
      "bg-[#171F35] hover:bg-[#1E2945] text-slate-200 border border-slate-700/60 active:scale-[0.98]",
    outline:
      "border border-slate-700 hover:border-violet-500/60 hover:bg-violet-950/20 text-slate-200 active:scale-[0.98]",
    ghost: "text-slate-300 hover:text-white hover:bg-slate-800/60",
    gold: "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/20 active:scale-[0.98]",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-[0.98]",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "violet" | "gold" | "success" | "danger" | "neutral";
  className?: string;
}) {
  const styles = {
    default: "bg-slate-800/80 text-slate-300 border-slate-700",
    violet: "bg-violet-900/40 text-violet-300 border-violet-500/30",
    gold: "bg-amber-950/40 text-amber-300 border-amber-500/30",
    success: "bg-emerald-950/40 text-emerald-300 border-emerald-500/30",
    danger: "bg-rose-950/40 text-rose-300 border-rose-500/30",
    neutral: "bg-slate-800 text-slate-400 border-slate-700/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-[#171F35]/85 border border-slate-800/80 rounded-2xl p-5 shadow-xl transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const titleId = "modal-title-" + title.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const descId = description ? titleId + "-desc" : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-[#171F35] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 id={titleId} className="text-lg font-semibold text-white">
              {title}
            </h3>
            {description && (
              <p id={descId} className="text-xs text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
