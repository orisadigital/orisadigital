import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";

const inputCls = "mt-1 h-9 text-sm";

export default function RenewalDateInput({ value, billingCycle, onChange }) {
  const isMonthly = billingCycle === "monthly";

  const day = useMemo(() => {
    if (!value) return "";
    const parts = String(value).split("-");
    if (parts.length === 2) return parts[1];
    if (parts.length === 3) return parts[2];
    return "";
  }, [value]);

  if (!isMonthly) {
    return (
      <Input
        type="date"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={inputCls}
      />
    );
  }

  const emit = (d) => {
    const dd = String(d || "").padStart(2, "0");
    const n = Number(dd);
    if (!dd || n < 1 || n > 31) {
      onChange?.("");
      return;
    }
    // Monthly recurs every month on this day; month part is a placeholder.
    onChange?.(`01-${dd}`);
  };

  return (
    <div className="mt-1">
      <Input
        type="number"
        min="1"
        max="31"
        value={day}
        onChange={(e) => emit(e.target.value)}
        className={inputCls}
        placeholder="Day of month (e.g. 1)"
      />
      <p className="mt-1 text-xs text-muted-foreground">Renews on this day every month.</p>
    </div>
  );
}