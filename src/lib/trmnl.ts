import type { DashboardData, Game } from "./types";

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function weatherIcon(condition: string): string {
  const map: Record<string, string> = {
    Clear: "wi-day-sunny",
    Sunny: "wi-day-sunny",
    Clouds: "wi-day-cloudy",
    Overcast: "wi-day-cloudy",
    Rain: "wi-day-rain",
    Drizzle: "wi-day-showers",
    Thunderstorm: "wi-day-thunderstorm",
    Snow: "wi-day-snow",
    Mist: "wi-day-fog",
    Fog: "wi-day-fog",
    Haze: "wi-day-haze",
  };
  const icon = map[condition] ?? "wi-day-cloudy";
  return `https://trmnl.com/images/plugins/weather/${icon}.svg`;
}

function buildTransitHero(data: DashboardData): string {
  if (!data.transit) {
    return `
    <div class="grid grid--cols-2">
      <div class="item col--span-2">
        <div class="meta"></div>
        <div class="content text--center">
          <span class="label label--gray-out">Transit unavailable</span>
        </div>
      </div>
    </div>`;
  }

  return `
    <div class="grid portrait:grid--cols-8 portrait:gap--xlarge">
      ${data.transit.stops
        .map((stop) => {
          const next = stop.departures[0];
          const upcoming = stop.departures.slice(1, 3);

          if (!next) {
            return `
        <div class="item col--span-3 portrait:col--span-4">
          <div class="meta"></div>
          <div class="content text--center">
            <span class="value value--xlarge lg:value--xxlarge label--gray-out">—</span>
            <span class="label">${esc(stop.stopName)}</span>
          </div>
        </div>`;
          }

          const heroValue = next.etaMinutes === 0 ? "Now" : `${next.etaMinutes}`;
          const heroSuffix = next.etaMinutes === 0 ? "" : " min";
          const alsoText =
            upcoming.length > 0
              ? `then ${upcoming.map((d) => d.etaMinutes).join(", ")} min`
              : "";

          return `
        <div class="item col--span-3 portrait:col--span-4">
          <div class="meta"></div>
          <div class="content text--center">
            <span class="value value--xxxlarge lg:value--giga value--tnums" data-fit-value="true">${heroValue}</span>
            <span class="label">${heroSuffix ? `minutes · ` : ""}${esc(stop.stopName)}</span>
            ${alsoText ? `<span class="label label--small label--gray-out">${alsoText}</span>` : ""}
          </div>
        </div>`;
        })
        .join("")}
    </div>`;
}

function buildWeatherCompact(data: DashboardData): string {
  if (!data.weather) {
    return `
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="label label--gray-out">Weather unavailable</span>
        </div>
      </div>`;
  }

  const w = data.weather;
  return `
      <div class="item grow">
        <div class="meta"></div>
        <div class="icon">
          <img class="w--[8cqw] h--[8cqw] portrait:w--[12cqw] portrait:h--[12cqw] lg:w--[6cqw] lg:h--[6cqw]" alt="${esc(w.condition)}" src="${weatherIcon(w.condition)}" />
        </div>
        <div class="content">
          <span class="value value--large lg:value--xlarge value--tnums" data-fit-value="true">${w.temp}°</span>
          <span class="label">${esc(w.condition)}</span>
        </div>
      </div>
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <div class="flex flex--row gap--xlarge portrait:gap">
            <div class="content">
              <span class="value value--xsmall lg:value--small value--tnums">${w.high}°</span>
              <span class="label">High</span>
            </div>
            <div class="content">
              <span class="value value--xsmall lg:value--small value--tnums">${w.low}°</span>
              <span class="label">Low</span>
            </div>
          </div>
        </div>
      </div>`;
}

function gameStatusText(game: Game): string {
  if (game.status === "scheduled") return game.time;
  if (game.status === "in_progress") return `LIVE ${esc(game.score ?? "")}`;
  return `Final ${esc(game.score ?? "")}`;
}

function buildGamesCompact(data: DashboardData): string {
  const homeGames = data.games?.games.filter((g) => g.isHome) ?? [];
  const awayGames = data.games?.games.filter((g) => !g.isHome) ?? [];

  if (homeGames.length === 0 && awayGames.length === 0) {
    return `
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small">None</span>
          <span class="label">No games today</span>
        </div>
      </div>`;
  }

  const parts: string[] = [];

  // Home games get emphasis -- they cause busy trains
  for (const game of homeGames) {
    parts.push(`
      <div class="rounded--small bg--gray-70 p--4 lg:p--8">
        <div class="item item--emphasis-3 grow">
          <div class="meta"></div>
          <div class="content">
            <span class="value value--xsmall lg:value--small">${esc(game.team)} vs ${esc(game.opponent)}</span>
            <div class="flex gap--small">
              <span class="label label--small label--underline">${gameStatusText(game)}</span>
              <span class="label label--small label--underline">BUSY TRAINS</span>
            </div>
          </div>
        </div>
      </div>`);
  }

  for (const game of awayGames) {
    parts.push(`
      <div class="item grow">
        <div class="meta"></div>
        <div class="content">
          <span class="value value--xsmall lg:value--small">${esc(game.team)} @ ${esc(game.opponent)}</span>
          <span class="label label--small">${gameStatusText(game)}</span>
        </div>
      </div>`);
  }

  return parts.join("");
}

function buildChecklistRow(data: DashboardData): string {
  return `
    <div class="grid grid--cols-${data.checklist.length}">
      ${data.checklist
        .map(
          (item) => `
        <div class="item">
          <div class="meta"></div>
          <div class="content text--center">
            <span class="value value--xsmall lg:value--small">☐</span>
            <span class="label label--small">${esc(item.label)}</span>
          </div>
        </div>`
        )
        .join("")}
    </div>`;
}

export function buildTrmnlMarkup(data: DashboardData): string {
  return `
<div class="view view--full">
  <div class="layout layout--col gap--space-between">

    <!-- HERO: Next N-Judah departures -->
    <div class="flex flex--col gap--small">
      <span class="label label--medium">NEXT N-JUDAH</span>
      ${buildTransitHero(data)}
    </div>

    <div class="divider"></div>

    <!-- CONTEXT: Weather + Game Day side by side -->
    <div class="grid portrait:grid--cols-8">
      <div class="col col--span-3 portrait:col--span-4 gap--medium">
        <span class="label label--medium">WEATHER</span>
        ${buildWeatherCompact(data)}
      </div>
      <div class="col col--span-3 portrait:col--span-4 gap--medium">
        <span class="label label--medium">GAME DAY</span>
        ${buildGamesCompact(data)}
      </div>
    </div>

    <div class="divider"></div>

    <!-- FOOTER: Checklist -->
    <div class="flex flex--col gap--small">
      <span class="label label--medium">BEFORE YOU LEAVE</span>
      ${buildChecklistRow(data)}
    </div>

  </div>
  <div class="title_bar">
    <h1 class="title">SF Dashboard</h1>
    <span class="instance">${esc(data.updatedAt)}</span>
  </div>
</div>`.trim();
}
