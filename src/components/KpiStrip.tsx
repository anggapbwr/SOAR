"use client";

import { Alert } from "@/lib/types";

function KpiCard({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: string | number;
  accentClass: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-3 flex-1 min-w-[140px]">
      <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-mono text-2xl font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}

export function KpiStrip({ alerts }: { alerts: Alert[] }) {
  const total = alerts.length;
  const critical = alerts.filter((a) => a.severity === "CRITICAL").length;
  const open = alerts.filter((a) => a.status === "OPEN").length;
  const escalated = alerts.filter((a) => a.status === "ESCALATED").length;

  return (
    <div className="flex flex-wrap gap-3 px-6 py-4">
      <KpiCard label="Total signals" value={total} accentClass="text-foreground" />
      <KpiCard label="Critical" value={critical} accentClass="text-critical" />
      <KpiCard label="Awaiting triage" value={open} accentClass="text-warning" />
      <KpiCard label="Escalated" value={escalated} accentClass="text-accent" />
    </div>
  );
}
