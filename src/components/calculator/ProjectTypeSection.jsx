import React from "react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "one-page", title: "One Page Website", description: "Single-page promotional site", price: "from RM1,200" },
  { id: "sme", title: "SMEs Website", description: "Multi-page company website", price: "from RM3,800" },
];

export default function ProjectTypeSection({ value, onChange }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">01. Project Type</h2>
      <p className="mt-1 text-sm text-slate-500">What are you building?</p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map(({ id, title, description, price }) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "relative text-left p-6 rounded-xl border-2 transition-all",
                selected
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">{description}</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{price}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}