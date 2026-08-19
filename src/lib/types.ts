export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type Status = "OPEN" | "ESCALATED" | "RESOLVED_FP" | "RESOLVED";

export type Alert = {
  id: string;
  received_at: string;
  source: string | null;
  severity: Severity;
  rule_name: string | null;
  src_ip: string | null;
  dest_host: string | null;
  mitre_technique_id: string | null;
  mitre_tactic: string | null;
  status: Status;
  reputation_score: number | null;
  reputation_label: string | null;
  raw_payload: string | null;
};

export const SEVERITY_STYLES: Record<Severity, { text: string; bg: string; label: string }> = {
  CRITICAL: { text: "text-critical", bg: "bg-critical/15 border-critical/30", label: "Critical" },
  HIGH: { text: "text-warning", bg: "bg-warning/15 border-warning/30", label: "High" },
  MEDIUM: { text: "text-info", bg: "bg-info/15 border-info/30", label: "Medium" },
  LOW: { text: "text-low", bg: "bg-low/15 border-low/30", label: "Low" },
};

export const STATUS_STYLES: Record<Status, { text: string; bg: string; label: string }> = {
  OPEN: { text: "text-critical", bg: "bg-critical/15 border-critical/30", label: "Open" },
  ESCALATED: { text: "text-warning", bg: "bg-warning/15 border-warning/30", label: "Escalated" },
  RESOLVED_FP: { text: "text-low", bg: "bg-low/15 border-low/30", label: "Resolved (FP)" },
  RESOLVED: { text: "text-muted", bg: "bg-white/5 border-white/10", label: "Resolved" },
};

export const SEVERITY_ORDER: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
