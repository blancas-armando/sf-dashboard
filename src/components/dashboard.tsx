"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardData } from "@/lib/types";
import { TransitPanel } from "./transit-panel";
import { WeatherPanel } from "./weather-panel";
import { GameDayPanel } from "./game-day-panel";
import { ChecklistPanel } from "./checklist-panel";

export function Dashboard({ initial }: { initial: DashboardData }) {
  const [data, setData] = useState(initial);
  const lastJson = useRef("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) return;
        const text = await res.text();
        if (text === lastJson.current) return;
        lastJson.current = text;
        setData(JSON.parse(text));
      } catch {
        // silently retry on next interval
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted">
          SF Dashboard
        </h1>
        <span className="text-xs tabular-nums text-muted/50">
          {data.updatedAt}
        </span>
      </header>

      <div className="space-y-4">
        <TransitPanel data={data.transit} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <WeatherPanel data={data.weather} />
          <GameDayPanel data={data.games} />
        </div>

        <ChecklistPanel items={data.checklist} />
      </div>
    </div>
  );
}
