import React from "react";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  logoSrc,
  backgroundSrc,
  title,
  srTitle,
  subtitle,
  footer,
  flat = false,
  children,
}) {
  // With the logo inside the card, the header block above it can end up empty —
  // skip it entirely so its bottom margin doesn't leave a gap.
  const showHeader = title || subtitle;

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background px-4",
        backgroundSrc && "bg-cover bg-center bg-no-repeat"
      )}
      style={backgroundSrc ? { backgroundImage: `url(${backgroundSrc})` } : undefined}
    >
      <div className="w-full max-w-md">
        {showHeader && (
          <div className="text-center mb-10">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            )}
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
        )}
        {!title && srTitle && <h1 className="sr-only">{srTitle}</h1>}
        <div
          className={cn(
            "bg-card rounded-2xl shadow-sm border border-border p-8",
            flat && "rounded-none shadow-none"
          )}
        >
          {logoSrc && (
            <img src={logoSrc} alt="Orisa Digital" className="h-12 w-auto mx-auto mb-8" />
          )}
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}
