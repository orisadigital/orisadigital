import React from "react";
import { Slider } from "@/components/ui/slider";

export default function PagesSection({ pages, onChange, extraPagePrice = 400 }) {
  const extra = Math.max(0, pages - 4);
  const extraCost = extra * extraPagePrice;

  return (
    <section className="pt-10 border-t border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">03. Pages</h2>
      <div className="mt-5 flex items-end justify-between">
        <p className="text-sm text-slate-500">Number of pages</p>
        <span className="text-3xl font-bold text-slate-900">{pages}</span>
      </div>
      <div className="mt-4">
        <Slider
          value={[pages]}
          onValueChange={(v) => onChange(v[0])}
          min={4}
          max={50}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>4</span>
          <span>50</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        First 4 pages included — each additional page adds RM{extraPagePrice}.
      </p>
      {extra > 0 && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900">
          {extra} extra page{extra > 1 ? "s" : ""} = RM{extraCost.toLocaleString()}
        </div>
      )}
    </section>
  );
}