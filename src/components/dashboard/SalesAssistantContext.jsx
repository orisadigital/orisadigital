import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const AGENT_NAME = "sales_assistant";

const SalesAssistantContext = createContext(null);

export function SalesAssistantProvider({ children }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);

  // Create one conversation for the whole admin session; keep it alive
  // across page navigation (provider lives at the layout level).
  useEffect(() => {
    let unsub = () => {};
    const start = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: "Sales Assistant", description: "Dashboard sales research" },
        });
        setConversation(conv);
        setMessages(conv.messages || []);
        unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages || []);
        });
      } catch (e) {
        console.error("Failed to start assistant conversation", e);
      }
    };
    start();
    return () => unsub();
  }, []);

  const send = async (text) => {
    const content = (text ?? "").trim();
    if (!content || !conversation || busy) return;
    setBusy(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content });
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SalesAssistantContext.Provider value={{ conversation, messages, busy, send }}>
      {children}
    </SalesAssistantContext.Provider>
  );
}

export function useSalesAssistant() {
  const ctx = useContext(SalesAssistantContext);
  if (!ctx) {
    throw new Error("useSalesAssistant must be used within a SalesAssistantProvider");
  }
  return ctx;
}