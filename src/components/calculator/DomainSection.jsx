import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const DOMAIN_EXTENSIONS = [
  { id: "com", label: ".com", desc: "Global standard domain", price: 55.9 },
  { id: "com_my", label: ".com.my", desc: "Popular commercial", price: 58.9 },
  { id: "org_my", label: ".org.my", desc: "Organization domain", price: 58.9 },
  { id: "my", label: ".my", desc: "Malaysian premium", price: 88.9 },
];
export const DOMAIN_SERVICE_CHARGE = 20;
export const DOMAIN_TAX_RATE = 0.08;

export default function DomainSection({ domain, onChange, sectionNumber = "05" }) {
  const { extension, duration } = domain;
  const selectedExt = DOMAIN_EXTENSIONS.find((e) => e.id === extension);
  const domainPrice = selectedExt ? selectedExt.price * duration : 0;
  const tax = domainPrice * DOMAIN_TAX_RATE;
  const total = selectedExt ? domainPrice + tax + DOMAIN_SERVICE_CHARGE : 0;

  const update = (field, value) => onChange({ ...domain, [field]: value });

  return (
    <section className="pt-10 border-t border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{sectionNumber}. Domain</h2>
      <p className="mt-1 text-sm text-slate-500">Register your domain (optional).</p>

      <div className="mt-5">
        <Label className="text-sm font-medium text-slate-700">Extension</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {DOMAIN_EXTENSIONS.map((ext) => {
            const selected = extension === ext.id;
            return (
              <button
                key={ext.id}
                type="button"
                onClick={() => update("extension", extension === ext.id ? null : ext.id)}
                className={cn(
                  "relative text-left p-4 rounded-xl border-2 transition-all",
                  selected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                {selected && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <p className="font-semibold text-slate-900">{ext.label}</p>
                <p className="text-xs text-slate-500">{ext.desc}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">RM{ext.price.toFixed(2)}/yr</p>
              </button>
            );
          })}
        </div>
      </div>

      {selectedExt && (
        <>
          <div className="mt-5">
            <Label className="text-sm font-medium text-slate-700">Duration</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[1, 3].map((d) => {
                const selected = duration === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update("duration", d)}
                    className={cn(
                      "text-left p-4 rounded-xl border-2 transition-all",
                      selected ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <p className="font-semibold text-slate-900">{d} Year{d > 1 ? "s" : ""}</p>
                    <p className="text-sm text-slate-500">RM{(selectedExt.price * d).toFixed(2)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Domain ({selectedExt.label}, {duration} yr{duration > 1 ? "s" : ""})</span>
              <span className="font-medium text-slate-900">RM{domainPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tax (8%)</span>
              <span className="font-medium text-slate-900">RM{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service Charge</span>
              <span className="font-medium text-slate-900">RM{DOMAIN_SERVICE_CHARGE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <span className="font-semibold text-slate-900">Domain Total</span>
              <span className="font-bold text-slate-900">RM{total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}