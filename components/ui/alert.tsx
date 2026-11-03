import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning";
}

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  const variantStyles = {
    default: "bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-200",
    destructive: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200",
    warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200",
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-xl border p-4 text-sm shadow-sm transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-sm leading-relaxed [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}
