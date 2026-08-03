import React from "react";
import { Receipt } from "lucide-react";

export default function Invoices() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Receipt className="w-12 h-12 text-slate-300 mb-4" />
      <h2 className="text-xl font-semibold text-slate-900">Invoices</h2>
      <p className="text-sm text-slate-500 mt-1">Manage your invoices here.</p>
    </div>
  );
}