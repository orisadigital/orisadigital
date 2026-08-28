import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fmtRM } from "@/components/renewals/shared";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Last 12 months, oldest first, so an empty month still shows as a gap rather
// than being silently skipped — a missing bar is information.
function lastTwelveMonths() {
  const out = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: MONTHS[d.getMonth()],
      total: 0,
    });
  }
  return out;
}

export default function PayrollTotalsChart({ records }) {
  const { data, total } = useMemo(() => {
    const buckets = lastTwelveMonths();
    const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));
    for (const r of records) {
      // Only settled money: pending is owed, cancelled was never paid.
      if (r.status !== "paid" || !r.pay_date) continue;
      const bucket = byKey[String(r.pay_date).slice(0, 7)];
      if (bucket) bucket.total += Number(r.basic_salary) || 0;
    }
    // Sum the buckets, not the records: a headline covering a wider period than
    // the bars would silently disagree with the chart underneath it.
    return { data: buckets, total: buckets.reduce((a, b) => a + b.total, 0) };
  }, [records]);

  const hasAny = data.some((d) => d.total > 0);

  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-600">Total Amount Paid</p>
          <p className="text-xs text-slate-400">Last 12 months</p>
        </div>
        <p className="text-lg font-semibold text-slate-900">{fmtRM(total)}</p>
      </div>
      {hasAny ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={64} />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                formatter={(value) => [fmtRM(value), "Paid"]}
                contentStyle={{ borderRadius: "0px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Bar dataKey="total" fill="#000000" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-slate-400 py-8 text-center">
          No paid records yet. Totals appear here once a record is marked paid.
        </p>
      )}
    </div>
  );
}
