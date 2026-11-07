import { unstable_cache } from "next/cache";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import type { TransitData } from "./types";

const { FeedMessage, TripDescriptor, TripUpdate } = GtfsRealtimeBindings.transit_realtime;
type FeedTime = NonNullable<GtfsRealtimeBindings.transit_realtime.TripUpdate.IStopTimeEvent["time"]>;

const API_KEY = process.env.TRANSIT_511_API_KEY!;
const FEED_URL = `https://api.511.org/transit/tripupdates?api_key=${API_KEY}&agency=SF`;
const ROUTE = "N";

const STOPS = [
  { code: "15237", name: "4th & King" },
  { code: "15731", name: "Montgomery" },
];

const DROPPED_TRIPS = new Set([
  TripDescriptor.ScheduleRelationship.CANCELED,
  TripDescriptor.ScheduleRelationship.DELETED,
]);

function toUnixSeconds(time: FeedTime): number {
  return typeof time === "number" ? time : time.toNumber();
}

// "5:31" with no AM/PM: on a glanceable screen the hour is never ambiguous.
function formatClockTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000)
    .toLocaleTimeString("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit",
    })
    .replace(/\s?[AP]M$/, "");
}

// One GTFS-Realtime request covers every Muni stop, so refreshing once a minute
// stays within 511's limit of 60 requests/hour. The cache holds absolute
// arrival times; the countdown is computed per request so it stays correct
// however old the cached feed is.
const fetchArrivalTimes = unstable_cache(
  async (): Promise<Record<string, number[]>> => {
    const res = await fetch(FEED_URL);
    // Throw rather than return nothing so a 429 or outage keeps the last good
    // data in the cache instead of caching "no trains".
    if (!res.ok) throw new Error(`511 trip updates error: ${res.status}`);

    const feed = FeedMessage.decode(new Uint8Array(await res.arrayBuffer()));
    const arrivals: Record<string, number[]> = Object.fromEntries(
      STOPS.map((stop) => [stop.code, []])
    );

    for (const { tripUpdate } of feed.entity) {
      if (!tripUpdate || tripUpdate.trip.routeId !== ROUTE) continue;
      if (DROPPED_TRIPS.has(tripUpdate.trip.scheduleRelationship ?? 0)) continue;

      for (const update of tripUpdate.stopTimeUpdate ?? []) {
        if (!update.stopId || !(update.stopId in arrivals)) continue;
        if (update.scheduleRelationship === TripUpdate.StopTimeUpdate.ScheduleRelationship.SKIPPED) continue;
        const time = update.arrival?.time ?? update.departure?.time;
        if (time) arrivals[update.stopId].push(toUnixSeconds(time));
      }
    }

    return arrivals;
  },
  ["transit-gtfs-rt"],
  { revalidate: 60 }
);

export async function fetchTransitDepartures(): Promise<TransitData> {
  const now = Date.now() / 1000;
  const arrivals = await fetchArrivalTimes();

  return {
    stops: STOPS.map((stop) => ({
      stopName: stop.name,
      departures: arrivals[stop.code]
        .map((time) => ({
          etaMinutes: Math.round((time - now) / 60),
          arrivalTime: formatClockTime(time),
        }))
        .filter((d) => d.etaMinutes >= 0)
        .sort((a, b) => a.etaMinutes - b.etaMinutes)
        .slice(0, 4),
    })),
  };
}
