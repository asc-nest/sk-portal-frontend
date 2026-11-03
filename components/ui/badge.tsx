import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default:
      "bg-emerald-600/10 text-emerald-700 border-emerald-600/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
    secondary:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    success:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300",
    warning:
      "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300",
    destructive:
      "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300",
    outline: "text-slate-900 border-slate-300 dark:text-slate-100 dark:border-slate-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
