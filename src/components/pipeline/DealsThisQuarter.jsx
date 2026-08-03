import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QUARTERS } from "@/components/pipeline/pipelineStages";
import { cn } from "@/lib/utils";

export default function DealsThisQuarter({ deals }) {
  const [quarter, setQuarter] = useState("Q3");
  const [year, setYear] = useState("2026");

  const data = useMemo(() => {
    const q = QUARTERS[quarter];
    return q.months.map((month, i) => {
      const monthDeals = deals.filter((d) => {
        const raw = d.date || d.created_date;
        if (!raw) return false;
        const dt = new Date(raw);
        return dt.getMonth() === month && dt.getFullYear().toString() === year;
      });
      return {
        name: q.monthNames[i],
        deals: monthDeals.length,
        amount: monthDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
      };
    });
  }, [deals, quarter, year]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 h-full flex flex-col">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Deals This Quarter</h2>
          <p className="mt-1 text-sm text-slate-500">Monthly deal count & value.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Object.keys(QUARTERS).map((q) => (
              <Button
                key={q}
                type="button"
                variant={quarter === q ? "default" : "outline"}
                size="sm"
                onClick={() => setQuarter(q)}
                className={cn(quarter === q && "bg-slate-900 hover:bg-slate-800")}
              >
                {q}
              </Button>
            ))}
          </div>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[90px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["2025", "2026", "2027"].map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-5 h-48 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-semibold text-slate-900">{d.name}</p>
                    <p className="text-xs text-slate-500">Deals: {d.deals}</p>
                    <p className="text-xs text-slate-500">Amount: RM{d.amount.toLocaleString()}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="deals" fill="#0f172a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}