import React, { useState } from "react";
import { Save, User, Banknote, FileText } from "lucide-react";
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
import { fmtRM } from "@/components/renewals/shared";
import { PAYROLL_STATUSES, PAYMENT_METHODS, netPay } from "@/components/hr/shared";

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

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function PayrollAddSheet({ open, onCreate, onClose }) {
  const [form, setForm] = useState({
    employee_name: "",
    employee_position: "",
    employee_email: "",
    pay_period: thisMonth(),
    pay_date: new Date().toISOString().split("T")[0],
    basic_salary: 0,
    allowances: 0,
    deductions: 0,
    payment_method: "bank_transfer",
    status: "pending",
    notes: "",
  });

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setNum = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate?.(form);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose?.()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Payroll Record</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Employee */}
          <section className="space-y-3">
            <SectionHeader icon={User} title="Employee" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" required>
                <Input value={form.employee_name} onChange={set("employee_name")} className={inputCls} />
              </Field>
              <Field label="Position">
                <Input value={form.employee_position} onChange={set("employee_position")} className={inputCls} placeholder="Designer" />
              </Field>
              <div className="col-span-2">
                <Field label="Email">
                  <Input type="email" value={form.employee_email} onChange={set("employee_email")} className={inputCls} />
                </Field>
              </div>
            </div>
          </section>

          {/* Pay */}
          <section className="space-y-3">
            <SectionHeader icon={Banknote} title="Pay" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pay Period">
                <Input type="month" value={form.pay_period} onChange={set("pay_period")} className={inputCls} />
              </Field>
              <Field label="Pay Date">
                <Input type="date" value={form.pay_date} onChange={set("pay_date")} className={inputCls} />
              </Field>
              <Field label="Basic Salary (RM)">
                <Input type="number" min="0" step="0.01" value={form.basic_salary} onChange={setNum("basic_salary")} className={inputCls} placeholder="0.00" />
              </Field>
              <Field label="Allowances (RM)">
                <Input type="number" min="0" step="0.01" value={form.allowances} onChange={setNum("allowances")} className={inputCls} placeholder="0.00" />
              </Field>
              <Field label="Deductions (RM)">
                <Input type="number" min="0" step="0.01" value={form.deductions} onChange={setNum("deductions")} className={inputCls} placeholder="0.00" />
              </Field>
              <Field label="Payment Method">
                <select value={form.payment_method} onChange={set("payment_method")} className={selectCls}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={set("status")} className={selectCls}>
                  {PAYROLL_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <div className="w-full rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                  <p className="text-xs text-slate-500">Net Pay</p>
                  <p className="text-sm font-semibold text-slate-900">{fmtRM(netPay(form))}</p>
                </div>
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

          <SheetFooter className="mt-2">
            <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800">
              <Save className="h-3.5 w-3.5" />
              Add Record
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
