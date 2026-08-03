import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, TrendingUp, Users, DollarSign, Activity, Target, RefreshCw, CalendarClock } from "lucide-react";
import MessageBubble from "@/components/dashboard/MessageBubble";
import { useSalesAssistant } from "@/components/dashboard/SalesAssistantContext";

const CATEGORY_PILLS = [
  { label: "Sales Forecast", icon: TrendingUp, prompt: "Based on my current pipeline deals by stage and their amounts, forecast my expected sales for this quarter and estimate the likely close value." },
  { label: "Conversion Rate", icon: Target, prompt: "Calculate my conversion rate: what percentage of deals have moved to closed_won vs total deals, and at which stages deals are dropping off." },
  { label: "Total Sales", icon: DollarSign, prompt: "What is my total sales so far? Break it down by closed_won deal amounts and project sale amounts." },
  { label: "Leads", icon: Users, prompt: "Summarize my leads: total count, breakdown by inquiry source, and which sources produce the most pipeline value." },
  { label: "Top Sources", icon: Activity, prompt: "Which inquiry sources are my top performers? Rank sources by deal count and total pipeline value, and identify the best converting source." },
  { label: "Upcoming Renewals", icon: CalendarClock, prompt: "List my recurring projects and any upcoming domain or hosting expiries that need renewal attention." },
  { label: "Pipeline Velocity", icon: RefreshCw, prompt: "Analyze my pipeline velocity: how many deals are in each stage, and where are the bottlenecks slowing deals down." },
];

export default function SalesAssistantChat() {
  const { messages, busy, send } = useSalesAssistant();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (text) => {
    const content = text ?? input;
    if (!content.trim()) return;
    setInput("");
    send(content);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-700">
        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-white/10">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Sales AI Assistant</p>
          <p className="text-[11px] text-slate-300">Ask anything about your sales, pipeline & revenue</p>
        </div>
      </div>

      <div ref={scrollRef} className="h-64 overflow-y-auto scrollbar-hide px-4 py-3 space-y-3 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <Sparkles className="h-6 w-6 mb-2" />
            <p className="text-sm">Ask a question or tap a category below to research your sales.</p>
          </div>
        )}
        {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl px-3.5 py-2.5">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 px-4 py-3 space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_PILLS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.label}
                onClick={() => handleSend(p.prompt)}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <Icon className="h-3 w-3" />
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your sales…"
            disabled={busy}
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-400 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={busy || !input.trim()}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}