import React from "react";
import { Slider } from "@/components/ui/slider";

export default function AddOnSliderPanel({ count, onChange, max = 10, unitPrice, label = "items" }) {
  const cost = count * unitPrice;
  return (
    <div className="px-4 pb-4 pt-3 border-t border-slate-200">
      <div className="flex items-end justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="text-2xl font-bold text-slate-900">{count}</span>
      </div>
      <div className="mt-3">
        <Slider
          value={[count]}
          onValueChange={(v) => onChange(v[0])}
          min={1}
          max={max}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>1</span>
          <span>{max}</span>
        </div>
      </div>
      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900">
        {count} × RM{unitPrice} = RM{cost.toLocaleString()}
      </div>
    </div>
  );
}