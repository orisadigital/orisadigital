import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Boxes, Trash2, Pencil, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SubscriptionSheet from "@/components/renewals/SubscriptionSheet";
import { RENEWAL_STATUS_STYLES, CYCLE_LABELS, fmtRM, formatRenewalDate, daysUntilRenewal } from "@/components/renewals/shared";
import LoadErrorBanner from "@/components/admin/LoadErrorBanner";

export default function Subscription() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    try {
      const data = await base44.entities.Subscription.list("-renewal_date");
      setItems(data);
    } catch (e) {
      console.error("Failed to load subscriptions", e);
      setLoadError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await base44.entities.Subscription.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    }
  };

  const handleSave = async (payload) => {
    try {
      if (editing) {
        const { id, ...rest } = payload;
        const updated = await base44.entities.Subscription.update(id, rest);
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
        toast.success("Updated");
        setEditing(null);
      } else {
        const created = await base44.entities.Subscription.create(payload);
        setItems((prev) => [created, ...prev]);
        toast.success("Added");
        setAdding(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    }
  };

  const daysUntil = (date, cycle) => daysUntilRenewal(date, cycle);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LoadErrorBanner label="subscriptions" error={loadError} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-500">
            {items.length} subscription{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Button size="sm" className="bg-slate-900 hover:bg-slate-800" onClick={() => setAdding(true)} disabled={Boolean(loadError)}>
          <Plus className="h-3.5 w-3.5" />
          Add Subscription
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="px-4 font-semibold text-slate-600">Name</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Category</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Provider</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Cost</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Cycle</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Renewal</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Status</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                  No subscriptions yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((i) => {
                const days = daysUntil(i.renewal_date, i.billing_cycle);
                return (
                  <TableRow key={i.id} className="hover:bg-slate-50/50">
                    <TableCell className="px-4 font-medium text-slate-900">{i.name}</TableCell>
                    <TableCell className="px-4 text-slate-600">{i.category || "—"}</TableCell>
                    <TableCell className="px-4 text-slate-700">{i.provider || "—"}</TableCell>
                    <TableCell className="px-4 text-slate-700">{fmtRM(i.cost)}</TableCell>
                    <TableCell className="px-4 text-slate-600">{CYCLE_LABELS[i.billing_cycle] || i.billing_cycle}</TableCell>
                    <TableCell className="px-4 text-slate-500 text-sm">
                      {i.renewal_date ? (
                        <div>
                          {formatRenewalDate(i.renewal_date, i.billing_cycle)}
                          {days !== null && (
                            <span className={`block text-xs ${days < 0 ? "text-rose-500" : days <= 30 ? "text-amber-500" : "text-slate-400"}`}>
                              {days < 0 ? `${Math.abs(days)}d ago` : `in ${days}d`}
                            </span>
                          )}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge variant="outline" className={RENEWAL_STATUS_STYLES[i.status] || RENEWAL_STATUS_STYLES.active}>
                        {i.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-slate-700" onClick={() => setEditing(i)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-destructive" onClick={() => handleDelete(i.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <SubscriptionSheet record={editing} open={Boolean(editing)} onSave={handleSave} onClose={() => setEditing(null)} />
      <SubscriptionSheet record={null} open={adding} onSave={handleSave} onClose={() => setAdding(false)} />
    </div>
  );
}
