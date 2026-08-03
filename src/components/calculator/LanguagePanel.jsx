import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "malay", label: "Malay" },
  { id: "chinese", label: "Chinese" },
];

export default function LanguagePanel({ languages, onChange, pages, perPage = 25 }) {
  const selectedList = LANGUAGES.filter((l) => languages[l.id]).map((l) => l.label);
  const additionalCount = Math.max(0, selectedList.length - 1);
  const cost = additionalCount * pages * perPage;

  const toggle = (id) => onChange({ ...languages, [id]: !languages[id] });

  return (
    <div className="px-4 pb-4 pt-3 border-t border-slate-200 space-y-4">
      <div className="space-y-2">
        {LANGUAGES.map(({ id, label }) => (
          <div key={id} className="flex items-center gap-3">
            <Checkbox
              id={`lang-${id}`}
              checked={!!languages[id]}
              onCheckedChange={() => toggle(id)}
            />
            <Label htmlFor={`lang-${id}`} className="text-sm font-normal cursor-pointer">
              {label}
            </Label>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 italic">
        1 main language is included in the base package. Each additional language costs RM{perPage} × number of pages.
      </p>
      {selectedList.length > 0 && (
        <div className="rounded-lg bg-slate-100 p-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Selected languages</span>
            <span className="font-medium text-slate-900">{selectedList.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Add-on languages</span>
            <span className="font-medium text-slate-900">{additionalCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Pages × RM{perPage}</span>
            <span className="font-medium text-slate-900">{pages} × RM{perPage}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-slate-200">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-bold text-slate-900">RM{cost.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}