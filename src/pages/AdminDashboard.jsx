import React, { lazy, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Notifications = lazy(() => import("@/pages/admin/Notifications"));
const Calendar = lazy(() => import("@/pages/admin/Calendar"));
const Pipeline = lazy(() => import("@/pages/admin/Pipeline"));
const Prospects = lazy(() => import("@/pages/admin/Prospects"));
const Client = lazy(() => import("@/pages/admin/Client"));
const Projects = lazy(() => import("@/pages/admin/Projects"));
const Payroll = lazy(() => import("@/pages/admin/Payroll"));
const DomainHosting = lazy(() => import("@/pages/admin/DomainHosting"));
const SoftwarePlugin = lazy(() => import("@/pages/admin/SoftwarePlugin"));
const Subscription = lazy(() => import("@/pages/admin/Subscription"));
const AccountSettings = lazy(() => import("@/pages/admin/AccountSettings"));

const PAGES = {
  dashboard: { label: "Dashboard", Component: Dashboard },
  notifications: { label: "Notifications", Component: Notifications },
  calendar: { label: "Calendar", Component: Calendar },
  pipeline: { label: "Pipeline", Component: Pipeline },
  prospects: { label: "Prospects", Component: Prospects },
  client: { label: "Clients", Component: Client },
  projects: { label: "Projects", Component: Projects },
  payroll: { label: "Payroll", Component: Payroll },
  domain_hosting: { label: "Domains & Hosting", Component: DomainHosting },
  software_plugins: { label: "Software & Plugins", Component: SoftwarePlugin },
  subscriptions: { label: "Subscriptions", Component: Subscription },
  account: { label: "Account Settings", Component: AccountSettings },
};

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard" },
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
    ],
  },
  {
    label: "HR",
    items: [
      { id: "payroll" },
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
  {
    label: "Account",
    items: [
      { id: "account" },
    ],
  },
];

// Inject icons and labels into nav groups
NAV_GROUPS.forEach((g) => g.items.forEach((item) => {
  item.label = PAGES[item.id].label;
}));

const DEFAULT_PAGE = "dashboard";

export default function AdminDashboard() {
  // The active page lives in the URL (/admin?page=projects) so reloads and
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


  const { user, logout, navigateToLogin } = useAuth();

  const { Component, label } = PAGES[activePage];

  if (user && user.email !== "orisa.digital@gmail.com") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
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
    <div className="min-h-screen bg-background">
      <AdminSidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        navGroups={NAV_GROUPS}
        userEmail={user?.email}
        onSignOut={() => logout()}
        onSignIn={() => navigateToLogin("/admin")}
      />
      <div className="ml-64">
        <main className="min-h-screen p-8 flex flex-col">
          <div className="mb-6 shrink-0">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Orisa Digital Admin</p>
            <h1 className="text-2xl font-semibold text-slate-900">{label}</h1>
          </div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              </div>
            }
          >
            <Component key={activePage} />
          </Suspense>
        </main>
      </div>
    </div>

  );
}