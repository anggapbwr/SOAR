# Mini SOAR — Signal Console

A self-hosted, zero-cost SOAR (Security Orchestration, Automation & Response) simulator. Dummy security alerts are generated, enriched and routed through **n8n**, then triaged on a custom **Next.js** dashboard — with real-time **Telegram** notifications for high-severity events.

Built as a hands-on portfolio project to demonstrate the full data flow behind a SOAR pipeline: ingestion, enrichment, branching logic, notification, and analyst triage — not just a static dashboard mockup.

---

## Architecture

The pipeline has five stages:

1. **`generator.py`** sends a randomized dummy security alert via `POST` to an n8n webhook
2. **n8n Webhook** node receives it
3. **n8n Code node** maps a human-readable MITRE tactic hint to a real MITRE ATT&CK technique ID
4. **n8n If node** branches on severity:
   - `CRITICAL` / `HIGH` → also sends a **Telegram** notification, in parallel with step 5
   - everything else → skips straight to step 5
5. **n8n HTTP Request** node `POST`s the enriched alert to the dashboard's `/api/alerts` endpoint, which writes it to SQLite

Every alert, regardless of severity, ends up on the dashboard. Only `CRITICAL`/`HIGH` alerts additionally trigger a Telegram notification — simulating a SOC's urgency-based escalation path.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Alert generator | Python (`requests`, `argparse`) |
| Orchestration / SOAR | [n8n](https://n8n.io/) (self-hosted via Docker) |
| Dashboard | Next.js 15, TypeScript, Tailwind CSS |
| Database | SQLite via Node.js's built-in `node:sqlite` (no native compilation required) |
| Data fetching | SWR (polling every 4s) |
| Charts | Recharts |
| Notifications | Telegram Bot API |

**Cost: $0.** Everything runs locally — Docker Desktop, n8n Community Edition, and Node.js are all free; Telegram's Bot API has no cost for this use case.

---

## Project Structure

- `src/app/page.tsx` — main dashboard page
- `src/app/layout.tsx` — fonts + global shell
- `src/app/globals.css` — design tokens + radar-sweep signature animation
- `src/app/api/alerts/` — REST endpoints (`GET` / `POST` / `PATCH`)
- `src/components/` — `HeaderBar`, `KpiStrip`, `AlertFeed`, `DetailPanel`, `SeverityChart`
- `src/lib/` — `db.ts` (SQLite), `types.ts` (shared types + style tokens)
- `generator/generator.py` — dummy alert generator
- `n8n/mini-soar-workflow.json` — exported n8n workflow, ready to import

---

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with WSL2 backend on Windows)
- [Node.js 22.13+](https://nodejs.org/) (LTS recommended) — ships with the built-in `node:sqlite` module used here
- Python 3 + `pip install requests`
- A Telegram bot token (via [@BotFather](https://t.me/BotFather)) and your chat ID

### 1. Run n8n

```bash
docker volume create n8n_data
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

Open `http://localhost:5678`, create a local account, then import `n8n/mini-soar-workflow.json` via **Import from File**. Add your Telegram credentials to the "Send a text message" node, then set the workflow to **Active**.

> **Docker networking note:** the workflow's HTTP Request node targets `http://host.docker.internal:3000` rather than `localhost:3000`, since n8n runs inside a container where `localhost` refers to the container itself, not the host machine.

### 2. Run the dashboard

```bash
cd mini-soar-dashboard
npm install
npm run dev
```

Open `http://localhost:3000`. A SQLite database is created automatically at `data/alerts.db`.

### 3. Run the alert generator

```bash
cd generator
python generator.py
```

Sends a randomized alert every 5–15 seconds to `http://localhost:5678/webhook/mini-soar-ingest`. Watch alerts populate the dashboard in real time, with Telegram notifications for `CRITICAL`/`HIGH` events.

---

## The n8n Workflow

The exported workflow (`n8n/mini-soar-workflow.json`) has four stages: **Webhook** → **Code (MITRE mapping)** → **If (severity branch)** → **Telegram + HTTP Request (parallel)**.

### A bug worth mentioning (and how it was fixed)

Early versions of this workflow chained **Telegram → HTTP Request** in sequence. That's wrong: the Telegram node's output overwrites `$json` with Telegram's own API response, so by the time execution reached HTTP Request, the alert's real data (severity, rule name, source IP, etc.) had already been replaced — the dashboard received Telegram's confirmation payload instead of the alert itself. The fix was to run Telegram and HTTP Request **in parallel** off the same `If` branch, rather than in series.

---

## API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/alerts` | List the 200 most recent alerts (polled by the dashboard every 4s) |
| `POST` | `/api/alerts` | Ingest a new alert (called by n8n) |
| `PATCH` | `/api/alerts/[id]` | Update an alert's status — `OPEN`, `ESCALATED`, `RESOLVED_FP`, `RESOLVED` |

---

## Design

- **Signature element:** a slow rotating radar-sweep ring around the live status indicator — a nod to signal detection, the console's core metaphor.
- **Palette:** dark charcoal-green background (`#0A0F0D`) with a phosphor-green accent (`#39FF88`), reminiscent of radar/oscilloscope displays.
- **Type:** Space Grotesk for headings, Inter for body copy, JetBrains Mono for IPs/timestamps/data.

---

## Known Limitations

- No authentication/RBAC — this is a UI/UX and data-flow demo, not a hardened multi-tenant tool.
- MITRE technique mapping is a small hand-written lookup table (10 tactics), not a full ATT&CK dataset.
- Reputation scoring (e.g. via AbuseIPDB) is scaffolded in the dashboard's data model but not yet wired into the n8n workflow — a natural next step.
- SQLite won't persist on serverless platforms like Vercel — swap for hosted Postgres (e.g. Supabase free tier) before any public deployment.
- Node's built-in `node:sqlite` module is currently a Release Candidate (stable API, not yet a final 1.0) — fine for a project like this, worth noting for production use.

---

## License

MIT — feel free to fork and adapt for your own portfolio.
