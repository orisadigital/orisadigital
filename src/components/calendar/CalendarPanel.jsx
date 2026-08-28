import React, { useState } from "react";
import {
  format,
  parseISO,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
} from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format as formatDateLong } from "date-fns";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function CalendarPanel({ tasks, onAddTask, onComplete, onUpdate, onDelete }) {
  const [selected, setSelected] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ task_title: "", date: "" });
  const [expandedDay, setExpandedDay] = useState(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const tasksByDate = {};
  tasks.forEach((t) => {
    if (t.date) {
      const key = format(parseISO(t.date), "yyyy-MM-dd");
      if (!tasksByDate[key]) tasksByDate[key] = [];
      tasksByDate[key].push(t);
    }
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!taskTitle || !formDate) return;
    onAddTask?.({ task_title: taskTitle, date: formDate, is_completed: false });
    setTaskTitle("");
    setShowForm(false);
  };

  const handleDayClick = (day) => {
    setSelected(day);
    if (!isSameMonth(day, month)) {
      setMonth(new Date(day.getFullYear(), day.getMonth(), 1));
    }
  };

  const openAdd = () => {
    setFormDate(format(selected, "yyyy-MM-dd"));
    setShowForm(!showForm);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditForm({ task_title: task.task_title, date: task.date });
  };

  const saveEdit = (id) => {
    onUpdate?.(id, editForm);
    setEditingId(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="h-8 w-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-lg leading-none text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span aria-hidden="true">+</span>
            <span className="sr-only">Add task</span>
          </button>
          <h2 className="text-lg font-semibold text-slate-900">
            {format(month, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth(addMonths(month, -1))}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 text-lg leading-none"
          >
            <span aria-hidden="true">‹</span>
            <span className="sr-only">Previous month</span>
          </button>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 text-lg leading-none"
          >
            <span aria-hidden="true">›</span>
            <span className="sr-only">Next month</span>
          </button>
        </div>
      </div>

      {/* Inline Add Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center"
        >
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title"
            className="h-8 text-sm flex-1 min-w-[160px]"
            autoFocus
          />
          <Input
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            className="h-8 text-sm w-36"
          />
          <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 h-8">
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-8"
            onClick={() => setShowForm(false)}
          >Cancel</Button>
        </form>
      )}

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[11px] font-medium text-slate-400 uppercase tracking-wide border-r border-slate-100 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Date Cells */}
      <div className="grid grid-cols-7 flex-1 [grid-auto-rows:1fr]">
        {days.map((day, i) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate[dateKey] || [];
          const inMonth = isSameMonth(day, month);
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, new Date());
          const isLastCol = i % 7 === 6;
          const isLastRow = i >= days.length - 7;

          return (
            <div
              key={i}
              onClick={() => handleDayClick(day)}
              className={`min-h-[90px] p-1.5 cursor-pointer hover:bg-blue-50/40 transition-colors border-r border-b border-slate-100 ${
                isLastCol ? "border-r-0" : ""
              } ${isLastRow ? "border-b-0" : ""} ${
                !inMonth ? "bg-slate-50/40" : ""
              }`}
            >
              {/* Date Number */}
              <div className="flex justify-start mb-1">
                {isSelected ? (
                  <span className="inline-flex items-center justify-center h-6 min-w-6 px-1 rounded-full bg-blue-500 text-white text-xs font-semibold">
                    {format(day, "d")}
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center justify-center h-6 min-w-6 px-1 text-xs font-medium ${
                      !inMonth
                        ? "text-slate-300"
                        : isToday
                        ? "text-blue-600 font-bold"
                        : "text-slate-600"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                )}
              </div>

              {/* Inline Tasks */}
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map((task) =>
                  editingId === task.id ? (
                    <div
                      key={task.id}
                      className="space-y-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={editForm.task_title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, task_title: e.target.value })
                        }
                        className="h-6 text-[11px] px-1"
                      />
                      <Input
                        type="date"
                        value={editForm.date}
                        onChange={(e) =>
                          setEditForm({ ...editForm, date: e.target.value })
                        }
                        className="h-6 text-[11px] px-1"
                      />
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => saveEdit(task.id)}
                          className="text-xs p-0.5 rounded hover:bg-blue-100 text-blue-600"
                        >Save</button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs p-0.5 rounded hover:bg-slate-200 text-slate-500"
                        >Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={task.id}
                      className="group/task flex items-start gap-1 rounded px-0.5 py-0.5 hover:bg-blue-50"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onComplete?.(task.id);
                        }}
                        className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          task.is_completed ? "bg-slate-300" : "bg-blue-500"
                        }`}
                      />
                      <span
                        className={`text-[11px] leading-tight truncate flex-1 ${
                          task.is_completed
                            ? "text-slate-400 line-through"
                            : "text-slate-700"
                        }`}
                      >
                        {task.task_title}
                      </span>
                      <div className="opacity-0 group-hover/task:opacity-100 flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(task);
                          }}
                          className="text-xs p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                        >Edit</button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(task.id);
                          }}
                          className="text-xs p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                        >Delete</button>
                      </div>
                    </div>
                  )
                )}
                {dayTasks.length > 3 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedDay(day);
                    }}
                    className="text-[10px] text-blue-600 pl-2.5 hover:underline cursor-pointer font-medium"
                  >
                    +{dayTasks.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Expand Dialog */}
      <Dialog open={Boolean(expandedDay)} onOpenChange={(open) => !open && setExpandedDay(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {expandedDay ? formatDateLong(expandedDay, "EEEE, MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          {expandedDay && (
            <div className="space-y-1.5">
              {(tasksByDate[format(expandedDay, "yyyy-MM-dd")] || []).map((task) =>
                editingId === task.id ? (
                  <div key={task.id} className="space-y-1 p-2 rounded-lg border border-slate-200">
                    <Input
                      value={editForm.task_title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, task_title: e.target.value })
                      }
                      className="h-8 text-sm"
                    />
                    <Input
                      type="date"
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm({ ...editForm, date: e.target.value })
                      }
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => {
                          saveEdit(task.id);
                          setExpandedDay(null);
                        }}
                        className="h-8 bg-slate-900 hover:bg-slate-800"
                      >
                         Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        className="text-xs h-8"
                      >Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={task.id}
                    className="group/task flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  >
                    <button
                      onClick={() => onComplete?.(task.id)}
                      className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        task.is_completed ? "bg-slate-300" : "bg-blue-500"
                      }`}
                    />
                    <span
                      className={`text-sm leading-tight flex-1 ${
                        task.is_completed
                          ? "text-slate-400 line-through"
                          : "text-slate-700"
                      }`}
                    >
                      {task.task_title}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100">
                      <button
                        onClick={() => startEdit(task)}
                        className="text-xs p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                      >Edit</button>
                      <button
                        onClick={() => onDelete?.(task.id)}
                        className="text-xs p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                      >Delete</button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}