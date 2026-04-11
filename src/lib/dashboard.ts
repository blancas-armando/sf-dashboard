import { fetchTransitDepartures } from "./transit";
import { fetchWeather } from "./weather";
import { fetchGames } from "./games";
import { CHECKLIST_ITEMS } from "./checklist";
import type { DashboardData } from "./types";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [transit, weather, games] = await Promise.all([
    safe(fetchTransitDepartures),
    safe(fetchWeather),
    safe(fetchGames),
  ]);

  return {
    transit,
    weather,
    games,
    checklist: CHECKLIST_ITEMS,
    updatedAt: new Date().toLocaleTimeString("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}
