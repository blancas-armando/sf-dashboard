import { unstable_cache } from "next/cache";
import type { WeatherData } from "./types";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY!;
const BASE = "https://api.openweathermap.org/data/2.5";
const QUERY = `q=San Francisco,US&units=imperial&appid=${API_KEY}`;
const TZ = "America/Los_Angeles";
const FORECAST_SLOTS = 4;

type CurrentResponse = {
  main: { temp: number };
  weather: Array<{ main: string; description: string; icon: string }>;
  sys: { sunrise: number; sunset: number };
};

type ForecastResponse = {
  list: Array<{
    dt: number;
    pop: number;
    main: { temp: number; temp_max: number; temp_min: number };
  }>;
};

type WeatherSnapshot = Omit<WeatherData, "forecast" | "sun"> & {
  sunrise: number;
  sunset: number;
  slots: Array<{ dt: number; temp: number; pop: number }>;
};

// OWM's Current Weather `temp_min`/`temp_max` are observed station extremes
// right now — not today's highs and lows. For real daily bounds we pull the
// 5-day / 3-hour forecast and aggregate today's entries in Pacific time.
const fetchWeatherSnapshot = unstable_cache(
  async (): Promise<WeatherSnapshot> => {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE}/weather?${QUERY}`),
      fetch(`${BASE}/forecast?${QUERY}`),
    ]);

    if (!currentRes.ok) {
      throw new Error(`Weather API error: ${currentRes.status}`);
    }
    if (!forecastRes.ok) {
      throw new Error(`Forecast API error: ${forecastRes.status}`);
    }

    const current: CurrentResponse = await currentRes.json();
    const forecast: ForecastResponse = await forecastRes.json();
    const condition = current.weather[0];

    const todaySF = new Date().toLocaleDateString("en-US", { timeZone: TZ });
    const todayEntries = forecast.list.filter(
      (entry) =>
        new Date(entry.dt * 1000).toLocaleDateString("en-US", { timeZone: TZ }) ===
        todaySF
    );

    // Pool current reading with the remaining forecast so late-in-the-day
    // queries still reflect what actually happened earlier.
    const temps = [
      current.main.temp,
      ...todayEntries.flatMap((e) => [e.main.temp_max, e.main.temp_min]),
    ];

    return {
      temp: Math.round(current.main.temp),
      condition: condition.main,
      icon: condition.icon,
      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
      slots: forecast.list.map((e) => ({ dt: e.dt, temp: e.main.temp, pop: e.pop })),
    };
  },
  ["weather-snapshot"],
  { revalidate: 600 }
);

function formatTime(unixSeconds: number, withMinutes: boolean): string {
  return new Date(unixSeconds * 1000).toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: withMinutes ? "2-digit" : undefined,
  });
}

// Slots and sunrise/sunset are picked per request so they roll over on time
// rather than whenever the 10-minute cache happens to refresh.
export async function fetchWeather(): Promise<WeatherData> {
  const { sunrise, sunset, slots, ...current } = await fetchWeatherSnapshot();
  const now = Date.now() / 1000;

  const forecast = slots
    .filter((s) => s.dt > now)
    .slice(0, FORECAST_SLOTS)
    .map((s) => ({
      time: formatTime(s.dt, false),
      temp: Math.round(s.temp),
      rainChance: Math.round(s.pop * 100),
    }));

  // Show whichever comes next. Tomorrow's times are approximated as today's
  // + 24h, which is within a couple of minutes at SF's latitude.
  const DAY = 86400;
  const sunEvents = [
    { event: "Sunrise", at: sunrise },
    { event: "Sunset", at: sunset },
    { event: "Sunrise", at: sunrise + DAY },
    { event: "Sunset", at: sunset + DAY },
  ] as const;
  // The cache is at most 10 minutes old, so one of these is always ahead.
  const next = sunEvents.find((e) => e.at > now) ?? sunEvents[3];
  const sun = { event: next.event, time: formatTime(next.at, true) };

  return { ...current, forecast, sun };
}
