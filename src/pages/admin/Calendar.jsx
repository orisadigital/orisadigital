import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CalendarPanel from "@/components/calendar/CalendarPanel";
import TaskList from "@/components/calendar/TaskList";

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const data = await base44.entities.Task.list();
      setTasks(data);
    } catch (e) {
      console.error("Failed to load tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (task) => {
    const created = await base44.entities.Task.create(task);
    setTasks((prev) => [...prev, created]);
  };

  const handleComplete = async (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_completed: true } : t))
    );
    await base44.entities.Task.update(taskId, { is_completed: true });
  };

  const handleUpdate = async (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
    await base44.entities.Task.update(taskId, updates);
  };

  const handleDelete = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await base44.entities.Task.delete(taskId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => !t.is_completed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      <div className="lg:col-span-4 h-full">
        <CalendarPanel
          tasks={tasks}
          onAddTask={handleAddTask}
          onComplete={handleComplete}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
      <div className="lg:col-span-1 h-full">
        <TaskList
          tasks={pendingTasks}
          onComplete={handleComplete}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAddTask={handleAddTask}
        />
      </div>
    </div>
  );
}