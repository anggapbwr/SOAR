"use client";

import { Alert, SEVERITY_STYLES, STATUS_STYLES } from "@/lib/types";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

const SEVERITY_BORDER_VAR: Record<Alert["severity"], string> = {
  CRITICAL: "var(--critical)",
  HIGH: "var(--warning)",
  MEDIUM: "var(--info)",
  LOW: "var(--low)",
};

function timeAgo(iso: string): string {
  const then = new Date(iso.replace(" ", "T") + "Z").getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return `${Math.floor(diffSec / 3600)}h ago`;
}

export function AlertFeed({
  alerts,
  onUpdateStatus,
  selectedId,
  onSelect,
}: {
  alerts: Alert[];
  onUpdateStatus: (id: string, status: Alert["status"]) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (alerts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-sm">
        No signals yet — waiting for the first event from n8n.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-border">
      {alerts.map((alert) => {
        const sev = SEVERITY_STYLES[alert.severity];
        const status = STATUS_STYLES[alert.status];
        const isSelected = alert.id === selectedId;

        return (
          <div
            key={alert.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(alert.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(alert.id);
              }
            }}
            className={`w-full text-left px-6 py-3 flex items-center gap-4 hover:bg-surface-hover transition-colors cursor-pointer ${
              isSelected ? "bg-surface-hover" : ""
            }`}
            style={{ borderLeft: `3px solid ${SEVERITY_BORDER_VAR[alert.severity]}` }}
          >
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${sev.bg} ${sev.text} shrink-0 w-16 text-center`}>
              {sev.label}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{alert.rule_name || "Unclassified event"}</p>
              <p className="text-xs text-muted font-mono truncate">
                {alert.src_ip || "unknown"} {alert.dest_host ? `→ ${alert.dest_host}` : ""}
              </p>
            </div>

            <span className="text-xs text-muted font-mono shrink-0">{timeAgo(alert.received_at)}</span>

            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${status.bg} ${status.text}`}>
              {status.label}
            </span>

            {alert.status === "OPEN" && (
              <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  title="Escalate"
                  onClick={() => onUpdateStatus(alert.id, "ESCALATED")}
                  className="p-1.5 rounded border border-warning/30 text-warning hover:bg-warning/15 transition-colors"
                >
                  <ShieldAlert size={14} />
                </button>
                <button
                  title="Resolve as false positive"
                  onClick={() => onUpdateStatus(alert.id, "RESOLVED_FP")}
                  className="p-1.5 rounded border border-low/30 text-low hover:bg-low/15 transition-colors"
                >
                  <CheckCircle2 size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
