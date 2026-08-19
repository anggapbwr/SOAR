"use client";

export function HeaderBar({ isLive, totalAlerts }: { isLive: boolean; totalAlerts: number }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="relative w-2.5 h-2.5 radar-ring">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isLive ? "bg-accent pulse-dot" : "bg-muted"
            }`}
          />
        </div>
        <h1 className="font-display font-semibold text-lg tracking-tight text-foreground">
          Signal Console
        </h1>
        <span className="text-xs font-mono text-muted border border-border rounded px-2 py-0.5">
          Mini SOAR
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm font-mono text-muted">
        <span>{totalAlerts} signals tracked</span>
        <span
          className={`px-2 py-0.5 rounded border text-xs ${
            isLive
              ? "border-accent/30 text-accent bg-accent-dim"
              : "border-border text-muted"
          }`}
        >
          {isLive ? "receiving" : "idle"}
        </span>
      </div>
    </header>
  );
}
