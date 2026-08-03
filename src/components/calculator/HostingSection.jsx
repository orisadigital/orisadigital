import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Server, Leaf, Plus, ShieldCheck, Gauge } from "lucide-react";

export const HOSTING_PLANS = [
  {
    id: "green_2gb",
    title: "2GB SSD Green Energy",
    desc: "Eco-friendly starter hosting",
    features: [
      { label: "2GB SSD disk space", Icon: Server },
      { label: "25GB bandwidth", Icon: Gauge },
      { label: "SSL certificate", Icon: ShieldCheck },
    ],
    prices: { 1: 70, 3: 210 },
    isGreen: true,
  },
  {
    id: "ssd_30gb",
    title: "30GB SSD Hosting",
    desc: "High-performance hosting",
    features: [
      { label: "30GB SSD disk space", Icon: Server },
      { label: "Unmetered bandwidth", Icon: Gauge },
      { label: "SSL certificate", Icon: ShieldCheck },
    ],
    prices: { 1: 150, 3: 450 },
    isGreen: false,
  },
];

export default function HostingSection({ hosting, onChange, plans = HOSTING_PLANS, sectionNumber = "06" }) {
  const { plan: selectedId, duration } = hosting;
  const selectedPlan = plans.find((p) => p.id === selectedId);

  const update = (field, value) => onChange({ ...hosting, [field]: value });

  return (
    <section className="pt-10 border-t border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{sectionNumber}. Hosting</h2>
      <p className="mt-1 text-sm text-slate-500">Add a hosting plan? (Optional)</p>
      <div className="mt-5 space-y-3">
        {plans.map((plan) => {
          const selected = selectedId === plan.id;
          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border-2 transition-all",
                selected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
              )}
            >
              <button
                type="button"
                onClick={() => update("plan", selectedId === plan.id ? null : plan.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  {plan.isGreen ? (
                    <div className="flex items-center">
                      <Server className="h-4 w-4" />
                      <Plus className="h-3 w-3 mx-0.5 text-slate-400" />
                      <Leaf className="h-4 w-4 text-green-600" />
                    </div>
                  ) : (
                    <Server className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{plan.title}</p>
                  <p className="text-xs text-slate-500">{plan.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900">RM{plan.prices[1]}/yr</p>
                </div>
                {selected && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>
              {selected && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="rounded-lg bg-white border border-slate-200 p-4 space-y-2">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <f.Icon className="h-4 w-4 text-slate-400" />
                        {f.label}
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Duration</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {[1, 3].map((d) => {
                        const isSelected = duration === d;
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => update("duration", d)}
                            className={cn(
                              "text-left p-4 rounded-xl border-2 transition-all",
                              isSelected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                          >
                            <p className="font-semibold text-slate-900">{d} Year{d > 1 ? "s" : ""}</p>
                            <p className="text-sm text-slate-500">RM{plan.prices[d]}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}