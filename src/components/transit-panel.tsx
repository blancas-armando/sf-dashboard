import type { TransitData } from "@/lib/types";
import { Panel } from "./panel";

export function TransitPanel({ data }: { data: TransitData | null }) {
  return (
    <Panel title="Next N-Judah">
      {!data ? (
        <p className="text-sm text-muted/50">Unable to load transit data</p>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-card-border">
          {data.stops.map((stop) => {
            const next = stop.departures[0];
            const upcoming = stop.departures.slice(1, 3);

            return (
              <div key={stop.stopName} className="px-4 text-center first:pl-0 last:pr-0">
                {next ? (
                  <>
                    <p className="font-mono text-5xl font-light tabular-nums tracking-tight">
                      {next.etaMinutes === 0 ? (
                        <span className="text-3xl">Now</span>
                      ) : (
                        <>
                          {next.etaMinutes}
                          <span className="ml-1 text-base font-normal text-muted">
                            min
                          </span>
                        </>
                      )}
                    </p>
                    {upcoming.length > 0 && (
                      <p className="mt-2 font-mono text-xs tabular-nums text-muted/60">
                        then {upcoming.map((d) => d.etaMinutes).join(", ")} min
                      </p>
                    )}
                  </>
                ) : (
                  <p className="py-4 text-sm text-muted/30">No trains</p>
                )}
                <p className="mt-3 text-xs text-muted">{stop.stopName}</p>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
