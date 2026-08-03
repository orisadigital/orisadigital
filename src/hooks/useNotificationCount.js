import { useSyncExternalStore } from "react";
import { base44 } from "@/api/base44Client";
import { addDays } from "date-fns";

let count = 0;
let pending = null;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}

async function refresh() {
  if (pending) return pending;
  pending = (async () => {
    try {
      const tasks = await base44.entities.Task.list();
      const tomorrow = addDays(new Date(), 1);
      count = tasks.filter(
        (t) => !t.is_completed && new Date(t.date) <= tomorrow
      ).length;
    } catch (e) {
      // keep last known count on error
    } finally {
      pending = null;
      emit();
    }
  })();
  return pending;
}

let started = false;
function ensureStarted() {
  if (started) return;
  started = true;
  refresh();
}

export function useNotificationCount() {
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      ensureStarted();
      return () => listeners.delete(cb);
    },
    () => count
  );
  return { count: value, refreshNotificationCount: refresh };
}

export { refresh as refreshNotificationCount };