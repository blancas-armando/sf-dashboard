export type TransitDeparture = {
  etaMinutes: number;
};

export type TransitStop = {
  stopName: string;
  departures: TransitDeparture[];
};

export type TransitData = {
  stops: TransitStop[];
};

export type WeatherData = {
  temp: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
  forecast: ForecastSlot[];
  sun: { event: "Sunrise" | "Sunset"; time: string };
};

export type ForecastSlot = {
  time: string;
  temp: number;
  rainChance: number;
};

export type Game = {
  team: "Giants" | "Warriors";
  opponent: string;
  time: string;
  status: "scheduled" | "in_progress" | "final";
  isHome: boolean;
};

export type GamesData = {
  games: Game[];
};

export type ChecklistItem = {
  id: string;
  label: string;
};

export type DashboardData = {
  transit: TransitData | null;
  weather: WeatherData | null;
  gameAlert: string | null;
  checklist: ChecklistItem[];
  updatedAt: string;
};
