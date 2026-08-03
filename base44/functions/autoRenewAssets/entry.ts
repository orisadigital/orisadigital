import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CYCLE_YEARS = { yearly: 1, "3_years": 3 };

function addYears(dateStr, years) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function isMonthlyValue(dateStr) {
  // Monthly renewals are stored as MM-DD (5 chars); full dates are 10 chars.
  return String(dateStr).length === 5;
}

async function renewEntity(base44, entityName) {
  const items = await base44.asServiceRole.entities[entityName].filter({
    status: { $ne: "cancelled" }
  });
  let renewed = 0;
  const now = Date.now();
  for (const item of items) {
    const years = CYCLE_YEARS[item.billing_cycle];
    if (!years || !item.renewal_date || isMonthlyValue(item.renewal_date)) continue;
    const due = new Date(String(item.renewal_date) + "T00:00:00Z").getTime();
    if (due > now) continue; // not due yet
    let newDate = String(item.renewal_date);
    let guard = 0;
    while (new Date(newDate + "T00:00:00Z").getTime() <= now && guard < 20) {
      newDate = addYears(newDate, years);
      guard++;
    }
    await base44.asServiceRole.entities[entityName].update(item.id, {
      renewal_date: newDate,
      status: "active"
    });
    renewed++;
  }
  return renewed;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Allow scheduled invocations (no user) or admin users; reject non-admins.
    try {
      const user = await base44.auth.me();
      if (user && user.role !== "admin") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch (e) {
      // No user context (scheduled run) — proceed with service role.
    }

    const renewed = {
      DomainHosting: await renewEntity(base44, "DomainHosting"),
      SoftwarePlugin: await renewEntity(base44, "SoftwarePlugin"),
      Subscription: await renewEntity(base44, "Subscription")
    };
    return Response.json({ ok: true, renewed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}