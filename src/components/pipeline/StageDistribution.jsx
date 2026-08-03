import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PIPELINE_STAGES, STAGE_COLORS } from "@/components/pipeline/pipelineStages";

export default function StageDistribution({ deals }) {
  const data = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage.id);
      return {
        id: stage.id,
        label: stage.label,
        count: stageDeals.length,
        amount: stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
      };
    });
  }, [deals]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Pipeline Stage Distribution</h2>
      <p className="mt-1 text-sm text-slate-500">Total deals and value across all stages.</p>
      <div className="mt-5 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={20} margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-semibold text-slate-900">{d.label}</p>
                    <p className="text-xs text-slate-500">Total Deals: {d.count}</p>
                    <p className="text-xs text-slate-500">Amount: RM{d.amount.toLocaleString()}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.id} fill={STAGE_COLORS[entry.id] || "#0f172a"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}