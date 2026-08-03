export const PIPELINE_STAGES = [
  { id: "online_prospect", label: "Online Prospect" },
  { id: "offline_prospect", label: "Offline Prospect" },
  { id: "contact_made", label: "Contact Made" },
  { id: "meeting_arranged", label: "Meeting Arranged" },
  { id: "presentation_made", label: "Presentation Made" },
  { id: "prototype", label: "Prototype" },
  { id: "on_hold", label: "On Hold" },
  { id: "closed_won", label: "Closed Won" },
  { id: "closed_lost", label: "Closed Lost" },
];

export const STAGE_COLORS = {
  online_prospect: "#3b82f6",
  offline_prospect: "#8b5cf6",
  contact_made: "#06b6d4",
  meeting_arranged: "#0ea5e9",
  presentation_made: "#f59e0b",
  prototype: "#ec4899",
  on_hold: "#64748b",
  closed_won: "#22c55e",
  closed_lost: "#ef4444",
};

export const DEAL_SOURCES = [
  { value: "website", label: "Website" },
  { value: "social_media", label: "Social Media" },
  { value: "referral", label: "Referral" },
  { value: "cold_outreach", label: "Cold Outreach" },
  { value: "door_to_door", label: "Door-to-Door" },
  { value: "networking", label: "Networking" },
];

export const QUARTERS = {
  Q1: { label: "Q1", months: [0, 1, 2], monthNames: ["Jan", "Feb", "Mar"] },
  Q2: { label: "Q2", months: [3, 4, 5], monthNames: ["Apr", "May", "Jun"] },
  Q3: { label: "Q3", months: [6, 7, 8], monthNames: ["Jul", "Aug", "Sep"] },
  Q4: { label: "Q4", months: [9, 10, 11], monthNames: ["Oct", "Nov", "Dec"] },
};