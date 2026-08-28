import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { DEAL_SOURCES } from "@/components/pipeline/pipelineStages";

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <Label className="text-xs text-slate-500">
        {label}{required && " *"}
      </Label>
      {children}
    </div>
  );
}

const inputCls = "mt-1 h-9 text-sm";

export default function ClientAddSheet({ open, onCreate, onClose }) {
  const [form, setForm] = useState({
    client_name: "",
    contact_position: "",
    contact_email: "",
    contact_number: "",
    company_name: "",
    company_industry: "",
    company_reg_number: "",
    company_website: "",
    company_address: "",
    inquiry_source: "website",
    status: "active",
    amount: 0,
    notes: "",
    converted_from: "prospect",
    date_converted: new Date().toISOString().split("T")[0],
  });

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate?.(form);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose?.()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Client</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Primary Contact */}
          <section className="space-y-3">
            <SectionHeader  title="Primary Contact" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" required>
                <Input value={form.client_name} onChange={set("client_name")} className={inputCls} />
              </Field>
              <Field label="Position">
                <Input value={form.contact_position} onChange={set("contact_position")} className={inputCls} placeholder="Director" />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.contact_email} onChange={set("contact_email")} className={inputCls} />
              </Field>
              <Field label="Phone">
                <Input value={form.contact_number} onChange={set("contact_number")} className={inputCls} />
              </Field>
            </div>
          </section>

          {/* Company Information */}
          <section className="space-y-3">
            <SectionHeader  title="Company Information" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company Name">
                <Input value={form.company_name} onChange={set("company_name")} className={inputCls} />
              </Field>
              <Field label="Industry">
                <Input value={form.company_industry} onChange={set("company_industry")} className={inputCls} placeholder="Manufacturing" />
              </Field>
              <Field label="Reg. No">
                <Input value={form.company_reg_number} onChange={set("company_reg_number")} className={inputCls} />
              </Field>
              <Field label="Sale Amount (RM)">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className={inputCls}
                  placeholder="0.00"
                />
              </Field>
              <Field label="Website">
                <Input value={form.company_website} onChange={set("company_website")} className={inputCls} placeholder="www.company.com" />
              </Field>
              <div className="col-span-2">
                <Field label="Address">
                  <Input value={form.company_address} onChange={set("company_address")} className={inputCls} />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Inquiry Source">
                  <select
                    value={form.inquiry_source}
                    onChange={set("inquiry_source")}
                    className="mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3"
                  >
                    {DEAL_SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-3">
            <SectionHeader  title="Notes" />
            <textarea
              value={form.notes}
              onChange={set("notes")}
              className="mt-1 w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 min-h-[80px]"
              placeholder="Additional notes..."
            />
          </section>

          <SheetFooter className="mt-2">
            <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800">
              Add Client
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}