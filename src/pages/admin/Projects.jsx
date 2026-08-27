import React, { useState,  useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntityList";
import { format, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
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
import ProjectAddSheet from "@/components/projects/ProjectAddSheet";
import ProjectsSummary from "@/components/projects/ProjectsSummary";
import RecurringProjectsTable from "@/components/projects/RecurringProjectsTable";
import LoadErrorBanner from "@/components/admin/LoadErrorBanner";

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

export default function Projects() {
  const projectsQ = useEntityList("Project", "-created_date");
  const clientsQ = useEntityList("Client", "-created_date");

  const projects = projectsQ.data;
  const setProjects = projectsQ.setData;
  const loading = projectsQ.isLoading || clientsQ.isLoading;
  const loadError = projectsQ.loadError || clientsQ.loadError;
  const clientSourceMap = useMemo(
    () => Object.fromEntries(clientsQ.data.map((c) => [c.id, c.inquiry_source])),
    [clientsQ.data]
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const oneOffProjects = projects.filter((p) => !p.is_recurring);
  const recurringProjects = projects.filter((p) => p.is_recurring);

  const handleAddClick = () => {
    setEditingProject(null);
    setSheetOpen(true);
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setSheetOpen(true);
  };

  const handleClose = () => {
    setSheetOpen(false);
    setEditingProject(null);
  };

  const handleSave = async (form) => {
    try {
      if (editingProject) {
        const { id, ...updates } = form;
        await base44.entities.Project.update(editingProject.id, updates);
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? { ...p, ...updates } : p))
        );
        toast.success("Project updated");
      } else {
        const created = await base44.entities.Project.create(form);
        setProjects((prev) => [created, ...prev]);
        toast.success("Project added");
      }
      handleClose();
    } catch (e) {
      console.error("Failed to save project", e);
      toast.error("Failed to save project");
    }
  };

  const handleDelete = async (project) => {
    try {
      await base44.entities.Project.delete(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      toast.success("Project deleted");
    } catch (e) {
      console.error("Failed to delete project", e);
      toast.error("Failed to delete project");
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
      <LoadErrorBanner label="projects" error={loadError} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
        <Button size="sm" onClick={handleAddClick} className="bg-slate-900 hover:bg-slate-800" disabled={Boolean(loadError)}>
          Add Project
        </Button>
      </div>

      <ProjectsSummary projects={projects} clientSourceMap={clientSourceMap} />

      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-slate-900">One-Off Projects</h3>
        <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
          {oneOffProjects.length}
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
              <TableHead className="px-4 font-semibold text-slate-600">Sale Amount</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Delivery Date</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Status</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Domain Expiry</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600">Hosting Expiry</TableHead>
              <TableHead className="px-4 font-semibold text-slate-600 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {oneOffProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-slate-400">
                  No projects yet.
                </TableCell>
              </TableRow>
            ) : (
              oneOffProjects.map((p) => (
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
                    {p.sale_amount > 0
                      ? `RM ${Number(p.sale_amount).toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell className="px-4 text-slate-500 text-sm">
                    {p.delivery_date
                      ? format(parseISO(p.delivery_date), "MMM d, yyyy")
                      : "—"}
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

      <RecurringProjectsTable
        projects={recurringProjects}
        clientSourceMap={clientSourceMap}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      {sheetOpen && (
        <ProjectAddSheet
          project={editingProject}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
