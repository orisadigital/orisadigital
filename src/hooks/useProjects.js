import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// Project names for the payroll "Project Fee" picker. Fetched only while the
// sheet that needs it is open, so opening the payroll page costs nothing.
export function useProjects(enabled) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    base44.entities.Project.list("-created_date")
      .then((rows) => {
        if (!cancelled) setProjects(rows || []);
      })
      .catch((e) => {
        // A failed load leaves the picker empty rather than breaking the sheet;
        // the payment can still be saved without a project.
        console.error("Failed to load projects", e);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return projects;
}
