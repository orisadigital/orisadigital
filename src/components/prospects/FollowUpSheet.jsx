import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import {
  Building2,
  Plus,
  Calendar,
  FileText,
  Phone,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const FOLLOW_UP_STATUSES = [
  { value: "interested", label: "Interested", dot: "bg-emerald-500" },
  { value: "thinking", label: "Thinking", dot: "bg-amber-400" },
  { value: "proposal_sent", label: "Proposal Sent", dot: "bg-blue-500" },
  { value: "negotiation", label: "Negotiation", dot: "bg-violet-500" },
  { value: "won", label: "Won", dot: "bg-slate-900" },
  { value: "not_interested", label: "Not Interested", dot: "bg-rose-500" },
  { value: "lost", label: "Lost", dot: "bg-white border-2 border-slate-400" },
  { value: "ghost", label: "Ghost", dot: "bg-slate-200 border border-dashed border-slate-400" },
];

const STATUS_DOT_MAP = {
  all: "bg-cyan-500",
  ...Object.fromEntries(FOLLOW_UP_STATUSES.map((s) => [s.value, s.dot])),
};
const STATUS_LABEL_MAP = Object.fromEntries(
  FOLLOW_UP_STATUSES.map((s) => [s.value, s.label])
);

export function FollowUpStatusDot({ status, className = "" }) {
  const dot = STATUS_DOT_MAP[status] || STATUS_DOT_MAP.interested;
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot} ${className}`} />
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
      <Icon className="h-4 w-4 text-slate-400" />
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

const todayStr = () => new Date().toISOString().split("T")[0];

export default function FollowUpSheet({ prospect, onProspectUpdate, onClose }) {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEntry, setNewEntry] = useState({
    status: "interested",
    notes: "",
    date: todayStr(),
  });
  const [nextFollowUp, setNextFollowUp] = useState("");

  const loadHistory = useCallback(async (prospectId) => {
    setLoadingHistory(true);
    try {
      const records = await base44.entities.FollowUp.filter(
        { prospect_id: prospectId },
        "-date"
      );
      setHistory(records);
    } catch (e) {
      console.error("Failed to load follow-up history", e);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (prospect) {
      setNewEntry({
        status: prospect.follow_up_status || "interested",
        notes: "",
        date: todayStr(),
      });
      setNextFollowUp(prospect.next_follow_up || "");
      loadHistory(prospect.id);
    } else {
      setHistory([]);
    }
  }, [prospect, loadHistory]);

  if (!prospect) return null;

  const set = (key) => (e) =>
    setNewEntry((prev) => ({ ...prev, [key]: e.target.value }));

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      // 1. Create FollowUp history record
      await base44.entities.FollowUp.create({
        prospect_id: prospect.id,
        status: newEntry.status,
        notes: newEntry.notes,
        date: newEntry.date,
      });

      // 2. Update parent Prospect or Deal
      const payload = {
        follow_up_status: newEntry.status,
        next_follow_up: nextFollowUp,
      };
      if (prospect._origin === "deal") {
        await base44.entities.Deal.update(prospect.id, payload);
      } else {
        await base44.entities.Prospect.update(prospect.id, payload);
      }

      // 3. Notify parent to update its list state
      onProspectUpdate?.(prospect.id, {
        follow_up_status: newEntry.status,
        next_follow_up: nextFollowUp,
      });

      // 4. Refresh history
      await loadHistory(prospect.id);

      // 5. Reset form (keep selected status)
      setNewEntry((prev) => ({
        status: prev.status,
        notes: "",
        date: todayStr(),
      }));

      toast.success("Follow-up added");
    } catch (e) {
      console.error("Failed to add follow-up", e);
      toast.error("Failed to add follow-up");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={Boolean(prospect)} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FollowUpStatusDot status={newEntry.status} className="h-3 w-3" />
            Follow-Up
          </SheetTitle>
        </SheetHeader>

        {/* Prospect & Company info */}
        <section className="mt-4 space-y-1">
          <p className="text-base font-semibold text-slate-900">
            {prospect.prospect_name}
          </p>
          <p className="text-sm text-slate-500">
            {prospect.company_name || "—"}
          </p>
          {prospect.contact_number && (
            <p className="flex items-center gap-1 text-sm text-slate-500">
              <Phone className="h-3.5 w-3.5" /> {prospect.contact_number}
            </p>
          )}
        </section>

        {/* Add New Follow-Up */}
        <form onSubmit={handleAddFollowUp} className="mt-6 space-y-4">
          <SectionHeader icon={Plus} title="Add New Follow-Up" />

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Date</Label>
              <Input
                type="date"
                value={newEntry.date}
                onChange={set("date")}
                className="mt-1 h-9 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-500">Status</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {FOLLOW_UP_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() =>
                      setNewEntry((prev) => ({ ...prev, status: s.value }))
                    }
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      newEntry.status === s.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot} ${
                        newEntry.status === s.value ? "ring-2 ring-white/30" : ""
                      }`}
                    />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-500">Notes</Label>
              <textarea
                value={newEntry.notes}
                onChange={set("notes")}
                className="mt-1 w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 min-h-[80px]"
                placeholder="What was discussed? Any action items?"
              />
            </div>

            <div>
              <Label className="text-xs text-slate-500">Next Follow-Up Date</Label>
              <Input
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="mt-1 h-9 text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            {saving ? "Adding..." : "Add Follow-Up"}
          </Button>
        </form>

        {/* History Timeline */}
        <section className="mt-8 space-y-3">
          <SectionHeader
            icon={Clock}
            title={`Follow-Up History (${history.length})`}
          />

          {loadingHistory ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-400">
              No follow-ups yet. Add the first one above.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`relative pl-6 ${
                    idx < history.length - 1
                      ? "border-l-2 border-slate-100 pb-3"
                      : ""
                  }`}
                >
                  {/* Timeline dot */}
                  <span
                    className={`absolute left-0 top-1.5 -translate-x-1/2 inline-block h-3 w-3 rounded-full ${
                      STATUS_DOT_MAP[entry.status] || STATUS_DOT_MAP.interested
                    } ring-2 ring-white`}
                  />

                  <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-700">
                          {STATUS_LABEL_MAP[entry.status] || entry.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {entry.date
                          ? format(parseISO(entry.date), "MMM d, yyyy")
                          : "—"}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="mt-1.5 text-sm text-slate-600 whitespace-pre-wrap">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </SheetContent>
    </Sheet>
  );
}

export { STATUS_LABEL_MAP };