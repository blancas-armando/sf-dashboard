import { unstable_cache } from "next/cache";
import type { WeatherData } from "./types";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY!;

type OwmResponse = {
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
};

export const fetchWeather = unstable_cache(
  async (): Promise<WeatherData> => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=San Francisco,US&units=imperial&appid=${API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Weather API error: ${res.status}`);
    }

    const data: OwmResponse = await res.json();
    const condition = data.weather[0];

    return {
      temp: Math.round(data.main.temp),
      condition: condition.main,
      icon: condition.icon,
      high: Math.round(data.main.temp_max),
      low: Math.round(data.main.temp_min),
    };
  },
  ["weather"],
  { revalidate: 600 }
);
