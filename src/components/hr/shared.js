export const PAYROLL_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export const PAYROLL_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "e_wallet", label: "E-Wallet" },
];

export const PAYMENT_METHOD_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.value, m.label])
);

// Net pay is derived, never stored — see migration 004.
export const netPay = ({ basic_salary, allowances, deductions }) =>
  (Number(basic_salary) || 0) + (Number(allowances) || 0) - (Number(deductions) || 0);

// pay_period is stored as "YYYY-MM" (text, like every other date in the schema).
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatPayPeriod(period) {
  if (!period) return "—";
  const [year, month] = String(period).split("-");
  const idx = Number(month) - 1;
  if (!year || !MONTHS[idx]) return period;
  return `${MONTHS[idx]} ${year}`;
}
