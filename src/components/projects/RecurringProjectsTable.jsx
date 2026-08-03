import React from "react";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  on_hold: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

const SOURCE_STYLES = {
  website: "bg-blue-100 text-blue-700 border-blue-200",
  social_media: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  referral: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cold_outreach: "bg-orange-100 text-orange-700 border-orange-200",
  door_to_door: "bg-amber-100 text-amber-700 border-amber-200",
  networking: "bg-violet-100 text-violet-700 border-violet-200",
};

const SOURCE_LABELS = {
  website: "Website",
  social_media: "Social Media",
  referral: "Referral",
  cold_outreach: "Cold Outreach",
  door_to_door: "Door to Door",
  networking: "Networking",
};

const CYCLE_LABELS = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export default function RecurringProjectsTable({
  projects,
  clientSourceMap,
  onEdit,
  onDelete,
}) {
  if (projects.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-slate-900">Recurring Projects</h3>
        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
          {projects.length}
        </Badge>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="px-4 font-semibold text-slate-600">Project Name</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Company</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Person In Charge</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Source</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Recurring Amount</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Cycle</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Status</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Domain Expiry</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Hosting Expiry</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id} className="hover:bg-slate-50/50">
                <TableCell className="px-4 font-medium text-slate-900">
                  {p.project_name}
                </TableCell>
                <TableCell className="px-4 text-slate-700">
                  {p.company_name || "—"}
                </TableCell>
                <TableCell className="px-4 text-slate-700">
                  {p.person_in_charge || "—"}
                  {p.contact_number && (
                    <p className="text-xs text-slate-400">{p.contact_number}</p>
                  )}
                </TableCell>
                <TableCell className="px-4">
                  {(() => {
                    const source = p.client_id ? clientSourceMap[p.client_id] : null;
                    if (!source) return <span className="text-slate-400">—</span>;
                    return (
                      <Badge
                        variant="outline"
                        className={SOURCE_STYLES[source] || "bg-slate-100 text-slate-600 border-slate-200"}
                      >
                        {SOURCE_LABELS[source] || source}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="px-4 text-slate-700 text-sm">
                  {p.recurring_amount > 0
                    ? `RM ${Number(p.recurring_amount).toLocaleString()}`
                    : "—"}
                </TableCell>
                <TableCell className="px-4 text-slate-700 text-sm">
                  {p.recurring_cycle ? CYCLE_LABELS[p.recurring_cycle] || p.recurring_cycle : "—"}
                </TableCell>
                <TableCell className="px-4">
                  <Badge
                    variant="outline"
                    className={STATUS_STYLES[p.status] || STATUS_STYLES.active}
                  >
                    {p.status?.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 text-slate-500 text-sm">
                  {p.domain_expiry_date
                    ? (p.domain_expiry_date === "Own Domain"
                      ? "Own Domain"
                      : format(parseISO(p.domain_expiry_date), "MMM d, yyyy"))
                    : "—"}
                </TableCell>
                <TableCell className="px-4 text-slate-500 text-sm">
                  {p.hosting_expiry_date
                    ? (["Orisa Digital Hosting", "Own Hosting"].includes(p.hosting_expiry_date)
                      ? p.hosting_expiry_date
                      : format(parseISO(p.hosting_expiry_date), "MMM d, yyyy"))
                    : "—"}
                </TableCell>
                <TableCell className="px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-slate-400 hover:text-slate-700"
                      onClick={() => onEdit(p)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-slate-400 hover:text-destructive"
                      onClick={() => onDelete(p)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}