import React, { useState,  useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/hooks/useEntityList";
import { addDays, format } from "date-fns";
import { refreshNotificationCount } from "@/hooks/useNotificationCount";
import LoadErrorBanner from "@/components/admin/LoadErrorBanner";

export default function Notifications() {
  const { data: tasks, setData: setTasks, isLoading: loading, loadError } = useEntityList("Task");

  const reminders = useMemo(() => {
    const tomorrow = addDays(new Date(), 1);
    return tasks.filter((t) => !t.is_completed && new Date(t.date) <= tomorrow);
  }, [tasks]);
  const [completingId, setCompletingId] = useState(null);

  const handleComplete = async (taskId) => {
    setCompletingId(taskId);
    try {
      await base44.entities.Task.update(taskId, { is_completed: true });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, is_completed: true } : t)));
      refreshNotificationCount();
    } catch (e) {
      console.error("Failed to complete task", e);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div>
      <LoadErrorBanner label="notifications" error={loadError} className="mb-4" />

      <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tasks due tomorrow or overdue
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-slate-900">All caught up!</p>
          <p className="text-sm text-slate-500 mt-1">
            No tasks due tomorrow.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reminders.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-slate-900">{task.task_title}</p>
                  <p className="text-xs text-slate-500">
                    Due {format(new Date(task.date), "EEE, MMM d")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleComplete(task.id)}
                disabled={completingId === task.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200 transition-colors disabled:opacity-50"
              >
                Mark done
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
