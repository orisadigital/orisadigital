import React from "react";
import { cn } from "@/lib/utils";
import { useNotificationCount } from "@/hooks/useNotificationCount";

const LOGO_URL = "https://media.base44.com/images/public/6a66c1df72f6ed66012dc483/10620f056_3.jpg";

export default function AdminSidebar({ activePage, onNavigate, navGroups = [], userEmail, onSignOut, onSignIn }) {
  const { count } = useNotificationCount();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 shrink-0">
        <img src={LOGO_URL} alt="Orisa Digital" className="h-8 w-auto shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">Orisa Digital</p>
          <p className="text-xs text-slate-500 truncate">Admin Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    
                    <span className="truncate">{item.label}</span>
                    {item.id === "notifications" && count > 0 && (
                      <span className="flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full ml-auto h-5 min-w-5 px-1.5">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Signed-in user OR sign-in link */}
      <div className="border-t border-slate-200 px-3 pt-3 pb-2 shrink-0">
        {userEmail ? (
          <div className="flex items-center gap-2">
            <img
              src="/favicon.png"
              alt={userEmail}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">{userEmail}</p>
              <button
                type="button"
                onClick={onSignOut}
                className="text-xs text-slate-400 hover:text-destructive transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <span>Sign in</span>
          </button>
        )}
      </div>
    </aside>
  );
}
