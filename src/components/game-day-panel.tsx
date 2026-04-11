import type { Game, GamesData } from "@/lib/types";
import { Panel } from "./panel";

function GameStatus({ game, suffix }: { game: Game; suffix?: string }) {
  const tail = suffix ? ` · ${suffix}` : "";

  if (game.status === "scheduled") return <>{game.time}{tail}</>;
  if (game.status === "in_progress") {
    return <span className="text-green-400">Live {game.score}{tail}</span>;
  }
  return <>Final {game.score}{tail}</>;
}

export function GameDayPanel({ data }: { data: GamesData | null }) {
  const homeGames = data?.games.filter((g) => g.isHome) ?? [];
  const awayGames = data?.games.filter((g) => !g.isHome) ?? [];

  return (
    <Panel title="Game Day">
      {!data ? (
        <p className="text-sm text-muted/50">Unable to load game data</p>
      ) : homeGames.length === 0 && awayGames.length === 0 ? (
        <p className="text-sm text-muted/30">No games today</p>
      ) : (
        <div className="space-y-3">
          {homeGames.length > 0 && (
            <div className="rounded-md border border-yellow-400/20 bg-yellow-400/5 px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wider text-yellow-400/90">
                Expect busy trains
              </p>
              {homeGames.map((game, i) => (
                <div key={i} className="mt-1.5">
                  <p className="text-sm">
                    <span className="font-medium">{game.team}</span>
                    <span className="text-muted"> vs </span>
                    {game.opponent}
                  </p>
                  <p className="text-xs text-muted/60">
                    <GameStatus game={game} suffix="Home" />
                  </p>
                </div>
              ))}
            </div>
          )}
          {awayGames.map((game, i) => (
            <div key={i}>
              <p className="text-sm">
                <span className="font-medium">{game.team}</span>
                <span className="text-muted"> @ </span>
                {game.opponent}
              </p>
              <p className="text-xs text-muted/60">
                <GameStatus game={game} />
              </p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
