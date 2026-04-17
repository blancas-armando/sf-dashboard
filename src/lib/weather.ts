import { unstable_cache } from "next/cache";
import type { WeatherData } from "./types";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY!;
const BASE = "https://api.openweathermap.org/data/2.5";
const QUERY = `q=San Francisco,US&units=imperial&appid=${API_KEY}`;

type CurrentResponse = {
  main: { temp: number };
  weather: Array<{ main: string; description: string; icon: string }>;
};

type ForecastResponse = {
  list: Array<{
    dt: number;
    main: { temp: number; temp_max: number; temp_min: number };
  }>;
};

// OWM's Current Weather `temp_min`/`temp_max` are observed station extremes
// right now — not today's highs and lows. For real daily bounds we pull the
// 5-day / 3-hour forecast and aggregate today's entries in Pacific time.
export const fetchWeather = unstable_cache(
  async (): Promise<WeatherData> => {
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

    const todaySF = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
    });
    const todayEntries = forecast.list.filter((entry) => {
      const day = new Date(entry.dt * 1000).toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
      });
      return day === todaySF;
    });

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
    };
  },
  ["weather"],
  { revalidate: 600 }
);
