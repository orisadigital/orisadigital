import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Days-before-expiry thresholds per billing cycle.
const THRESHOLDS = {
  monthly: [7, 3, 1],
  yearly: [30, 14, 7, 3]
};

const REMINDER_PREFIX = "Renewal reminder:";

// Monthly renewals are stored as MM-DD (short); yearly/3-year are full ISO dates (10 chars).
function isMonthlyValue(dateStr) {
  return String(dateStr).length !== 10;
}

function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// Resolve the next upcoming expiry date from the stored renewal value.
function nextExpiry(renewalDate) {
  const today = startOfToday();
  if (isMonthlyValue(renewalDate)) {
    const dd = Number(String(renewalDate).split("-")[1]);
    if (!dd) return null;
    let candidate = new Date(today.getFullYear(), today.getMonth(), dd);
    if (candidate < today) {
      candidate = new Date(today.getFullYear(), today.getMonth() + 1, dd);
    }
    return candidate;
  }
  if (!renewalDate || String(renewalDate).length < 10) return null;
  const candidate = new Date(String(renewalDate) + "T00:00:00");
  if (candidate < today) return null; // autoRenewAssets advances these; skip stale
  return candidate;
}

function daysUntil(date) {
  const today = startOfToday();
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

async function collectDue(base44, entityName) {
  const items = await base44.asServiceRole.entities[entityName].filter({
    status: { $ne: "cancelled" }
  });
  const due = [];
  for (const item of items) {
    const thresholds = THRESHOLDS[item.billing_cycle];
    if (!thresholds || !item.renewal_date) continue;
    const expiry = nextExpiry(item.renewal_date);
    if (!expiry) continue;
    const days = daysUntil(expiry);
    if (!thresholds.includes(days)) continue;
    const name = item.name || item.item_name || entityName;
    due.push({
      title: `${REMINDER_PREFIX} ${name} expires ${isoDate(expiry)} (${days}d)`,
      date: isoDate(startOfToday())
    });
  }
  return due;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    try {
      const user = await base44.auth.me();
      if (user && user.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch (e) {
      // Scheduled run (no user context) — proceed with service role.
    }

    const existing = await base44.asServiceRole.entities.Task.list();
    const existingTitles = new Set(existing.map((t) => t.task_title));

    const due = [
      ...(await collectDue(base44, "SoftwarePlugin")),
      ...(await collectDue(base44, "Subscription"))
    ];

    let created = 0;
    for (const r of due) {
      if (existingTitles.has(r.title)) continue;
      await base44.asServiceRole.entities.Task.create({
        task_title: r.title,
        date: r.date
      });
      created++;
    }
    return Response.json({ ok: true, created, candidates: due.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}