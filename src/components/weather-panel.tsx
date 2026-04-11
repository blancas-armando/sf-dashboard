import type { WeatherData } from "@/lib/types";
import { Panel } from "./panel";

export function WeatherPanel({ data }: { data: WeatherData | null }) {
  return (
    <Panel title="Weather">
      {!data ? (
        <p className="text-sm text-muted/50">Unable to load weather data</p>
      ) : (
        <div>
          <div className="flex items-baseline gap-2">
            <p className="font-mono text-4xl font-light tabular-nums tracking-tight">
              {data.temp}°
            </p>
            <p className="text-sm text-muted">{data.condition}</p>
          </div>
          <p className="mt-2 font-mono text-xs tabular-nums text-muted/60">
            H {data.high}° · L {data.low}°
          </p>
        </div>
      )}
    </Panel>
  );
}
