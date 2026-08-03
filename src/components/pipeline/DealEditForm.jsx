import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PIPELINE_STAGES, STAGE_COLORS, DEAL_SOURCES } from "@/components/pipeline/pipelineStages";
import { Check } from "lucide-react";

export default function DealEditForm({ deal, onSave, onCancel }) {
  const [form, setForm] = useState({
    deal_name: deal.deal_name || "",
    company_name: deal.company_name || "",
    contact_name: deal.contact_name || "",
    contact_number: deal.contact_number || "",
    amount: deal.amount || "",
    stage: deal.stage || "online_prospect",
    inquiry_source: deal.inquiry_source || "website",
    date: deal.date || "",
  });

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(deal.id, {
      ...form,
      amount: parseFloat(form.amount) || 0,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-white p-3 shadow-sm space-y-2.5"
      style={{ borderLeftColor: STAGE_COLORS[form.stage] || "#cbd5e1", borderLeftWidth: 3 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Input value={form.deal_name} onChange={(e) => update("deal_name", e.target.value)} placeholder="Deal Name" className="h-8 text-sm" />
      <Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="Company" className="h-8 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="Contact" className="h-8 text-sm" />
        <Input value={form.contact_number} onChange={(e) => update("contact_number", e.target.value)} placeholder="Number" className="h-8 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" value={form.amount} onChange={(e) => update("amount", e.target.value)} placeholder="Amount" className="h-8 text-sm" />
        <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="h-8 text-sm" />
      </div>
      <Select value={form.inquiry_source} onValueChange={(v) => update("inquiry_source", v)}>
        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {DEAL_SOURCES.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={form.stage} onValueChange={(v) => update("stage", v)}>
        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {PIPELINE_STAGES.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="flex-1 h-8 bg-slate-900 hover:bg-slate-800">
          <Check className="h-3.5 w-3.5 mr-1" />Save
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}