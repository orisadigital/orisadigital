import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutDashboard, Bell, Calendar as CalendarIcon, Filter, UserPlus, Users, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Dashboard from "@/pages/admin/Dashboard";
import Notifications from "@/pages/admin/Notifications";
import Calendar from "@/pages/admin/Calendar";
import Pipeline from "@/pages/admin/Pipeline";
import Prospects from "@/pages/admin/Prospects";
import Client from "@/pages/admin/Client";
import KnowledgeBase from "@/pages/admin/KnowledgeBase";
import { SalesAssistantProvider } from "@/components/dashboard/SalesAssistantContext";

// Marketer-facing subset of the admin dashboard: no accounting, no renewals.
const PAGES = {
  dashboard: { label: "Dashboard", Component: Dashboard, Icon: LayoutDashboard },
  knowledge: { label: "Knowledge Base", Component: KnowledgeBase, Icon: BookOpen },
  notifications: { label: "Notifications", Component: Notifications, Icon: Bell },
  calendar: { label: "Calendar", Component: Calendar, Icon: CalendarIcon },
  pipeline: { label: "Pipeline", Component: Pipeline, Icon: Filter },
  prospects: { label: "Prospects", Component: Prospects, Icon: Users },
  client: { label: "Clients", Component: Client, Icon: UserPlus },
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
    ],
  },
];

// Inject icons and labels into nav groups
NAV_GROUPS.forEach((g) => g.items.forEach((item) => {
  item.Icon = PAGES[item.id].Icon;
  item.label = PAGES[item.id].label;
}));

const DEFAULT_PAGE = "dashboard";

// profiles.role is free text; set it to 'marketer' in SQL (same as any role change).
const ALLOWED_ROLES = ["marketer", "admin"];

export default function MarketerDashboard() {
  // The active page lives in the URL (/marketer?page=pipeline) so reloads and
  // browser back/forward land where the user left off.
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const activePage = pageParam && PAGES[pageParam] ? pageParam : DEFAULT_PAGE;

  useEffect(() => {
    if (pageParam && !PAGES[pageParam]) {
      setSearchParams({ page: DEFAULT_PAGE }, { replace: true });
    }
  }, [pageParam, setSearchParams]);

  const handleNavigate = useCallback((pageId) => {
    setSearchParams({ page: pageId });
  }, [setSearchParams]);

  const [collapsed, setCollapsed] = useState(false);

  const { user, logout, navigateToLogin } = useAuth();

  const { Component, label } = PAGES[activePage];

  if (user && !ALLOWED_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Access denied</h1>
          <p className="text-sm text-slate-500 mb-6">
            You are signed in as <span className="font-medium text-slate-700">{user.email}</span>, but this dashboard is only available to marketer accounts.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button
              type="button"
              onClick={() => logout("/login")}
              className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-800 w-full max-w-xs"
            >
              Sign in with a marketer account
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
          onNavigate={handleNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          navGroups={NAV_GROUPS}
          subtitle="Marketer Dashboard"
          userEmail={user?.email}
          onSignOut={() => logout()}
          onSignIn={() => navigateToLogin("/marketer")}
        />
        <div className={`transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
          <main className="min-h-screen p-8 flex flex-col">
            <div className="mb-6 shrink-0">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Orisa Digital Marketing</p>
              <h1 className="text-2xl font-semibold text-slate-900">{label}</h1>
            </div>
            <Component key={activePage} />
          </main>
        </div>
      </div>
    </SalesAssistantProvider>
  );
}
