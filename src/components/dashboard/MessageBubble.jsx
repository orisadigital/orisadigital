import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronRight, ChevronDown, Check, Loader2, X } from "lucide-react";

const STATUS_META = {
  pending: { icon: Loader2, spin: true, label: "Pending", cls: "text-slate-400" },
  running: { icon: Loader2, spin: true, label: "Running", cls: "text-blue-500" },
  in_progress: { icon: Loader2, spin: true, label: "Running", cls: "text-blue-500" },
  completed: { icon: Check, spin: false, label: "Done", cls: "text-emerald-500" },
  success: { icon: Check, spin: false, label: "Done", cls: "text-emerald-500" },
  failed: { icon: X, spin: false, label: "Failed", cls: "text-destructive" },
  error: { icon: X, spin: false, label: "Failed", cls: "text-destructive" },
};

function ToolDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_META[toolCall.status] || STATUS_META.pending;
  const Icon = status.icon;
  const dp = toolCall.display_projection || {};
  const hideAll = dp.hide_details && dp.details_redacted;
  const stateLabel = ["pending", "running", "in_progress"].includes(toolCall.status)
    ? dp.active_label || status.label
    : ["failed", "error"].includes(toolCall.status)
      ? dp.error_label || status.label
      : dp.label || status.label;

  let parsedArgs = toolCall.arguments_string;
  try { parsedArgs = JSON.parse(toolCall.arguments_string); } catch { /* keep raw */ }
  let parsedResults = toolCall.results;
  if (typeof parsedResults === "string") {
    try { parsedResults = JSON.parse(parsedResults); } catch { /* keep raw */ }
  }

  return (
    <div className="mt-1.5 text-xs">
      <button
        onClick={() => !hideAll && setExpanded(!expanded)}
        className={`flex items-center gap-1.5 ${hideAll ? "cursor-default" : "hover:bg-slate-50"} rounded px-1 py-0.5`}
      >
        {!hideAll && (expanded ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />)}
        <Icon className={`h-3 w-3 ${status.spin ? "animate-spin" : ""} ${status.cls}`} />
        <span className="font-medium text-slate-600">{toolCall.name}</span>
        <span className={status.cls}>· {stateLabel}</span>
      </button>
      {expanded && !hideAll && (
        <div className="mt-1 ml-5 space-y-1 text-slate-500">
          <pre className="bg-slate-50 rounded p-2 overflow-x-auto text-[11px]">Params: {JSON.stringify(parsedArgs, null, 2)}</pre>
          {parsedResults !== undefined && (
            <pre className="bg-slate-50 rounded p-2 overflow-x-auto text-[11px]">Result: {JSON.stringify(parsedResults, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${isUser ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"}`}>
        {message.content && (isUser
          ? <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          : <div className="text-sm leading-relaxed prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0"><ReactMarkdown>{message.content}</ReactMarkdown></div>
        )}
        {message.tool_calls?.map((tc, i) => <ToolDisplay key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}