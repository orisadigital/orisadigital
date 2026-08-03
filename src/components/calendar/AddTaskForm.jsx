import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const todayStr = () => new Date().toISOString().split("T")[0];

export default function AddTaskForm({ onAddTask }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [date, setDate] = useState(todayStr());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle || !date) return;
    onAddTask({ task_title: taskTitle, date, is_completed: false });
    setTaskTitle("");
    setDate(todayStr());
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Add Task</h2>
      <p className="mt-1 text-sm text-slate-500">Create a new scheduled task.</p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label className="text-sm font-medium text-slate-700">Task Title</Label>
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Follow up with client"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </form>
    </div>
  );
}