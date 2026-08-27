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

export const EMPLOYEE_NAMES = [
  "Faruqi Jeniri",
  "Amirul Zambri",
  "Awang Syaizatul",
];

// Sentinel for the "Others" option on the name and position pickers. Never
// stored — picking it just reveals a free-text box, and what gets saved is
// whatever is typed there.
export const OTHER_OPTION = "__other__";

export const POSITIONS = [
  "Web Designer",
  "Graphic Designer",
  "Photographer",
  "Videographer",
  "Sales",
];

// Payment types that ask for one extra detail each.
export const PROJECT_FEE = "Project Fee";
export const COMMISSION = "Commission";

export const PAYMENT_TYPES = [
  "Salary",
  "Project Fee",
  "Commission",
  "Bonus",
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
