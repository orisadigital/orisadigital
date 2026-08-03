import React from "react";
import { FOLLOW_UP_STATUSES, FollowUpStatusDot } from "@/components/prospects/FollowUpSheet";

export default function FollowUpStatusLegend({ active, onSelect }) {
  const items = [{ value: "all", label: "All", dot: "bg-cyan-500" }, ...FOLLOW_UP_STATUSES];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
      {items.map((s) => {
        const isActive = active === s.value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onSelect(s.value)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "bg-slate-900 text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FollowUpStatusDot status={s.value} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}