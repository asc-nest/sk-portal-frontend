import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  className,
  children,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const sizeStyles = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl font-bold",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border-2 border-emerald-500/20 bg-slate-100 shadow-sm dark:bg-slate-800",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children ? (
        children
      ) : src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-semibold text-emerald-800 dark:text-emerald-300 uppercase">
          {fallback ? fallback.slice(0, 2) : "SK"}
        </span>
      )}
    </div>
  );
}

export function AvatarImage({
  src,
  alt = "",
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center font-semibold text-emerald-800 dark:text-emerald-300 uppercase",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
