export const RENEWAL_STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  expiring: "bg-amber-100 text-amber-700 border-amber-200",
  expired: "bg-rose-100 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export const CYCLE_LABELS = {
  monthly: "Monthly",
  yearly: "Yearly",
  "3_years": "3 Years",
  one_time: "One Time",
};

export const fmtRM = (n) =>
  `RM ${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

import { format, parseISO, differenceInDays } from "date-fns";

// Monthly renewals store only month-day (MM-DD, no year); others store full ISO date.
export function formatRenewalDate(dateStr, billingCycle) {
  if (!dateStr) return "—";
  if (billingCycle === "monthly") {
    const parts = String(dateStr).split("-");
    const dd = parts.length === 2 ? parts[1] : parts[2];
    const day = Number(dd);
    if (!day) return "—";
    const ord =
      day % 10 === 1 && day !== 11 ? "st" :
      day % 10 === 2 && day !== 12 ? "nd" :
      day % 10 === 3 && day !== 13 ? "rd" : "th";
    return `${day}${ord} of every month`;
  }
  return format(parseISO(dateStr), "MMM d, yyyy");
}

export function daysUntilRenewal(dateStr, billingCycle) {
  if (!dateStr) return null;
  const now = new Date();
  if (billingCycle === "monthly") {
    const parts = String(dateStr).split("-");
    const dd = parts.length === 2 ? parts[1] : parts[2];
    const day = Number(dd);
    if (!day) return null;
    let next = new Date(now.getFullYear(), now.getMonth(), day);
    let diff = differenceInDays(next, now);
    if (diff < 0) {
      next = new Date(now.getFullYear(), now.getMonth() + 1, day);
      diff = differenceInDays(next, now);
    }
    return diff;
  }
  return differenceInDays(parseISO(dateStr), now);
}