import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";

// GET /api/alerts — used by the dashboard (polled via SWR)
export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM alerts ORDER BY received_at DESC LIMIT 200`)
    .all();
  return NextResponse.json({ alerts: rows });
}

// POST /api/alerts — used by n8n to push a new (enriched) alert
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const db = getDb();
  const id = (body.id as string) || `ALT-${Date.now()}-${randomUUID().slice(0, 4)}`;

  const severityRaw = String(body.severity || "MEDIUM").toUpperCase();
  const validSeverities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const severity = validSeverities.includes(severityRaw) ? severityRaw : "MEDIUM";

  try {
    db.prepare(
      `INSERT INTO alerts
        (id, source, severity, rule_name, src_ip, dest_host, mitre_technique_id, mitre_tactic, status, reputation_score, reputation_label, raw_payload)
       VALUES (@id, @source, @severity, @rule_name, @src_ip, @dest_host, @mitre_technique_id, @mitre_tactic, @status, @reputation_score, @reputation_label, @raw_payload)`
    ).run({
      id,
      source: (body.source as string) || "n8n",
      severity,
      rule_name: (body.rule_name as string) || "Unclassified event",
      src_ip: (body.src_ip as string) || null,
      dest_host: (body.dest_host as string) || null,
      mitre_technique_id: (body.mitre_technique_id as string) || null,
      mitre_tactic: (body.mitre_tactic as string) || null,
      status: (body.status as string) || "OPEN",
      reputation_score:
        typeof body.reputation_score === "number" ? body.reputation_score : null,
      reputation_label: (body.reputation_label as string) || null,
      raw_payload: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: "Alert ID already exists" }, { status: 409 });
  }

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
