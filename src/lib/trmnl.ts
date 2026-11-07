import type { DashboardData, TransitStop } from "./types";

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

function buildTransitItem(stop: TransitStop): string {
  const label = `N-JUDAH &middot; ${esc(stop.stopName).toUpperCase()}`;
  const next = stop.departures[0];
  const upcoming = stop.departures.slice(1, 3);

  if (!next) {
    return `
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="label label--medium">${label}</span>
        <span class="value value--xlarge lg:value--giga">—</span>
        <span class="label label--small">No upcoming trains</span>
      </div>
    </div>`;
  }

  const heroValue = next.etaMinutes === 0 ? "Now" : `${next.etaMinutes} min`;
  const alsoText =
    upcoming.length > 0
      ? `then ${upcoming.map((d) => d.etaMinutes).join(", ")} min`
      : "";

  return `
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="label label--medium">${label}</span>
        <span class="value value--xlarge lg:value--giga value--tnums" data-fit-value="true">${heroValue}</span>
        ${alsoText ? `<span class="label">${alsoText}</span>` : ""}
      </div>
    </div>`;
}

function buildWeatherItem(data: DashboardData): string {
  if (!data.weather) {
    return `
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="label label--medium">WEATHER</span>
        <span class="label">Unavailable</span>
      </div>
    </div>`;
  }

  const w = data.weather;
  return `
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="label label--medium">WEATHER</span>
        <div class="flex flex--row gap--large items--center">
          <img class="w--[12cqw] h--[12cqw] lg:w--[8cqw] lg:h--[8cqw]" alt="${esc(w.condition)}" src="${weatherIcon(w.condition)}" />
          <div class="flex flex--col">
            <span class="value value--xlarge lg:value--xxlarge value--tnums">${w.temp}°</span>
            <span class="label">${esc(w.condition)}</span>
          </div>
        </div>
        <div class="flex flex--row gap--xlarge">
          <div class="flex flex--col">
            <span class="value value--xsmall value--tnums">${w.high}°</span>
            <span class="label label--small">High</span>
          </div>
          <div class="flex flex--col">
            <span class="value value--xsmall value--tnums">${w.low}°</span>
            <span class="label label--small">Low</span>
          </div>
        </div>
      </div>
    </div>`;
}

function buildForecastItem(data: DashboardData): string {
  if (!data.weather) {
    return `
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="label label--medium">FORECAST</span>
        <span class="label">Unavailable</span>
      </div>
    </div>`;
  }

  const { forecast, sun } = data.weather;
  const slots = forecast
    .map(
      (slot) => `
          <div class="flex flex--col">
            <span class="label label--small">${esc(slot.time)}</span>
            <span class="value value--xsmall value--tnums">${slot.temp}°</span>
            <span class="label label--small">${slot.rainChance}% rain</span>
          </div>`
    )
    .join("");

  return `
    <div class="item">
      <div class="meta"></div>
      <div class="content gap--medium">
        <span class="label label--medium">FORECAST</span>
        <div class="flex flex--row gap--large">${slots}
        </div>
        <span class="label">${sun.event} ${esc(sun.time)}</span>
      </div>
    </div>`;
}

export function buildTrmnlMarkup(data: DashboardData): string {
  const [stop1, stop2] = data.transit?.stops ?? [];

  const transitFallback = (name: string) => `
    <div class="item">
      <div class="meta"></div>
      <div class="content">
        <span class="label label--medium">N-JUDAH &middot; ${name}</span>
        <span class="label">Unavailable</span>
      </div>
    </div>`;

  return `
<div class="view view--full">
  <div class="layout layout--col layout--stretch gap--medium">
    <div class="grid grid--cols-2 gap--medium">
      ${stop1 ? buildTransitItem(stop1) : transitFallback("STOP 1")}
      ${stop2 ? buildTransitItem(stop2) : transitFallback("STOP 2")}
    </div>
    <div class="grid grid--cols-2 gap--medium">
      ${buildWeatherItem(data)}
      ${buildForecastItem(data)}
    </div>
  </div>
  <div class="title_bar">
    <h1 class="title">SF Dashboard</h1>
    <span class="instance">${data.gameAlert ? `${esc(data.gameAlert)} &middot; ` : ""}${esc(data.updatedAt)}</span>
  </div>
</div>`.trim();
}
