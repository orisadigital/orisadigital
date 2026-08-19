import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Filter, Users, UserPlus, FolderKanban, TrendingUp, Phone } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import SalesAssistantChat from "@/components/dashboard/SalesAssistantChat";
import { PIPELINE_STAGES, STAGE_COLORS, DEAL_SOURCES } from "@/components/pipeline/pipelineStages";
import LoadErrorBanner from "@/components/admin/LoadErrorBanner";

const SOURCE_LABELS = Object.fromEntries(DEAL_SOURCES.map((s) => [s.value, s.label]));

export default function Dashboard() {
  const [deals, setDeals] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, p, c, pr] = await Promise.all([
          base44.entities.Deal.list(),
          base44.entities.Prospect.list(),
          base44.entities.Client.list(),
          base44.entities.Project.list(),
        ]);
        setDeals(d);
        setProspects(p);
        setClients(c);
        setProjects(pr);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
        setLoadError(e?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pipelineValue = useMemo(
    () => deals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
    [deals]
  );

  const wonDeals = useMemo(
    () => deals.filter((d) => d.stage === "closed_won"),
    [deals]
  );
  const wonValue = useMemo(
    () => wonDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
    [wonDeals]
  );

  const projectsSales = useMemo(
    () => projects.reduce((sum, p) => sum + (Number(p.sale_amount) || 0), 0),
    [projects]
  );

  const annualRecurring = useMemo(() => {
    const mult = { monthly: 12, quarterly: 4, yearly: 1 };
    return projects
      .filter((p) => p.is_recurring)
      .reduce((sum, p) => sum + (Number(p.recurring_amount) || 0) * (mult[p.recurring_cycle] || 0), 0);
  }, [projects]);

  const stageData = useMemo(
    () =>
      PIPELINE_STAGES.map((s) => ({
        name: s.label,
        key: s.id,
        count: deals.filter((d) => d.stage === s.id).length,
        color: STAGE_COLORS[s.id],
      })).filter((s) => s.count > 0),
    [deals]
  );

  const recentDeals = useMemo(
    () =>
      [...deals]
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5),
    [deals]
  );

  const fmtRM = (n) => `RM ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadErrorBanner label="dashboard data" error={loadError} />

      <SalesAssistantChat />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pipeline Value"
          value={fmtRM(pipelineValue)}
          sub={`${deals.length} deals`}
          icon={Filter}
          accent="blue"
        />
        <StatCard
          label="Closed Won"
          value={fmtRM(wonValue)}
          sub={`${wonDeals.length} deals won`}
          icon={TrendingUp}
          accent="emerald"
        />
        <StatCard
          label="Prospects"
          value={deals.length}
          sub="Leads in pipeline"
          icon={Users}
          accent="violet"
        />
        <StatCard
          label="Clients"
          value={clients.length}
          sub="Converted accounts"
          icon={UserPlus}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          label="Projects Total Sales"
          value={fmtRM(projectsSales)}
          sub={`${projects.length} projects`}
          icon={FolderKanban}
          accent="slate"
        />
        <StatCard
          label="Recurring (Annualised)"
          value={fmtRM(annualRecurring)}
          sub={`${projects.filter((p) => p.is_recurring).length} recurring projects`}
          icon={TrendingUp}
          accent="emerald"
        />
        <StatCard
          label="Active Projects"
          value={projects.filter((p) => p.status === "active").length}
          sub={`${projects.filter((p) => p.status === "completed").length} completed`}
          icon={FolderKanban}
          accent="fuchsia"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-slate-500" />
            <p className="text-sm font-medium text-slate-600">Deals by Pipeline Stage</p>
          </div>
          {stageData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-slate-400">
              No deals yet
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [`${value} ${value === 1 ? "deal" : "deals"}`, "Count"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stageData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-4 w-4 text-slate-500" />
            <p className="text-sm font-medium text-slate-600">Recent Deals</p>
          </div>
          {recentDeals.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-slate-400">
              No deals yet
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentDeals.map((d) => (
                <li key={d.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{d.deal_name}</p>
                    <p className="text-xs text-slate-400 truncate">{d.company_name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {d.inquiry_source && (
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {SOURCE_LABELS[d.inquiry_source] || d.inquiry_source}
                      </span>
                    )}
                    {Number(d.amount) > 0 && (
                      <span className="text-sm font-medium text-slate-700">
                        {fmtRM(d.amount)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
