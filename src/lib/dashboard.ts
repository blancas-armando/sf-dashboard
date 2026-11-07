import { fetchTransitDepartures } from "./transit";
import { fetchWeather } from "./weather";
import { fetchGames } from "./games";
import { CHECKLIST_ITEMS } from "./checklist";
import type { DashboardData, GamesData } from "./types";

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Home games at Oracle Park or Chase Center pack the trains around 4th & King.
function homeGameAlert(data: GamesData | null): string | null {
  const game = data?.games.find((g) => g.isHome && g.status !== "final");
  if (!game) return null;
  const when = game.status === "in_progress" ? "now" : game.time;
  return `${game.team} vs ${game.opponent} ${when} · busy trains`;
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
    gameAlert: homeGameAlert(games),
    checklist: CHECKLIST_ITEMS,
    updatedAt: new Date().toLocaleTimeString("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}
