import React, { useState, useEffect } from "react";
import { Save, User, Building2, FileText } from "lucide-react";
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

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
      <Icon className="h-4 w-4 text-slate-400" />
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

export default function ProspectEditSheet({ prospect, onUpdate, onClose }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (prospect) {
      setForm({
        prospect_name: prospect.prospect_name || "",
        company_name: prospect.company_name || "",
        contact_email: prospect.contact_email || "",
        contact_number: prospect.contact_number || "",
        inquiry_source: prospect.inquiry_source || "website",
        status: prospect.status || "new",
        date_received: prospect.date_received || new Date().toISOString().split("T")[0],
        notes: prospect.notes || "",
      });
    }
  }, [prospect]);

  if (!prospect) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate?.({ ...prospect, ...form });
  };

  return (
    <Sheet open={Boolean(prospect)} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Prospect</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Contact */}
          <section className="space-y-3">
            <SectionHeader icon={User} title="Contact Details" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prospect Name" required>
                <Input value={form.prospect_name} onChange={set("prospect_name")} className={inputCls} placeholder="John Doe" />
              </Field>
              <Field label="Phone">
                <Input value={form.contact_number} onChange={set("contact_number")} className={inputCls} placeholder="+60 12-345 6789" />
              </Field>
              <div className="col-span-2">
                <Field label="Email" required>
                  <Input type="email" value={form.contact_email} onChange={set("contact_email")} className={inputCls} placeholder="john@acme.com" />
                </Field>
              </div>
            </div>
          </section>

          {/* Company */}
          <section className="space-y-3">
            <SectionHeader icon={Building2} title="Company & Source" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company Name">
                <Input value={form.company_name} onChange={set("company_name")} className={inputCls} placeholder="Acme Inc." />
              </Field>
              <Field label="Date Received">
                <Input type="date" value={form.date_received} onChange={set("date_received")} className={inputCls} />
              </Field>
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
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={set("status")}
                  className="mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-3">
            <SectionHeader icon={FileText} title="Notes" />
            <textarea
              value={form.notes}
              onChange={set("notes")}
              className="mt-1 w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 min-h-[80px]"
              placeholder="Initial inquiry details..."
            />
          </section>

          <SheetFooter className="mt-2">
            <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800">
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}