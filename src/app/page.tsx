"use client";

import { useState } from "react";
import useSWR from "swr";
import { HeaderBar } from "@/components/HeaderBar";
import { KpiStrip } from "@/components/KpiStrip";
import { AlertFeed } from "@/components/AlertFeed";
import { DetailPanel } from "@/components/DetailPanel";
import { SeverityChart } from "@/components/SeverityChart";
import { Alert, Status } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, error, mutate } = useSWR<{ alerts: Alert[] }>(
    "/api/alerts",
    fetcher,
    { refreshInterval: 4000 }
  );

  const alerts = data?.alerts ?? [];
  const selected = alerts.find((a) => a.id === selectedId) ?? null;

  async function updateStatus(id: string, status: Status) {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate();
  }

  return (
    <div className="flex flex-col h-screen">
      <HeaderBar isLive={!error} totalAlerts={alerts.length} />
      <KpiStrip alerts={alerts} />

      <div className="px-6 pb-4">
        <SeverityChart alerts={alerts} />
      </div>

      <div className="flex flex-1 min-h-0 border-t border-border">
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          <AlertFeed
            alerts={alerts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateStatus={updateStatus}
          />
        </div>
        <div className="w-[360px] shrink-0">
          <DetailPanel alert={selected} />
        </div>
      </div>
    </div>
  );
}
