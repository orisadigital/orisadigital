import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

const SOURCE_HEX = {
  website: "#3b82f6",
  social_media: "#d946ef",
  referral: "#10b981",
  cold_outreach: "#f97316",
  door_to_door: "#f59e0b",
  networking: "#8b5cf6",
};

const SOURCE_LABELS = {
  website: "Website",
  social_media: "Social Media",
  referral: "Referral",
  cold_outreach: "Cold Outreach",
  door_to_door: "Door to Door",
  networking: "Networking",
};

export default function ProjectsSummary({ projects, clientSourceMap }) {
  const totalSales = useMemo(
    () => projects.reduce((sum, p) => sum + (Number(p.sale_amount) || 0), 0),
    [projects]
  );

  const annualRecurring = useMemo(() => {
    const multiplier = { monthly: 12, quarterly: 4, yearly: 1 };
    return projects
      .filter((p) => p.is_recurring)
      .reduce(
        (sum, p) => sum + (Number(p.recurring_amount) || 0) * (multiplier[p.recurring_cycle] || 0),
        0
      );
  }, [projects]);

  const recurringCount = useMemo(
    () => projects.filter((p) => p.is_recurring).length,
    [projects]
  );

  const sourceData = useMemo(() => {
    const counts = {};
    projects.forEach((p) => {
      const source = p.client_id ? clientSourceMap[p.client_id] : null;
      if (!source) return;
      counts[source] = (counts[source] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: SOURCE_LABELS[key] || key,
      key,
      value,
      color: SOURCE_HEX[key] || "#94a3b8",
    }));
  }, [projects, clientSourceMap]);

  const hasSourceData = sourceData.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div>
              <p className="text-sm font-medium text-slate-500">Total Sale Amount</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                RM {totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Across {projects.length} {projects.length === 1 ? "project" : "projects"}
              </p>
              {recurringCount > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Recurring (annualised):</span>{" "}
                  RM {annualRecurring.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-slate-400"> · {recurringCount} {recurringCount === 1 ? "project" : "projects"}</span>
                </p>
              )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-medium text-slate-500">Source Distribution</p>
          </div>
          {hasSourceData ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {sourceData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} ${value === 1 ? "project" : "projects"}`, name]}
                    contentStyle={{ borderRadius: "0px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", lineHeight: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-sm text-slate-400">
              No source data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}