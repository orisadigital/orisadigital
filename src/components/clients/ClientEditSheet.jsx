import React, { useState, useEffect } from "react";
import { Save, User, Building2, FolderKanban, FileText } from "lucide-react";
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

export default function ClientEditSheet({ client, onUpdate, onClose }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (client) {
      setForm({
        client_name: client.client_name || "",
        contact_position: client.contact_position || "",
        contact_email: client.contact_email || "",
        contact_number: client.contact_number || "",
        company_name: client.company_name || "",
        company_industry: client.company_industry || "",
        company_reg_number: client.company_reg_number || "",
        company_website: client.company_website || "",
        company_address: client.company_address || "",
        inquiry_source: client.inquiry_source || "website",
        status: client.status || "active",
        notes: client.notes || "",
      });
    }
  }, [client]);

  if (!client) return null;

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate?.({ ...client, ...form });
  };

  return (
    <Sheet open={Boolean(client)} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Client</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Primary Contact */}
          <section className="space-y-3">
            <SectionHeader icon={User} title="Primary Contact" />
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
            <SectionHeader icon={Building2} title="Company Information" />
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
            <SectionHeader icon={FileText} title="Notes" />
            <textarea
              value={form.notes}
              onChange={set("notes")}
              className="mt-1 w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 min-h-[80px]"
              placeholder="Additional notes..."
            />
          </section>

          {/* Projects */}
          <section className="space-y-3">
            <SectionHeader icon={FolderKanban} title="Projects" />
            <p className="text-sm text-slate-400 text-center py-6">
              No projects linked to this client yet.
            </p>
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