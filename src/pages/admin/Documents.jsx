import React from "react";
import { FileText } from "lucide-react";

export default function Documents() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <FileText className="w-12 h-12 text-slate-300 mb-4" />
      <h2 className="text-xl font-semibold text-slate-900">Documents</h2>
      <p className="text-sm text-slate-500 mt-1">Manage your documents here.</p>
    </div>
  );
}