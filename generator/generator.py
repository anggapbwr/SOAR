"""
generator.py
Dummy security alert generator for the Mini SOAR project.

Generates realistic-looking alerts and POSTs them to an n8n webhook, which
is expected to enrich the alert (MITRE mapping, reputation score) and then
forward it to the Next.js dashboard's /api/alerts endpoint.

Usage:
    pip install requests
    python generator.py                  # sends one alert every 5-15s, forever
    python generator.py --once           # sends a single alert and exits
    python generator.py --interval 3     # fixed 3s interval instead of random
"""
import argparse
import random
import time
import uuid
from datetime import datetime, timezone

import requests

N8N_WEBHOOK_URL = "http://localhost:5678/webhook/mini-soar-ingest"

RULE_TEMPLATES = [
    ("CRITICAL", "Ransomware canary file encrypted", "Impact"),
    ("CRITICAL", "SQL injection payload detected on /api/auth", "Initial Access"),
    ("CRITICAL", "Mass outbound data transfer to unclassified host", "Exfiltration"),
    ("HIGH", "SSH brute force — 400+ failed attempts", "Credential Access"),
    ("HIGH", "Suspicious Kerberos ticket request anomaly", "Lateral Movement"),
    ("HIGH", "Base64-encoded PowerShell execution", "Execution"),
    ("MEDIUM", "Port sweep detected from internal subnet", "Discovery"),
    ("MEDIUM", "DNS query with high-entropy TXT record", "Command and Control"),
    ("LOW", "Scheduled task created outside change window", "Persistence"),
    ("LOW", "IAM policy modified outside business hours", "Defense Evasion"),
]

INTERNAL_HOSTS = [
    "srv-ecommerce-web01.corp",
    "srv-bastion-gateway.corp",
    "srv-nas-finance01.corp",
    "dc-primary.corp.local",
    "ws-finance-09.corp.local",
]


def random_public_ip() -> str:
    return f"{random.randint(1, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"


def build_alert() -> dict:
    severity, rule_name, tactic = random.choice(RULE_TEMPLATES)
    return {
        "id": f"ALT-{uuid.uuid4().hex[:8].upper()}",
        "source": random.choice(["Suricata NIDS", "Linux auth.log", "Cloud IAM"]),
        "severity": severity,
        "rule_name": rule_name,
        "src_ip": random_public_ip(),
        "dest_host": random.choice(INTERNAL_HOSTS),
        "mitre_tactic_hint": tactic,  # n8n can use this to pick the MITRE technique ID
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def send_alert(alert: dict, url: str) -> None:
    try:
        res = requests.post(url, json=alert, timeout=5)
        status = "OK" if res.ok else f"FAILED ({res.status_code})"
        print(f"[{alert['severity']:8}] {alert['rule_name']:45} -> {status}")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Could not reach {url}: {e}")


def main():
    parser = argparse.ArgumentParser(description="Dummy SOC alert generator")
    parser.add_argument("--url", default=N8N_WEBHOOK_URL, help="n8n webhook URL")
    parser.add_argument("--once", action="store_true", help="send a single alert and exit")
    parser.add_argument("--interval", type=float, default=None, help="fixed seconds between alerts")
    args = parser.parse_args()

    if args.once:
        send_alert(build_alert(), args.url)
        return

    print(f"Sending dummy alerts to {args.url} — Ctrl+C to stop\n")
    try:
        while True:
            send_alert(build_alert(), args.url)
            delay = args.interval if args.interval is not None else random.uniform(5, 15)
            time.sleep(delay)
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
