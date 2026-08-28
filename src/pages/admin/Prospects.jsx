import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import ProspectEditSheet from "@/components/prospects/ProspectEditSheet";
import FollowUpSheet, { FOLLOW_UP_STATUSES, FollowUpStatusDot } from "@/components/prospects/FollowUpSheet";
import FollowUpStatusLegend from "@/components/prospects/FollowUpStatusLegend";

const STATUS_ORDER = Object.fromEntries(
  FOLLOW_UP_STATUSES.map((s, i) => [s.value, i])
);
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
import LoadErrorBanner from "@/components/admin/LoadErrorBanner";

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-amber-100 text-amber-700 border-amber-200",
  qualified: "bg-emerald-100 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};

const SOURCE_LABELS = {
  website: "Website",
  social_media: "Social Media",
  referral: "Referral",
  cold_outreach: "Cold Outreach",
  door_to_door: "Door-to-Door",
  networking: "Networking",
};

const SOURCE_STYLES = {
  website: "bg-blue-100 text-blue-700 border-blue-200",
  social_media: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  referral: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cold_outreach: "bg-orange-100 text-orange-700 border-orange-200",
  door_to_door: "bg-amber-100 text-amber-700 border-amber-200",
  networking: "bg-violet-100 text-violet-700 border-violet-200",
};

const DEAL_STAGE_TO_STATUS = {
  online_prospect: "new",
  offline_prospect: "new",
  contact_made: "contacted",
  meeting_arranged: "contacted",
  presentation_made: "qualified",
  prototype: "qualified",
  on_hold: "archived",
  closed_won: "archived",
  closed_lost: "archived",
};

export default function Prospects() {
  const [prospects, setProspects] = useState([]);
  const [followUpCounts, setFollowUpCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const visibleProspects = statusFilter === "all"
    ? prospects
    : prospects.filter((p) => p.follow_up_status === statusFilter);

  useEffect(() => {
    const loadProspects = async () => {
      try {
        const [prospectData, dealData, followUpData] = await Promise.all([
          base44.entities.Prospect.list("-created_date"),
          base44.entities.Deal.list("-created_date"),
          base44.entities.FollowUp.list("-created_date"),
        ]);
        const counts = {};
        followUpData.forEach((f) => {
          counts[f.prospect_id] = (counts[f.prospect_id] || 0) + 1;
        });
        setFollowUpCounts(counts);
        const dealsAsProspects = dealData.map((d) => ({
          id: d.id,
          _origin: "deal",
          prospect_name: d.contact_name || d.deal_name,
          company_name: d.company_name,
          contact_email: "",
          contact_number: d.contact_number,
          inquiry_source: d.inquiry_source || "website",
          date_received: d.date,
          status: DEAL_STAGE_TO_STATUS[d.stage] || "new",
          follow_up_status: d.follow_up_status || "interested",
          next_follow_up: d.next_follow_up || "",
          follow_up_notes: d.follow_up_notes || "",
          amount: d.amount || 0,
          updated_date: d.updated_date,
        }));
        const prospectsTagged = prospectData.map((p) => ({ ...p, _origin: "prospect" }));
        const all = [...prospectsTagged, ...dealsAsProspects];
        all.sort(
          (a, b) =>
            (STATUS_ORDER[a.follow_up_status] ?? 99) -
            (STATUS_ORDER[b.follow_up_status] ?? 99)
        );
        setProspects(all);
      } catch (e) {
        console.error("Failed to load prospects", e);
        setLoadError(e?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    loadProspects();
  }, []);

  const handleStatusChange = async (prospectId, newStatus) => {
    const item = prospects.find((p) => p.id === prospectId);
    if (!item) return;
    setProspects((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, status: newStatus } : p))
    );
    if (item._origin === "prospect") {
      await base44.entities.Prospect.update(prospectId, { status: newStatus });
    }
  };

  const [convertingId, setConvertingId] = useState(null);
  const [editingProspect, setEditingProspect] = useState(null);
  const [followUpProspect, setFollowUpProspect] = useState(null);

  const handleEditClick = (prospect) => {
    setEditingProspect(prospect);
  };

  const handleFollowUpUpdate = (prospectId, changes) => {
    setProspects((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, ...changes } : p))
    );
    setFollowUpCounts((prev) => ({
      ...prev,
      [prospectId]: (prev[prospectId] || 0) + 1,
    }));
  };

  const handleCancelEdit = () => {
    setEditingProspect(null);
  };

  const handleUpdateProspect = async (updated) => {
    if (updated._origin === "deal") {
      await base44.entities.Deal.update(updated.id, {
        contact_name: updated.prospect_name,
        company_name: updated.company_name,
        contact_number: updated.contact_number,
        inquiry_source: updated.inquiry_source,
        date: updated.date_received,
      });
    } else {
      await base44.entities.Prospect.update(updated.id, {
        prospect_name: updated.prospect_name,
        company_name: updated.company_name,
        contact_email: updated.contact_email,
        contact_number: updated.contact_number,
        inquiry_source: updated.inquiry_source,
        notes: updated.notes,
        date_received: updated.date_received,
      });
    }
    setProspects((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
    toast.success("Prospect updated");
    setEditingProspect(null);
  };

  const handleConvertToClient = async (prospect) => {
    setConvertingId(prospect.id);
    try {
      await base44.entities.Client.create({
        client_name: prospect.prospect_name,
        company_name: prospect.company_name,
        contact_email: prospect.contact_email,
        contact_number: prospect.contact_number,
        inquiry_source: prospect.inquiry_source || "website",
        notes: prospect.notes || "",
        status: "active",
        amount: prospect.amount || 0,
        converted_from: prospect._origin,
        date_converted: new Date().toISOString().split("T")[0],
      });
      toast.success(`${prospect.prospect_name} converted to client`);
    } catch (e) {
      console.error("Failed to convert prospect", e);
      toast.error("Failed to convert prospect");
    } finally {
      setConvertingId(null);
    }
  };

  const handleDelete = async (prospect) => {
    try {
      if (prospect._origin === "deal") {
        await base44.entities.Deal.delete(prospect.id);
      } else {
        await base44.entities.Prospect.delete(prospect.id);
      }
      setProspects((prev) => prev.filter((p) => p.id !== prospect.id));
      toast.success("Prospect deleted");
    } catch (e) {
      console.error("Failed to delete prospect", e);
      toast.error("Failed to delete prospect");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LoadErrorBanner label="prospects" error={loadError} />

      <FollowUpStatusLegend active={statusFilter} onSelect={setStatusFilter} />

      {/* Prospect list */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {visibleProspects.length} prospect{visibleProspects.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="px-4 font-semibold text-slate-600">Company</TableHead>
                <TableHead className="px-4 font-semibold text-slate-600">Prospect</TableHead>
                <TableHead className="px-4 font-semibold text-slate-600">Source</TableHead>
                <TableHead className="px-4 font-semibold text-slate-600">Date Received</TableHead>
                <TableHead className="px-4 font-semibold text-slate-600">Status</TableHead>
                <TableHead className="px-4 font-semibold text-slate-600 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProspects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    No prospects{statusFilter !== "all" ? " in this status" : ""} yet.
                  </TableCell>
                </TableRow>
              ) : (
                visibleProspects.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50">
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <FollowUpStatusDot status={p.follow_up_status} />
                        <div>
                          <p className="font-medium text-slate-900">{p.company_name || "—"}</p>
                          {p.contact_number && (
                            <p className="text-xs text-slate-400">{p.contact_number}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs ml-1"
                          onClick={() => setFollowUpProspect(p)}
                        >
                          Follow up
                        </Button>
                        {(followUpCounts[p.id] || 0) > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            {followUpCounts[p.id]}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div>
                        <p className="font-medium text-slate-900">{p.prospect_name}</p>
                        <p className="text-xs text-slate-500">{p.contact_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={SOURCE_STYLES[p.inquiry_source] || SOURCE_STYLES.website}
                        >
                          {SOURCE_LABELS[p.inquiry_source] || p.inquiry_source}
                        </Badge>
                        {p._origin === "deal" && (
                          <Badge variant="outline" className="bg-violet-50 text-violet-600 border-violet-200 text-[10px]">
                            Pipeline
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-slate-500 text-sm">
                      {p.date_received
                        ? format(parseISO(p.date_received), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[p.status] || STATUS_STYLES.new}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled={convertingId === p.id}
                          onClick={() => handleConvertToClient(p)}
                        >
                          {convertingId === p.id ? "Converting..." : "Convert"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2 text-slate-400 hover:text-slate-700"
                          onClick={() => handleEditClick(p)}
                        >Edit</Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2 text-slate-400 hover:text-destructive"
                          onClick={() => handleDelete(p)}
                        >Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit prospect sheet */}
      <ProspectEditSheet
        prospect={editingProspect}
        onUpdate={handleUpdateProspect}
        onClose={handleCancelEdit}
      />

      {/* Follow-up sheet */}
      <FollowUpSheet
        prospect={followUpProspect}
        onProspectUpdate={handleFollowUpUpdate}
        onClose={() => setFollowUpProspect(null)}
      />
    </div>
  );
}
