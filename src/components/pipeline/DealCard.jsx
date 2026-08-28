import React, { useState } from "react";
import DealEditForm from "@/components/pipeline/DealEditForm";

export default function DealCard({ deal, index, onDeleteDeal, onUpdateDeal }) {
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const isLocked = deal.stage === "closed_won";

  if (editing) {
    return (
      <DealEditForm
        deal={deal}
        onSave={(id, updates) => {
          onUpdateDeal(id, updates);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow relative group"
    >
      {!confirming ? (
        <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditing(true)}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-xs p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >Edit</button>
          {!isLocked && (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-xs p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50"
            >Delete</button>
          )}
        </div>
      ) : (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDeleteDeal(deal.id)}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-2 py-0.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            onMouseDown={(e) => e.stopPropagation()}
            className="text-xs p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >Cancel</button>
        </div>
      )}
      <p className="text-sm font-semibold text-slate-900 truncate pr-16">{deal.deal_name}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
        <span className="truncate">{deal.company_name}</span>
      </div>
      {deal.contact_number && (
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="truncate">{deal.contact_number}</span>
        </div>
      )}
      {deal.inquiry_source && (
        <div className="mt-2">
          <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 capitalize">
            {deal.inquiry_source.replace(/_/g, " ")}
          </span>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-900">
          RM{(deal.amount || 0).toLocaleString()}
        </span>
        {deal.date && (
          <span className="text-xs text-slate-400">
            {new Date(deal.date).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}