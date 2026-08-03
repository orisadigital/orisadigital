import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, sub, icon: Icon, accent = "slate" }) {
  const ACCENTS = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    violet: "bg-violet-100 text-violet-600",
    fuchsia: "bg-fuchsia-100 text-fuchsia-600",
    rose: "bg-rose-100 text-rose-600",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 truncate">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("flex items-center justify-center h-10 w-10 rounded-full shrink-0", ACCENTS[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}