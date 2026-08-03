import React from "react";
import {
  Smartphone,
  Menu,
  LayoutGrid,
  Settings,
  Mail,
  FileText,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  Check,
} from "lucide-react";

const FEATURES = [
  { title: "Mobile Responsive", desc: "Optimized for all screen sizes", Icon: Smartphone },
  { title: "Header & Footer", desc: "Site-wide navigation & info", Icon: Menu },
  { title: "Premium Blocks", desc: "Sections on page", Icon: LayoutGrid },
  { title: "CMS / Admin Panel", desc: "Manage your content easily", Icon: Settings },
  { title: "Setup Webmaster Email", desc: "Website development account", Icon: Mail },
  { title: "Contact Form", desc: "Capture leads & enquiries", Icon: FileText },
  { title: "WhatsApp Button", desc: "Direct WhatsApp contact", Icon: MessageCircle },
  { title: "Analytics Dashboard", desc: "Track your site performance", Icon: BarChart3 },
  { title: "Website Security", desc: "Protection & monitoring", Icon: ShieldCheck },
];

const PAGES = ["Homepage", "About", "Service", "Contact"];

export default function WhatsIncludedSection() {
  return (
    <section className="pt-10 border-t border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">02. What's Included</h2>
      <p className="mt-1 text-sm text-slate-500">Features included in your package.</p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURES.map(({ title, desc, Icon }) => (
          <div key={title} className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <Check className="h-4 w-4 text-green-500 ml-auto shrink-0" />
          </div>
        ))}
      </div>
      <div className="mt-4 p-5 rounded-xl border border-slate-200 bg-slate-50">
        <p className="text-sm font-semibold text-slate-900">Basic 4 Pages</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PAGES.map((p) => (
            <span
              key={p}
              className="inline-flex items-center rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}