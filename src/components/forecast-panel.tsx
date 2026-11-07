import type { WeatherData } from "@/lib/types";
import { Panel } from "./panel";

export function ForecastPanel({ data }: { data: WeatherData | null }) {
  return (
    <Panel title="Forecast">
      {!data ? (
        <p className="text-sm text-muted/50">Unable to load forecast</p>
      ) : (
        <div>
          <ol className="grid grid-cols-4 gap-2">
            {data.forecast.map((slot) => (
              <li key={slot.time}>
                <p className="text-xs text-muted">{slot.time}</p>
                <p className="mt-1 font-mono text-lg tabular-nums">{slot.temp}°</p>
                <p className="font-mono text-xs tabular-nums text-muted/60">
                  {slot.rainChance}% rain
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-3 font-mono text-xs tabular-nums text-muted/60">
            {data.sun.event} {data.sun.time}
          </p>
        </div>
      )}
    </Panel>
  );
}
