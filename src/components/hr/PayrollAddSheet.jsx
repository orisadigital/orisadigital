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
import { useProjects } from "@/hooks/useProjects";
import { PAYROLL_STATUSES, PAYMENT_METHODS, PAYMENT_TYPES, POSITIONS, EMPLOYEE_NAMES, OTHER_OPTION, PROJECT_FEE, COMMISSION } from "@/components/hr/shared";

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

export default function PayrollAddSheet({ open, onCreate, onClose }) {
  const [form, setForm] = useState({
    employee_name: "",
    employee_position: "",
    payment_type: "",
    project: "",
    commission: "",
    pay_date: new Date().toISOString().split("T")[0],
    basic_salary: 0,
    payment_method: "bank_transfer",
    status: "pending",
    notes: "",
  });

  const [isOtherName, setIsOtherName] = useState(false);
  const [isOtherPosition, setIsOtherPosition] = useState(false);
  const projects = useProjects(open);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setNum = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));

  // "Others" is a UI-only choice: it reveals the text box but is never saved.
  const handleNameChange = (e) => {
    const v = e.target.value;
    if (v === OTHER_OPTION) {
      setIsOtherName(true);
      setForm((prev) => ({ ...prev, employee_name: "" }));
    } else {
      setIsOtherName(false);
      setForm((prev) => ({ ...prev, employee_name: v }));
    }
  };

  // Project only applies to a project fee; switching away clears it so a stale
  // name cannot ride along on a salary or reimbursement.
  const handlePaymentTypeChange = (e) => {
    const v = e.target.value;
    setForm((prev) => ({
      ...prev,
      payment_type: v,
      project: v === PROJECT_FEE ? prev.project : "",
      commission: v === COMMISSION ? prev.commission : "",
    }));
  };

  const handlePositionChange = (e) => {
    const v = e.target.value;
    if (v === OTHER_OPTION) {
      setIsOtherPosition(true);
      setForm((prev) => ({ ...prev, employee_position: "" }));
    } else {
      setIsOtherPosition(false);
      setForm((prev) => ({ ...prev, employee_position: v }));
    }
  };

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
            <SectionHeader  title="Employee" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" required>
                <select
                  value={isOtherName ? OTHER_OPTION : form.employee_name}
                  onChange={handleNameChange}
                  className={selectCls}
                >
                  <option value="">Select name</option>
                  {EMPLOYEE_NAMES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                  <option value={OTHER_OPTION}>Others</option>
                </select>
                {isOtherName && (
                  <Input
                    value={form.employee_name}
                    onChange={set("employee_name")}
                    className={inputCls}
                    placeholder="Enter full name"
                    autoFocus
                  />
                )}
              </Field>
              <Field label="Position">
                <select
                  value={isOtherPosition ? OTHER_OPTION : form.employee_position}
                  onChange={handlePositionChange}
                  className={selectCls}
                >
                  <option value="">Select position</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value={OTHER_OPTION}>Others</option>
                </select>
                {isOtherPosition && (
                  <Input
                    value={form.employee_position}
                    onChange={set("employee_position")}
                    className={inputCls}
                    placeholder="Enter position"
                    autoFocus
                  />
                )}
              </Field>
              <div className="col-span-2">
                <Field label="Payment Type">
                  <select value={form.payment_type} onChange={handlePaymentTypeChange} className={selectCls}>
                    <option value="">Select payment type</option>
                    {PAYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
              {form.payment_type === PROJECT_FEE && (
                <div className="col-span-2">
                  <Field label="Project">
                    <select value={form.project} onChange={set("project")} className={selectCls}>
                      <option value="">Select project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.project_name}>{p.project_name}</option>
                      ))}
                      {form.project && !projects.some((p) => p.project_name === form.project) && (
                        <option value={form.project}>{form.project}</option>
                      )}
                    </select>
                  </Field>
                </div>
              )}
              {form.payment_type === COMMISSION && (
                <div className="col-span-2">
                  <Field label="Commission">
                    <Input
                      value={form.commission}
                      onChange={set("commission")}
                      className={inputCls}
                      placeholder="What is this commission for?"
                    />
                  </Field>
                </div>
              )}
            </div>
          </section>

          {/* Pay */}
          <section className="space-y-3">
            <SectionHeader  title="Pay" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pay Date">
                <Input type="date" value={form.pay_date} onChange={set("pay_date")} className={inputCls} />
              </Field>
              <Field label="Amount (RM)">
                <Input type="number" min="0" step="0.01" value={form.basic_salary} onChange={setNum("basic_salary")} className={inputCls} placeholder="0.00" />
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
              Add Record
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
