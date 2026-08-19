"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import { Alert, SEVERITY_ORDER } from "@/lib/types";

const COLORS: Record<string, string> = {
  CRITICAL: "#e5484d",
  HIGH: "#f2b84b",
  MEDIUM: "#4fd1c5",
  LOW: "#6b9080",
};

export function SeverityChart({ alerts }: { alerts: Alert[] }) {
  const data = SEVERITY_ORDER.map((sev) => ({
    severity: sev,
    count: alerts.filter((a) => a.severity === sev).length,
  }));

  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-3">
      <p className="text-xs text-muted uppercase tracking-wide mb-2">Severity distribution</p>
      <ResponsiveContainer width="100%" height={90}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="severity"
            tick={{ fill: "#7a8b83", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.severity} fill={COLORS[entry.severity]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
