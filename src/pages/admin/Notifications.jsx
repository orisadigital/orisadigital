import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { addDays, isSameDay, format } from "date-fns";
import { Bell, CheckCircle2, CalendarClock } from "lucide-react";
import { refreshNotificationCount } from "@/hooks/useNotificationCount";

export default function Notifications() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const tasks = await base44.entities.Task.list();
        const tomorrow = addDays(new Date(), 1);
        const filtered = tasks.filter(
          (t) => !t.is_completed && new Date(t.date) <= tomorrow
        );
        setReminders(filtered);
      } catch (e) {
        console.error("Failed to load notifications", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, []);

  const handleComplete = async (taskId) => {
    setCompletingId(taskId);
    try {
      await base44.entities.Task.update(taskId, { is_completed: true });
      setReminders((prev) => prev.filter((t) => t.id !== taskId));
      refreshNotificationCount();
    } catch (e) {
      console.error("Failed to complete task", e);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div>
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
          <CheckCircle2 className="w-12 h-12 text-slate-300 mb-4" />
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
                <CalendarClock className="w-5 h-5 text-amber-500 shrink-0" />
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
                <CheckCircle2 className="w-4 h-4" />
                Mark done
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}