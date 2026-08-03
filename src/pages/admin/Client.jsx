import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";
import { UserPlus, Trash2, Pencil, Plus } from "lucide-react";
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
import ClientEditSheet from "@/components/clients/ClientEditSheet";
import ClientAddSheet from "@/components/clients/ClientAddSheet";

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
};

const SOURCE_STYLES = {
  website: "bg-blue-100 text-blue-700 border-blue-200",
  social_media: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  referral: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cold_outreach: "bg-orange-100 text-orange-700 border-orange-200",
  door_to_door: "bg-amber-100 text-amber-700 border-amber-200",
  networking: "bg-violet-100 text-violet-700 border-violet-200",
};

export default function Client() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState(null);
  const [addingClient, setAddingClient] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await base44.entities.Client.list("-created_date");
        setClients(data);
      } catch (e) {
        console.error("Failed to load clients", e);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const handleDelete = async (clientId) => {
    try {
      await base44.entities.Client.delete(clientId);
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      toast.success("Client deleted");
    } catch (e) {
      console.error("Failed to delete client", e);
      toast.error("Failed to delete client");
    }
  };

  const handleCreateClient = async (payload) => {
    try {
      const created = await base44.entities.Client.create({
        ...payload,
        status: payload.status || "active",
        converted_from: "prospect",
        date_converted: new Date().toISOString().split("T")[0],
      });
      setClients((prev) => [created, ...prev]);
      toast.success("Client added");
      setAddingClient(false);
    } catch (e) {
      console.error("Failed to add client", e);
      toast.error("Failed to add client");
    }
  };

  const handleUpdateClient = async (updated) => {
    try {
      const { id, ...payload } = updated;
      await base44.entities.Client.update(id, payload);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...payload } : c))
      );
      toast.success("Client updated");
      setEditingClient(null);
    } catch (e) {
      console.error("Failed to update client", e);
      toast.error("Failed to update client");
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-500">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </span>
        </div>
        <Button size="sm" className="bg-slate-900 hover:bg-slate-800" onClick={() => setAddingClient(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Client
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="px-4 font-semibold text-slate-600">Client</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Company</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Contact</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Source</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Converted From</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Date Converted</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Status</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                  No clients yet. Convert prospects from the Prospects page.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow key={c.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-4 font-medium text-slate-900">
                    {c.client_name}
                  </TableCell>
                  <TableCell className="px-4 text-slate-700">
                    {c.company_name || "—"}
                  </TableCell>
                  <TableCell className="px-4 text-slate-500 text-sm">
                    <div>
                      {c.contact_email && <p>{c.contact_email}</p>}
                      {c.contact_number && <p className="text-xs text-slate-400">{c.contact_number}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge
                      variant="outline"
                      className={SOURCE_STYLES[c.inquiry_source] || SOURCE_STYLES.website}
                    >
                      {(c.inquiry_source || "website").replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge variant="outline" className="capitalize">
                      {c.converted_from || "prospect"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 text-slate-500 text-sm">
                    {c.date_converted
                      ? format(parseISO(c.date_converted), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[c.status] || STATUS_STYLES.active}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-400 hover:text-slate-700"
                        onClick={() => setEditingClient(c)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-400 hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClientEditSheet
        client={editingClient}
        onUpdate={handleUpdateClient}
        onClose={() => setEditingClient(null)}
      />

      <ClientAddSheet
        open={addingClient}
        onCreate={handleCreateClient}
        onClose={() => setAddingClient(false)}
      />
    </div>
  );
}