import React, { useState } from "react";
import { LayoutDashboard, Bell, Calendar as CalendarIcon, Filter, UserPlus, FolderKanban, FileText, Receipt, Users, BookOpen, Globe, Package, Boxes } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Dashboard from "@/pages/admin/Dashboard";
import Notifications from "@/pages/admin/Notifications";
import Calendar from "@/pages/admin/Calendar";
import Pipeline from "@/pages/admin/Pipeline";
import Prospects from "@/pages/admin/Prospects";
import Client from "@/pages/admin/Client";
import Projects from "@/pages/admin/Projects";
import Documents from "@/pages/admin/Documents";
import Quotations from "@/pages/admin/Quotations";
import Invoices from "@/pages/admin/Invoices";
import KnowledgeBase from "@/pages/admin/KnowledgeBase";
import DomainHosting from "@/pages/admin/DomainHosting";
import SoftwarePlugin from "@/pages/admin/SoftwarePlugin";
import Subscription from "@/pages/admin/Subscription";
import { SalesAssistantProvider } from "@/components/dashboard/SalesAssistantContext";

const PAGES = {
  dashboard: { label: "Dashboard", Component: Dashboard, Icon: LayoutDashboard },
  knowledge: { label: "Knowledge Base", Component: KnowledgeBase, Icon: BookOpen },
  notifications: { label: "Notifications", Component: Notifications, Icon: Bell },
  calendar: { label: "Calendar", Component: Calendar, Icon: CalendarIcon },
  pipeline: { label: "Pipeline", Component: Pipeline, Icon: Filter },
  prospects: { label: "Prospects", Component: Prospects, Icon: Users },
  client: { label: "Clients", Component: Client, Icon: UserPlus },
  projects: { label: "Projects", Component: Projects, Icon: FolderKanban },
  documents: { label: "Documents", Component: Documents, Icon: FileText },
  quotations: { label: "Quotations", Component: Quotations, Icon: FileText },
  invoices: { label: "Invoices", Component: Invoices, Icon: Receipt },
  domain_hosting: { label: "Domains & Hosting", Component: DomainHosting, Icon: Globe },
  software_plugins: { label: "Software & Plugins", Component: SoftwarePlugin, Icon: Package },
  subscriptions: { label: "Subscriptions", Component: Subscription, Icon: Boxes },
};

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard" },
      { id: "knowledge" },
      { id: "notifications" },
      { id: "calendar" },
    ],
  },
  {
    label: "Sales Pipeline",
    items: [
      { id: "pipeline" },
      { id: "prospects" },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "client" },
      { id: "projects" },
      { id: "documents" },
    ],
  },
  {
    label: "Accounting",
    items: [
      { id: "quotations" },
      { id: "invoices" },
    ],
  },
  {
    label: "Renewals & Subscriptions",
    items: [
      { id: "domain_hosting" },
      { id: "software_plugins" },
      { id: "subscriptions" },
    ],
  },
];

// Inject icons and labels into nav groups
NAV_GROUPS.forEach((g) => g.items.forEach((item) => {
  item.Icon = PAGES[item.id].Icon;
  item.label = PAGES[item.id].label;
}));

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");

  const [collapsed, setCollapsed] = useState(false);

  const { user, logout, navigateToLogin } = useAuth();

  const { Component, label } = PAGES[activePage];

  if (user && user.email !== "orisa.digital@gmail.com") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Access denied</h1>
          <p className="text-sm text-slate-500 mb-6">
            You are signed in as <span className="font-medium text-slate-700">{user.email}</span>, but only the admin account can access this dashboard.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              type="button"
              onClick={() => logout("/login")}
              className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-800 w-full max-w-xs"
            >
              Sign in with admin account
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SalesAssistantProvider>
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar
          activePage={activePage}
          onNavigate={setActivePage}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          navGroups={NAV_GROUPS}
          userEmail={user?.email}
          onSignOut={() => logout()}
          onSignIn={() => navigateToLogin("/admin")}
        />
        <div className={`transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
          <main className="min-h-screen p-8 flex flex-col">
            <div className="mb-6 shrink-0">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Orisa Digital Admin</p>
              <h1 className="text-2xl font-semibold text-slate-900">{label}</h1>
            </div>
            <Component key={activePage} />
          </main>
        </div>
      </div>
    </SalesAssistantProvider>
  );
}