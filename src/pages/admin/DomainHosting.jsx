import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntityList";
import { format, parseISO, differenceInDays } from "date-fns";
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
import DomainHostingSheet from "@/components/renewals/DomainHostingSheet";
import { RENEWAL_STATUS_STYLES, CYCLE_LABELS, fmtRM } from "@/components/renewals/shared";
import LoadErrorBanner from "@/components/admin/LoadErrorBanner";

export default function DomainHosting() {
  const { data: items, setData: setItems, isLoading: loading, loadError } = useEntityList("DomainHosting", "-renewal_date");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const handleDelete = async (id) => {
    try {
      await base44.entities.DomainHosting.delete(id);
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
        const updated = await base44.entities.DomainHosting.update(id, rest);
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
        toast.success("Updated");
        setEditing(null);
      } else {
        const created = await base44.entities.DomainHosting.create(payload);
        setItems((prev) => [created, ...prev]);
        toast.success("Added");
        setAdding(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    }
  };

  const daysUntil = (date) => {
    if (!date) return null;
    return differenceInDays(parseISO(date), new Date());
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
      <LoadErrorBanner label="domains & hosting" error={loadError} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Button size="sm" className="bg-slate-900 hover:bg-slate-800" onClick={() => setAdding(true)} disabled={Boolean(loadError)}>
          Add Domain / Hosting
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="px-4 font-semibold text-slate-600">Item</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Type</TableHead>
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
                  No domains or hosting yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((i) => {
                const days = daysUntil(i.renewal_date);
                return (
                  <TableRow key={i.id} className="hover:bg-slate-50/50">
                    <TableCell className="px-4 font-medium text-slate-900 flex items-center gap-2">
                      {i.item_name}
                    </TableCell>
                    <TableCell className="px-4 text-slate-600 capitalize">{i.item_type}</TableCell>
                    <TableCell className="px-4 text-slate-700">{i.provider || "—"}</TableCell>
                    <TableCell className="px-4 text-slate-700">{fmtRM(i.cost)}</TableCell>
                    <TableCell className="px-4 text-slate-600">{CYCLE_LABELS[i.billing_cycle] || i.billing_cycle}</TableCell>
                    <TableCell className="px-4 text-slate-500 text-sm">
                      {i.renewal_date ? (
                        <div>
                          {format(parseISO(i.renewal_date), "MMM d, yyyy")}
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
                        <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-slate-400 hover:text-slate-700" onClick={() => setEditing(i)}>Edit</Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-slate-400 hover:text-destructive" onClick={() => handleDelete(i.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DomainHostingSheet record={editing} open={Boolean(editing)} onSave={handleSave} onClose={() => setEditing(null)} />
      <DomainHostingSheet record={null} open={adding} onSave={handleSave} onClose={() => setAdding(false)} />
    </div>
  );
}
