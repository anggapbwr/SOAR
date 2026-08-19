import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

// Uses Node.js's built-in SQLite module (available without flags since
// Node 22.13 / 23.4, Release Candidate as of Node 25.7). No native
// compilation required — unlike better-sqlite3, which needs a C++ build
// toolchain (Visual Studio Build Tools on Windows) and was causing
// `npm install` to fail with node-gyp errors.

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "alerts.db");

// Reuse a single connection across hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __soarDb: DatabaseSync | undefined;
}

export function getDb(): DatabaseSync {
  if (!global.__soarDb) {
    const db = new DatabaseSync(DB_PATH);
    db.exec(`PRAGMA journal_mode = WAL;`);
    db.exec(`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        received_at TEXT NOT NULL DEFAULT (datetime('now')),
        source TEXT,
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        rule_name TEXT,
        src_ip TEXT,
        dest_host TEXT,
        mitre_technique_id TEXT,
        mitre_tactic TEXT,
        status TEXT NOT NULL DEFAULT 'OPEN',
        reputation_score INTEGER,
        reputation_label TEXT,
        raw_payload TEXT
      );
    `);
    global.__soarDb = db;
  }
  return global.__soarDb;
}

export type AlertRow = {
  id: string;
  received_at: string;
  source: string | null;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  rule_name: string | null;
  src_ip: string | null;
  dest_host: string | null;
  mitre_technique_id: string | null;
  mitre_tactic: string | null;
  status: "OPEN" | "ESCALATED" | "RESOLVED_FP" | "RESOLVED";
  reputation_score: number | null;
  reputation_label: string | null;
  raw_payload: string | null;
};
