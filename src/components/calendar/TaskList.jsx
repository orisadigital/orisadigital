import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";

const todayStr = () => new Date().toISOString().split("T")[0];

export default function TaskList({ tasks, onComplete, onUpdate, onDelete, onAddTask }) {
  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [date, setDate] = useState(todayStr());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ task_title: "", date: "" });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!taskTitle || !date) return;
    onAddTask?.({ task_title: taskTitle, date, is_completed: false });
    setTaskTitle("");
    setDate(todayStr());
    setShowForm(false);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditForm({ task_title: task.task_title, date: task.date });
  };

  const saveEdit = (id) => {
    onUpdate(id, editForm);
    setEditingId(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-900">Tasks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Add
        </button>
      </div>

      {/* Inline Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-3 space-y-2 pb-3 border-b border-slate-100">
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title"
            className="h-8 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 text-sm flex-1"
            />
            <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 h-8">
              Add
            </Button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-1 overflow-y-auto flex-1">
        {tasks.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center h-20 text-slate-300">
            <span className="text-xs">No pending tasks</span>
          </div>
        )}
        {tasks.map((task) => (
          <div key={task.id}>
            {editingId === task.id ? (
              <div className="space-y-1.5 py-1">
                <Input
                  value={editForm.task_title}
                  onChange={(e) => setEditForm({ ...editForm, task_title: e.target.value })}
                  className="h-7 text-sm"
                />
                <div className="flex gap-1">
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="h-7 text-sm flex-1"
                  />
                  <Button size="sm" className="text-xs bg-slate-900 hover:bg-slate-800 h-7 px-2" onClick={() => saveEdit(task.id)}>Save</Button>
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-slate-50 group">
                <button
                  onClick={() => onComplete(task.id)}
                  className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-500 transition-colors flex items-center justify-center"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 truncate">{task.task_title}</p>
                  <p className="text-[10px] text-slate-400">
                    {task.date ? format(parseISO(task.date), "MMM d") : ""}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(task)}
                    className="text-xs p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                  >Edit</button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-xs p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                  >Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}