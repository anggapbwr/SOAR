"use client";

import { Alert, SEVERITY_STYLES, STATUS_STYLES } from "@/lib/types";

export function DetailPanel({ alert }: { alert: Alert | null }) {
  if (!alert) {
    return (
      <div className="h-full flex items-center justify-center text-muted text-sm text-center px-6">
        Select a signal from the feed to inspect it.
      </div>
    );
  }

  const sev = SEVERITY_STYLES[alert.severity];
  const status = STATUS_STYLES[alert.status];

  return (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-foreground">{alert.id}</span>
        <div className="flex gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${sev.bg} ${sev.text}`}>
            {sev.label}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      <h2 className="font-display font-semibold text-base text-foreground leading-snug">
        {alert.rule_name || "Unclassified event"}
      </h2>

      <section className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
        <p className="text-[10px] uppercase tracking-wide text-accent">Vector</p>
        <p className="font-mono text-xs text-foreground">
          {alert.src_ip || "unknown"} <span className="text-muted">→</span>{" "}
          {alert.dest_host || "unknown"}
        </p>
        <p className="font-mono text-xs text-muted">Received {alert.received_at} UTC</p>
      </section>

      <section className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
        <p className="text-[10px] uppercase tracking-wide text-info">MITRE ATT&CK</p>
        <p className="font-mono text-xs text-foreground">
          {alert.mitre_technique_id ? (
            <>
              <span className="text-warning">{alert.mitre_technique_id}</span>{" "}
              — {alert.mitre_tactic || "Unclassified tactic"}
            </>
          ) : (
            <span className="text-muted">No technique mapped by n8n yet</span>
          )}
        </p>
      </section>

      <section className="bg-surface border border-border rounded-lg p-3 space-y-1.5">
        <p className="text-[10px] uppercase tracking-wide text-warning">Reputation</p>
        {alert.reputation_score !== null ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-critical"
                style={{ width: `${Math.min(100, alert.reputation_score)}%` }}
              />
            </div>
            <span className="font-mono text-xs text-foreground">{alert.reputation_score}/100</span>
          </div>
        ) : (
          <p className="text-xs text-muted">Not enriched yet — configure the n8n reputation step.</p>
        )}
        {alert.reputation_label && (
          <p className="text-xs text-muted">{alert.reputation_label}</p>
        )}
      </section>

      <section className="bg-surface border border-border rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-wide text-muted mb-1.5">Raw payload</p>
        <pre className="font-mono text-[10px] text-muted whitespace-pre-wrap break-all leading-relaxed max-h-40 overflow-y-auto">
          {alert.raw_payload ? JSON.stringify(JSON.parse(alert.raw_payload), null, 2) : "—"}
        </pre>
      </section>
    </div>
  );
}
