import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Save, FolderKanban, Globe, Server, Layout, KeyRound, Plus, X, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

const EMPTY_FORM = {
  project_name: "",
  client_id: "",
  company_name: "",
  person_in_charge: "",
  contact_number: "",
  email: "",
  sale_amount: 0,
  is_recurring: false,
  recurring_amount: 0,
  recurring_cycle: "monthly",
  webmaster_email: "",
  webmaster_username: "",
  webmaster_password: "",
  domain_names: [],
  domain_name: "",
  domain_name_other: "",
  domain_username: "",
  domain_password: "",
  domain_backup_code: "",
  hosting_name: "",
  hosting_name_other: "",
  hosting_username: "",
  hosting_password: "",
  hosting_backup_code: "",
  cpanel_username: "",
  cpanel_password: "",
  wp_admin1_username: "",
  wp_admin1_password: "",
  wp_admin2_username: "",
  wp_admin2_password: "",
  wp_client_username: "",
  wp_client_password: "",
  domain_expiry_date: "",
  hosting_expiry_date: "",
  delivery_date: "",
  status: "active",
};

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
      <Icon className="h-4 w-4 text-slate-400" />
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <Label className="text-xs text-slate-500">
        {label}{required && " *"}
      </Label>
      {children}
    </div>
  );
}

const inputCls = "mt-1 h-9 text-sm";

export default function ProjectAddSheet({ project, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    base44.entities.Client.list("-created_date")
      .then(setClients)
      .catch((e) => console.error("Failed to load clients", e))
      .finally(() => setLoadingClients(false));
  }, []);

  useEffect(() => {
    if (project) {
      setForm({ ...EMPTY_FORM, ...project, domain_names: project.domain_names || [] });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [project]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setForm((prev) => ({
        ...prev,
        client_id: clientId,
        company_name: client.company_name || "",
        person_in_charge: client.client_name || "",
        contact_number: client.contact_number || "",
        email: client.contact_email || "",
      }));
    } else {
      setForm((prev) => ({ ...prev, client_id: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(form);
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{project ? "Edit Project" : "Add Project"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="credentials" className="flex-1">Credentials</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-4">
              <section className="space-y-3">
                <SectionHeader icon={FolderKanban} title="Project Info" />
                <Field label="Project Name" required>
                  <Input value={form.project_name} onChange={set("project_name")} className={inputCls} placeholder="Website Redesign" />
                </Field>
                <Field label="Client">
                  <select
                    value={form.client_id}
                    onChange={handleClientSelect}
                    disabled={loadingClients}
                    className="mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3"
                  >
                    <option value="">— Select a client —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.client_name} ({c.company_name || "No company"})
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Company Name">
                    <Input value={form.company_name} onChange={set("company_name")} className={inputCls} />
                  </Field>
                  <Field label="Person In Charge">
                    <Input value={form.person_in_charge} onChange={set("person_in_charge")} className={inputCls} />
                  </Field>
                  <Field label="Contact Number">
                    <Input value={form.contact_number} onChange={set("contact_number")} className={inputCls} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={form.email} onChange={set("email")} className={inputCls} />
                  </Field>
                  <Field label="Sale Amount (RM)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.sale_amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, sale_amount: parseFloat(e.target.value) || 0 }))}
                      className={inputCls}
                      placeholder="0.00"
                    />
                  </Field>
                  <Field label="Delivery Date">
                    <Input type="date" value={form.delivery_date} onChange={set("delivery_date")} className={inputCls} />
                  </Field>
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={set("status")}
                      className="mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3"
                    >
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </Field>
                </div>
              </section>

              {/* Recurring Sale */}
              <section className="space-y-3">
                <SectionHeader icon={RefreshCw} title="Recurring Sale" />
                <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Enable recurring sale</p>
                    <p className="text-xs text-slate-500">Charge the client on a recurring cycle</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.is_recurring}
                    onClick={() => setForm((prev) => ({ ...prev, is_recurring: !prev.is_recurring }))}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${form.is_recurring ? "bg-slate-900" : "bg-slate-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_recurring ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
                {form.is_recurring && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Recurring Amount (RM)">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.recurring_amount}
                        onChange={(e) => setForm((prev) => ({ ...prev, recurring_amount: parseFloat(e.target.value) || 0 }))}
                        className={inputCls}
                        placeholder="0.00"
                      />
                    </Field>
                    <Field label="Billing Cycle">
                      <select
                        value={form.recurring_cycle}
                        onChange={set("recurring_cycle")}
                        className="mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </Field>
                  </div>
                )}
              </section>

              {/* Domain Names */}
              <section className="space-y-3">
                <SectionHeader icon={Globe} title="Domain Names" />
                <div className="space-y-2">
                  {(form.domain_names || []).map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={name}
                        onChange={(e) => setForm((prev) => {
                          const next = [...(prev.domain_names || [])];
                          next[idx] = e.target.value;
                          return { ...prev, domain_names: next };
                        })}
                        className={inputCls}
                        placeholder="www.example.com"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-400 hover:text-destructive shrink-0"
                        onClick={() => setForm((prev) => ({
                          ...prev,
                          domain_names: (prev.domain_names || []).filter((_, i) => i !== idx),
                        }))}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      domain_names: [...(prev.domain_names || []), ""],
                    }))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Domain
                  </Button>
                </div>
              </section>
            </TabsContent>

            {/* Credentials Tab */}
            <TabsContent value="credentials" className="space-y-6 mt-4">
              {/* Webmaster */}
              <section className="space-y-3">
                <SectionHeader icon={KeyRound} title="Webmaster" />
                <Field label="Email">
                  <Input type="email" value={form.webmaster_email} onChange={set("webmaster_email")} className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Username">
                    <Input value={form.webmaster_username} onChange={set("webmaster_username")} className={inputCls} />
                  </Field>
                  <Field label="Password">
                    <Input value={form.webmaster_password} onChange={set("webmaster_password")} className={inputCls} />
                  </Field>
                </div>
              </section>

              {/* Domain */}
              <section className="space-y-3">
                <SectionHeader icon={Globe} title="Domain" />
                <Field label="Domain">
                  <select
                    value={form.domain_name}
                    onChange={set("domain_name")}
                    className="mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3"
                  >
                    <option value="">— Select domain provider —</option>
                    <option value="GoDaddy">GoDaddy</option>
                    <option value="Shinjiru">Shinjiru</option>
                    <option value="Others">Others</option>
                  </select>
                  {form.domain_name === "Others" && (
                    <Input
                      value={form.domain_name_other}
                      onChange={set("domain_name_other")}
                      className={inputCls}
                      placeholder="Specify domain provider"
                    />
                  )}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Username">
                    <Input value={form.domain_username} onChange={set("domain_username")} className={inputCls} />
                  </Field>
                  <Field label="Password">
                    <Input value={form.domain_password} onChange={set("domain_password")} className={inputCls} />
                  </Field>
                </div>
                <Field label="Backup Code">
                  <Input value={form.domain_backup_code} onChange={set("domain_backup_code")} className={inputCls} />
                </Field>
              </section>

              {/* Hosting */}
              <section className="space-y-3">
                <SectionHeader icon={Server} title="Hosting" />
                <Field label="Hosting Provider">
                  <select
                    value={form.hosting_name}
                    onChange={set("hosting_name")}
                    className="mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3"
                  >
                    <option value="">— Select hosting provider —</option>
                    <option value="Green Geeks">Green Geeks</option>
                    <option value="Shinjiru">Shinjiru</option>
                    <option value="Others">Others</option>
                  </select>
                  {form.hosting_name === "Others" && (
                    <Input
                      value={form.hosting_name_other}
                      onChange={set("hosting_name_other")}
                      className={inputCls}
                      placeholder="Specify hosting provider"
                    />
                  )}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Username">
                    <Input value={form.hosting_username} onChange={set("hosting_username")} className={inputCls} />
                  </Field>
                  <Field label="Password">
                    <Input value={form.hosting_password} onChange={set("hosting_password")} className={inputCls} />
                  </Field>
                </div>
                <Field label="Backup Code">
                  <Input value={form.hosting_backup_code} onChange={set("hosting_backup_code")} className={inputCls} />
                </Field>
              </section>

              {/* cPanel */}
              <section className="space-y-3">
                <SectionHeader icon={Server} title="cPanel" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Username">
                    <Input value={form.cpanel_username} onChange={set("cpanel_username")} className={inputCls} />
                  </Field>
                  <Field label="Password">
                    <Input value={form.cpanel_password} onChange={set("cpanel_password")} className={inputCls} />
                  </Field>
                </div>
              </section>

              {/* WordPress */}
              <section className="space-y-3">
                <SectionHeader icon={Layout} title="WordPress" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Admin 1 Username">
                    <Input value={form.wp_admin1_username} onChange={set("wp_admin1_username")} className={inputCls} />
                  </Field>
                  <Field label="Admin 1 Password">
                    <Input value={form.wp_admin1_password} onChange={set("wp_admin1_password")} className={inputCls} />
                  </Field>
                  <Field label="Admin 2 Username">
                    <Input value={form.wp_admin2_username} onChange={set("wp_admin2_username")} className={inputCls} />
                  </Field>
                  <Field label="Admin 2 Password">
                    <Input value={form.wp_admin2_password} onChange={set("wp_admin2_password")} className={inputCls} />
                  </Field>
                  <Field label="Client Username">
                    <Input value={form.wp_client_username} onChange={set("wp_client_username")} className={inputCls} />
                  </Field>
                  <Field label="Client Password">
                    <Input value={form.wp_client_password} onChange={set("wp_client_password")} className={inputCls} />
                  </Field>
                </div>
              </section>

              {/* Expiry Dates */}
              <section className="space-y-3">
                <SectionHeader icon={KeyRound} title="Expiry Dates" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Domain Expiry Date">
                    <select
                      value={["Own Domain"].includes(form.domain_expiry_date) ? form.domain_expiry_date : "date"}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        domain_expiry_date: e.target.value === "date" ? "" : e.target.value,
                      }))}
                      className="mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3"
                    >
                      <option value="date">Date</option>
                      <option value="Own Domain">Own Domain</option>
                    </select>
                    {form.domain_expiry_date !== "Own Domain" && (
                      <Input type="date" value={form.domain_expiry_date} onChange={set("domain_expiry_date")} className={inputCls} />
                    )}
                  </Field>
                  <Field label="Hosting Expiry Date">
                    <select
                      value={["Orisa Digital Hosting", "Own Hosting"].includes(form.hosting_expiry_date) ? form.hosting_expiry_date : "date"}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        hosting_expiry_date: e.target.value === "date" ? "" : e.target.value,
                      }))}
                      className="mt-1 h-9 w-full text-sm rounded-md border border-input bg-transparent px-3"
                    >
                      <option value="date">Date</option>
                      <option value="Orisa Digital Hosting">Orisa Digital Hosting</option>
                      <option value="Own Hosting">Own Hosting</option>
                    </select>
                    {!["Orisa Digital Hosting", "Own Hosting"].includes(form.hosting_expiry_date) && (
                      <Input type="date" value={form.hosting_expiry_date} onChange={set("hosting_expiry_date")} className={inputCls} />
                    )}
                  </Field>
                </div>
              </section>
            </TabsContent>
          </Tabs>

          <SheetFooter className="mt-4">
            <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800">
              <Save className="h-3.5 w-3.5" />
              {project ? "Save Changes" : "Add Project"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}