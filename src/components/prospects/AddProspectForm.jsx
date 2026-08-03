import React, { useState, useEffect } from "react";
import { UserPlus, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DEAL_SOURCES as SOURCES } from "@/components/pipeline/pipelineStages";

const EMPTY_FORM = {
  prospect_name: "",
  company_name: "",
  contact_email: "",
  contact_number: "",
  inquiry_source: "website",
  notes: "",
  date_received: new Date().toISOString().split("T")[0],
};

export default function AddProspectForm({
  editingProspect,
  onAddProspect,
  onUpdateProspect,
  onCancelEdit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = Boolean(editingProspect);

  useEffect(() => {
    if (editingProspect) {
      setForm({
        prospect_name: editingProspect.prospect_name || "",
        company_name: editingProspect.company_name || "",
        contact_email: editingProspect.contact_email || "",
        contact_number: editingProspect.contact_number || "",
        inquiry_source: editingProspect.inquiry_source || "website",
        notes: editingProspect.notes || "",
        date_received: editingProspect.date_received || new Date().toISOString().split("T")[0],
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingProspect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const isDealOrigin = editingProspect?._origin === "deal";
    if (!form.prospect_name || (!isDealOrigin && !form.contact_email)) return;
    if (isEditing) {
      onUpdateProspect?.({ ...editingProspect, ...form });
    } else {
      onAddProspect?.({ ...form, status: "new" });
      setForm(EMPTY_FORM);
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    onCancelEdit?.();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        {isEditing ? (
          <Save className="h-4 w-4 text-slate-500" />
        ) : (
          <UserPlus className="h-4 w-4 text-slate-500" />
        )}
        <h3 className="text-sm font-semibold text-slate-900">
          {isEditing ? "Edit Prospect" : "Add Prospect"}
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div>
          <Label className="text-xs text-slate-500">Prospect Name *</Label>
          <Input
            value={form.prospect_name}
            onChange={(e) => setForm({ ...form, prospect_name: e.target.value })}
            className="mt-1 h-8 text-sm"
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Company</Label>
          <Input
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className="mt-1 h-8 text-sm"
            placeholder="Acme Inc."
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Email *</Label>
          <Input
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            className="mt-1 h-8 text-sm"
            placeholder="john@acme.com"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Phone</Label>
          <Input
            value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
            className="mt-1 h-8 text-sm"
            placeholder="+60 12-345 6789"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Source</Label>
          <select
            value={form.inquiry_source}
            onChange={(e) => setForm({ ...form, inquiry_source: e.target.value })}
            className="mt-1 h-8 w-full text-sm rounded-md border border-input bg-transparent px-3"
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs text-slate-500">Date Received</Label>
          <Input
            type="date"
            value={form.date_received}
            onChange={(e) => setForm({ ...form, date_received: e.target.value })}
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500">Notes</Label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="mt-1 w-full text-sm rounded-md border border-input bg-transparent px-3 py-1.5 min-h-[60px]"
            placeholder="Initial inquiry details..."
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" className="flex-1 bg-slate-900 hover:bg-slate-800">
            {isEditing ? (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                Add Prospect
              </>
            )}
          </Button>
          {isEditing && (
            <Button type="button" size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}