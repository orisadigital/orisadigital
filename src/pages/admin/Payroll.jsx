import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
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
import { fmtRM } from "@/components/renewals/shared";
import {
  PAYROLL_STATUS_STYLES,
  PAYMENT_METHOD_LABELS,
} from "@/components/hr/shared";
import PayrollEditSheet from "@/components/hr/PayrollEditSheet";
import PayrollAddSheet from "@/components/hr/PayrollAddSheet";
import LoadErrorBanner from "@/components/admin/LoadErrorBanner";
import PayrollTotalsChart from "@/components/hr/PayrollTotalsChart";

export default function Payroll() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [addingRecord, setAddingRecord] = useState(false);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const data = await base44.entities.Payroll.list("-pay_date");
        setRecords(data);
      } catch (e) {
        // Keep the reason on screen rather than only in the console: an empty
        // list and an unreadable one look identical otherwise, and writing is
        // pointless while reading fails.
        console.error("Failed to load payroll", e);
        setLoadError(e?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  // Only pending records are money still owed; paid and cancelled are settled.
  const pendingTotal = useMemo(
    () => records.filter((r) => r.status === "pending").reduce((sum, r) => sum + (Number(r.basic_salary) || 0), 0),
    [records]
  );

  const handleDelete = async (recordId) => {
    try {
      await base44.entities.Payroll.delete(recordId);
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
      toast.success("Payroll record deleted");
    } catch (e) {
      console.error("Failed to delete payroll record", e);
      toast.error("Failed to delete payroll record");
    }
  };

  const handleCreateRecord = async (payload) => {
    try {
      const created = await base44.entities.Payroll.create({
        ...payload,
        status: payload.status || "pending",
      });
      setRecords((prev) => [created, ...prev]);
      toast.success("Payroll record added");
      setAddingRecord(false);
    } catch (e) {
      console.error("Failed to add payroll record", e);
      toast.error("Failed to add payroll record");
    }
  };

  const handleUpdateRecord = async (updated) => {
    try {
      const { id, ...payload } = updated;
      await base44.entities.Payroll.update(id, payload);
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...payload } : r))
      );
      toast.success("Payroll record updated");
      setEditingRecord(null);
    } catch (e) {
      console.error("Failed to update payroll record", e);
      toast.error("Failed to update payroll record");
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
      <LoadErrorBanner label="payroll records" error={loadError} />

      {!loadError && <PayrollTotalsChart records={records} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {loadError ? (
              "Unavailable"
            ) : (
              <>
                {records.length} record{records.length !== 1 ? "s" : ""}
                {pendingTotal > 0 && (
                  <span className="text-slate-400"> · {fmtRM(pendingTotal)} pending</span>
                )}
              </>
            )}
          </span>
        </div>
        <Button
          size="sm"
          className="bg-slate-900 hover:bg-slate-800"
          onClick={() => setAddingRecord(true)}
          disabled={Boolean(loadError)}
          title={loadError ? "Payroll records could not be loaded" : undefined}
        >
          Add Record
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="px-4 font-semibold text-slate-600">Employee</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Position</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Type</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Pay Date</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Amount</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Method</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Status</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                  No records to show.
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                  No payroll records yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-4 font-medium text-slate-900">
                    {r.employee_name}
                  </TableCell>
                  <TableCell className="px-4 text-slate-700">
                    {r.employee_position || "—"}
                  </TableCell>
                  <TableCell className="px-4 text-slate-700">
                    {r.payment_type || "—"}
                    {(r.project || r.commission) && (
                      <p className="text-xs text-slate-400">{r.project || r.commission}</p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 text-slate-500 text-sm">
                    {r.pay_date ? format(parseISO(r.pay_date), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="px-4 font-medium text-slate-900">{fmtRM(r.basic_salary)}</TableCell>
                  <TableCell className="px-4 text-slate-500 text-sm">
                    {PAYMENT_METHOD_LABELS[r.payment_method] || "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge
                      variant="outline"
                      className={PAYROLL_STATUS_STYLES[r.status] || PAYROLL_STATUS_STYLES.pending}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900"
                        onClick={() => setEditingRecord(r)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-slate-500 hover:text-destructive"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PayrollEditSheet
        record={editingRecord}
        onUpdate={handleUpdateRecord}
        onClose={() => setEditingRecord(null)}
      />

      <PayrollAddSheet
        open={addingRecord}
        onCreate={handleCreateRecord}
        onClose={() => setAddingRecord(false)}
      />
    </div>
  );
}
