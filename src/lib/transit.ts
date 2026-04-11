import { unstable_cache } from "next/cache";
import type { TransitData } from "./types";

const API_KEY = process.env.TRANSIT_511_API_KEY!;

const STOPS = [
  { code: "15237", name: "4th & King" },
  { code: "15731", name: "Montgomery" },
];

type SiriVisit = {
  MonitoredVehicleJourney: {
    LineRef: string;
    DirectionRef: string;
    PublishedLineName: string;
    DestinationName: string;
    MonitoredCall: {
      StopPointName: string;
      ExpectedArrivalTime: string;
      ExpectedDepartureTime: string | null;
    };
  };
};

type SiriResponse = {
  ServiceDelivery: {
    StopMonitoringDelivery: {
      MonitoredStopVisit: SiriVisit[];
    };
  };
};

async function fetchStop(stopCode: string): Promise<SiriVisit[]> {
  const url = `https://api.511.org/transit/StopMonitoring?api_key=${API_KEY}&agency=SF&stopcode=${stopCode}&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const text = await res.text();
  // 511 API sometimes returns BOM character
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const data: SiriResponse = JSON.parse(clean);

  return (
    data?.ServiceDelivery?.StopMonitoringDelivery?.MonitoredStopVisit ?? []
  );
}

function minutesUntil(isoTime: string): number {
  const diff = new Date(isoTime).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 60000));
}

export const fetchTransitDepartures = unstable_cache(
  async (): Promise<TransitData> => {
    const results = await Promise.all(
      STOPS.map(async (stop) => {
        const visits = await fetchStop(stop.code);

        const nJudahVisits = visits.filter(
          (v) => v.MonitoredVehicleJourney.LineRef === "N"
        );

        const departures = nJudahVisits
          .map((v) => {
            const journey = v.MonitoredVehicleJourney;
            const eta = minutesUntil(
              journey.MonitoredCall.ExpectedArrivalTime
            );
            return {
              routeName: "N",
              destination: journey.DestinationName,
              etaMinutes: eta,
            };
          })
          .filter((d) => d.etaMinutes >= 0)
          .sort((a, b) => a.etaMinutes - b.etaMinutes)
          .slice(0, 4);

        return { stopName: stop.name, departures };
      })
    );

    return { stops: results };
  },
  ["transit-departures"],
  { revalidate: 60 }
);
