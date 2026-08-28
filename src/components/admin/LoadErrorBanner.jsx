import React from "react";
import { cn } from "@/lib/utils";

/**
 * Shown when a page's initial fetch fails.
 *
 * Without it a failed load is indistinguishable from an empty one: the catch
 * clears the spinner, the list state stays empty, and the page cheerfully
 * reports "no records yet". Pages pair this with disabling their create
 * actions — writing is pointless while reading is broken.
 */
export default function LoadErrorBanner({ label, error, className }) {
  // Returning null before anything renders keeps callers free to pass spacing
  // classes without leaving an empty gap on the happy path.
  if (!error) return null;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-3",
        className
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-rose-900">Could not load {label}</p>
        <p className="text-xs text-rose-700 mt-0.5 break-words">{error}</p>
        <p className="text-xs text-rose-600/80 mt-1">
          This is a loading failure, not an empty list — nothing has been deleted. Reload to try again.
        </p>
      </div>
    </div>
  );
}
