import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PIPELINE_STAGES, DEAL_SOURCES } from "@/components/pipeline/pipelineStages";
import { Plus } from "lucide-react";

const todayStr = () => new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  deal_name: "",
  company_name: "",
  contact_name: "",
  contact_number: "",
  amount: "",
  stage: "online_prospect",
  inquiry_source: "website",
  date: todayStr(),
  };

export default function AddDealForm({ onAddDeal }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.deal_name || !form.company_name) return;
    onAddDeal({
      ...form,
      amount: parseFloat(form.amount) || 0,
    });
    setForm({ ...EMPTY_FORM });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Add Deal</h2>
      <p className="mt-1 text-sm text-slate-500">Create a new pipeline deal.</p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label className="text-sm font-medium text-slate-700">Deal Name</Label>
          <Input
            value={form.deal_name}
            onChange={(e) => update("deal_name", e.target.value)}
            placeholder="e.g. ABC Corp Website"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700">Company Name</Label>
          <Input
            value={form.company_name}
            onChange={(e) => update("company_name", e.target.value)}
            placeholder="e.g. ABC Corp Sdn Bhd"
            className="mt-1.5"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-slate-700">Contact Name</Label>
            <Input
              value={form.contact_name}
              onChange={(e) => update("contact_name", e.target.value)}
              placeholder="John Doe"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700">Contact Number</Label>
            <Input
              value={form.contact_number}
              onChange={(e) => update("contact_number", e.target.value)}
              placeholder="012-345 6789"
              className="mt-1.5"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-slate-700">Amount (RM)</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="3800"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700">Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700">Source</Label>
          <Select value={form.inquiry_source} onValueChange={(v) => update("inquiry_source", v)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEAL_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700">Stage</Label>
          <Select value={form.stage} onValueChange={(v) => update("stage", v)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </form>
    </div>
  );
}