import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// PATCH /api/alerts/[id] — used by the dashboard's Escalate / Resolve buttons
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validStatuses = ["OPEN", "ESCALATED", "RESOLVED_FP", "RESOLVED"];
  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  const db = getDb();
  const result = db
    .prepare(`UPDATE alerts SET status = ? WHERE id = ?`)
    .run(body.status, id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id, status: body.status });
}
