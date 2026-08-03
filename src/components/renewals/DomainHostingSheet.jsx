import React, { useState, useEffect } from "react";
import { Save, Globe, Server, KeyRound, FileText } from "lucide-react";
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
const selectCls = "mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3";

const EMPTY = {
  item_name: "",
  item_type: "domain",
  provider: "",
  username: "",
  password: "",
  backup_code: "",
  cost: 0,
  billing_cycle: "yearly",
  renewal_date: "",
  client_id: "",
  company_name: "",
  status: "active",
  notes: "",
};

export default function DomainHostingSheet({ record, open, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(record ? { ...EMPTY, ...record } : EMPTY);
  }, [record, open]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(record ? { ...record, ...form } : form);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose?.()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{record ? "Edit" : "Add"} Domain / Hosting</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <section className="space-y-3">
            <SectionHeader icon={Globe} title="Item Details" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Item Name" required>
                <Input value={form.item_name} onChange={set("item_name")} className={inputCls} placeholder="mydomain.com / cPanel plan" />
              </Field>
              <Field label="Type">
                <select value={form.item_type} onChange={set("item_type")} className={selectCls}>
                  <option value="domain">Domain</option>
                  <option value="hosting">Hosting</option>
                </select>
              </Field>
              <Field label="Provider">
                <Input value={form.provider} onChange={set("provider")} className={inputCls} placeholder="Namecheap / SiteGround" />
              </Field>
              <Field label="Billing Cycle">
                <select value={form.billing_cycle} onChange={set("billing_cycle")} className={selectCls}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one_time">One Time</option>
                </select>
              </Field>
              <Field label="Cost (RM)">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={(e) => setForm((p) => ({ ...p, cost: parseFloat(e.target.value) || 0 }))}
                  className={inputCls}
                />
              </Field>
              {form.billing_cycle !== "one_time" && (
                <Field label="Renewal Date">
                  <Input type="date" value={form.renewal_date} onChange={set("renewal_date")} className={inputCls} />
                </Field>
              )}
              <Field label="Status">
                <select value={form.status} onChange={set("status")} className={selectCls}>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader icon={KeyRound} title="Credentials" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Username">
                <Input value={form.username} onChange={set("username")} className={inputCls} />
              </Field>
              <Field label="Password">
                <Input value={form.password} onChange={set("password")} className={inputCls} />
              </Field>
              <div className="col-span-2">
                <Field label="Backup Code">
                  <Input value={form.backup_code} onChange={set("backup_code")} className={inputCls} />
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader icon={FileText} title="Notes" />
            <textarea
              value={form.notes}
              onChange={set("notes")}
              className="mt-1 w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 min-h-[80px]"
              placeholder="Additional notes..."
            />
          </section>

          <SheetFooter className="mt-2">
            <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800">
              <Save className="h-3.5 w-3.5" />
              {record ? "Save Changes" : "Add"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}