import { unstable_cache } from "next/cache";
import type { Game, GamesData } from "./types";

type EspnCompetitor = {
  homeAway: "home" | "away";
  team: { displayName: string };
};

type EspnEvent = {
  date: string;
  name: string;
  status: {
    type: {
      state: "pre" | "in" | "post";
    };
  };
  competitions: Array<{
    competitors: EspnCompetitor[];
  }>;
};

type EspnScoreboard = {
  events: EspnEvent[];
};

const ENDPOINTS = [
  {
    team: "Giants" as const,
    url: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
  },
  {
    team: "Warriors" as const,
    url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
  },
];

function formatGameTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
  });
}

function parseStatus(state: "pre" | "in" | "post"): Game["status"] {
  if (state === "pre") return "scheduled";
  if (state === "in") return "in_progress";
  return "final";
}

function findTeamGame(
  events: EspnEvent[],
  teamName: string
): Game | null {
  const event = events.find((e) =>
    e.competitions[0]?.competitors.some((c) =>
      c.team.displayName.includes(teamName)
    )
  );

  if (!event) return null;

  const comp = event.competitions[0];
  const homeTeam = comp.competitors.find((c) => c.homeAway === "home");
  const awayTeam = comp.competitors.find((c) => c.homeAway === "away");
  const isHome = homeTeam?.team.displayName.includes(teamName) ?? false;
  const opponent = isHome
    ? awayTeam?.team.displayName ?? "TBD"
    : homeTeam?.team.displayName ?? "TBD";

  const status = parseStatus(event.status.type.state);

  return {
    team: teamName as Game["team"],
    opponent,
    time: formatGameTime(event.date),
    status,
    isHome,
  };
}

export const fetchGames = unstable_cache(
  async (): Promise<GamesData> => {
    const results = await Promise.all(
      ENDPOINTS.map(async ({ team, url }) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          const data: EspnScoreboard = await res.json();
          return findTeamGame(data.events, team);
        } catch {
          return null;
        }
      })
    );

    return { games: results.filter((g): g is Game => g !== null) };
  },
  ["games"],
  // Only start times and live/final status matter for the busy-trains alert.
  { revalidate: 300 }
);
