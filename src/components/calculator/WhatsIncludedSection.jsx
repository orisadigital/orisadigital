import React from "react";

const FEATURES = [
  { title: "Mobile Responsive", desc: "Optimized for all screen sizes" },
  { title: "Header & Footer", desc: "Site-wide navigation & info" },
  { title: "Premium Blocks", desc: "Sections on page" },
  { title: "CMS / Admin Panel", desc: "Manage your content easily" },
  { title: "Setup Webmaster Email", desc: "Website development account" },
  { title: "Contact Form", desc: "Capture leads & enquiries" },
  { title: "WhatsApp Button", desc: "Direct WhatsApp contact" },
  { title: "Analytics Dashboard", desc: "Track your site performance" },
  { title: "Website Security", desc: "Protection & monitoring" },
];

const PAGES = ["Homepage", "About", "Service", "Contact"];

export default function WhatsIncludedSection() {
  return (
    <section className="pt-10 border-t border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 tracking-tight">02. What's Included</h2>
      <p className="mt-1 text-sm text-slate-500">Features included in your package.</p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURES.map(({ title, desc }) => (
          <div key={title} className="flex items-start gap-3 p-4 rounded-lg border border-slate-200 bg-white">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{title}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
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