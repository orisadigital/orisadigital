import React, { useState, useEffect } from "react";
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
import RenewalDateInput from "@/components/renewals/RenewalDateInput";

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
const selectCls = "mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3";

const EMPTY = {
  name: "",
  category: "software",
  provider: "",
  username: "",
  password: "",
  license_key: "",
  seats: 1,
  cost: 0,
  billing_cycle: "yearly",
  renewal_date: "",
  client_id: "",
  company_name: "",
  status: "active",
  notes: "",
};

export default function SoftwarePluginSheet({ record, open, onSave, onClose }) {
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
          <SheetTitle>{record ? "Edit" : "Add"} Software / Plugin</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <section className="space-y-3">
            <SectionHeader  title="Item Details" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" required>
                <Input value={form.name} onChange={set("name")} className={inputCls} placeholder="Elementor Pro" />
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={set("category")} className={selectCls}>
                  <option value="software">Software</option>
                  <option value="plugin">Plugin</option>
                </select>
              </Field>
              <Field label="Provider">
                <Input value={form.provider} onChange={set("provider")} className={inputCls} placeholder="Adobe / WP" />
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
                  <RenewalDateInput
                    value={form.renewal_date}
                    billingCycle={form.billing_cycle}
                    onChange={(v) => setForm((p) => ({ ...p, renewal_date: v }))}
                  />
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
            <SectionHeader  title="Credentials" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Username">
                <Input value={form.username} onChange={set("username")} className={inputCls} />
              </Field>
              <Field label="Password">
                <Input value={form.password} onChange={set("password")} className={inputCls} />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader  title="License" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="License Key">
                <Input value={form.license_key} onChange={set("license_key")} className={inputCls} />
              </Field>
              <Field label="Seats">
                <Input
                  type="number"
                  min="1"
                  value={form.seats}
                  onChange={(e) => setForm((p) => ({ ...p, seats: parseInt(e.target.value) || 1 }))}
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

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
              {record ? "Save Changes" : "Add"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}